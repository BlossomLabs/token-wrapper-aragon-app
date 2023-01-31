const { assertRevert } = require('@1hive/contract-helpers-test/src/asserts')
const { latestBlock } = require('@1hive/contract-helpers-test/src/time')
const { newDao, installNewApp, encodeCallScript } = require('@1hive/contract-helpers-test/src/aragon-os')
const { bn, bigExp } = require('@1hive/contract-helpers-test/src/numbers')

const ERC20 = artifacts.require('ERC20Sample')
const ERC20Disablable = artifacts.require('ERC20Disablable')
const TokenWrapper = artifacts.require('TokenWrapper')

contract('TokenWrapper', ([_, root, holder, someone]) => {
  const wrappedName = 'Token Wrapper'
  const wrappedSymbol = 'TWR'
  const APP_ID = '0x1234123412341234123412341234123412341234123412341234123412341234'

  let dao, acl
  let tokenWrapperBase, tokenWrapper

  before('deploy base', async () => {
    ({ dao, acl } = await newDao(root))
    tokenWrapperBase = await TokenWrapper.new()
  })

  beforeEach('deploy dao with uninitialized token wrapper', async () => {
    tokenWrapper = await TokenWrapper.at(await installNewApp(dao, APP_ID, tokenWrapperBase.address, root))
  })

  describe('App is not initialized yet', () => {
    let erc20

    before(async () => {
      erc20 = await ERC20.new({ from: holder }) // mints 1M e 18 tokens to sender
    })

    it('initializes app', async () => {
      await tokenWrapper.initialize(erc20.address, wrappedName, wrappedSymbol)
      assert.isTrue(await tokenWrapper.hasInitialized(), 'not initialized')
      assert.equal(await tokenWrapper.depositedToken(), erc20.address, 'token address not initialized correctly')
      assert.equal(await tokenWrapper.name(), wrappedName, 'name not initialized correctly')
      assert.equal(await tokenWrapper.symbol(), wrappedSymbol, 'symbol not initialized correctly')
    })

    it('fails initializing if token is not contract', async () => {
      await assertRevert(tokenWrapper.initialize(someone, wrappedName, wrappedSymbol), 'TW_TOKEN_NOT_CONTRACT')
    })

    it('cannot be initialized twice', async () => {
      await tokenWrapper.initialize(erc20.address, wrappedName, wrappedSymbol)
      await assertRevert(tokenWrapper.initialize(erc20.address, wrappedName, wrappedSymbol), 'INIT_ALREADY_INITIALIZED')
    })
  })

  describe('Initialized with a proper token', () => {
    let erc20

    beforeEach('initialize token wrapper with token', async () => {
      erc20 = await ERC20.new({ from: holder }) // mints 1M e 18 tokens to sender
      await tokenWrapper.initialize(erc20.address, wrappedName, wrappedSymbol)
    })

    it('is an erc20', async () => {
      assert.equal(await tokenWrapper.name(), wrappedName)
      assert.equal(await tokenWrapper.symbol(), wrappedSymbol)
      assert.equal((await tokenWrapper.decimals()).toString(), (await erc20.decimals()).toString())
    })

    it('wraps the correct erc20 token', async () => {
      assert.equal(await tokenWrapper.depositedToken(), erc20.address)
    })

    context('account has no deposited tokens', () => {
      it('can mint tokens', async () => {
        const amount = bigExp(2, 18)
        const initialBlockNumber = bn(await latestBlock())

        await erc20.approve(tokenWrapper.address, amount, { from: holder })
        await tokenWrapper.deposit(amount, { from: holder })

        assert.equal((await tokenWrapper.balanceOfAt(holder, initialBlockNumber)).toString(), 0, 'Holder balance doesn\'t match')
        assert.equal((await tokenWrapper.totalSupplyAt(initialBlockNumber)).toString(), 0, 'Total supply doesn\'t match')
        assert.equal((await tokenWrapper.balanceOf(holder)).toString(), amount, 'Holder balance doesn\'t match')
        assert.equal((await tokenWrapper.totalSupply()).toString(), amount, 'Total supply doesn\'t match')
        assert.equal((await erc20.balanceOf(holder)).toString(), 999998e18)
      })
    })

    context('account has deposited tokens', () => {
      const wrappedAmount = bigExp(2, 18)

      beforeEach('deposit tokens', async () => {
        await erc20.approve(tokenWrapper.address, wrappedAmount, { from: holder })
        await tokenWrapper.deposit(wrappedAmount, { from: holder })
      })

      it('can burn tokens', async () => {
        const previousBalance = await tokenWrapper.balanceOf(holder)
        const previousSupply = await tokenWrapper.totalSupply()

        // Withdraw
        const unwrappedAmount = bigExp(1, 18)
        await tokenWrapper.withdraw(unwrappedAmount, { from: holder })

        assert.equal((await tokenWrapper.balanceOf(holder)).toString(), previousBalance.sub(unwrappedAmount), "Holder balance doesn't match")
        assert.equal((await tokenWrapper.totalSupply()).toString(), previousSupply.sub(unwrappedAmount), "Total supply doesn't match")

        assert.equal((await erc20.balanceOf(holder)).toString(), 999999e18)
      })
    })

    it('can not mint invalid amounts', async () => {
      await assertRevert(tokenWrapper.deposit(0, { from: holder }), 'TW_DEPOSIT_AMOUNT_ZERO')
      await assertRevert(tokenWrapper.deposit(bigExp(1, 30), { from: holder }), 'TW_TOKEN_TRANSFER_FROM_FAILED')
    })

    it('can not burn invalid amounts', async () => {
      await assertRevert(tokenWrapper.withdraw(0, { from: holder }), 'TW_WITHDRAW_AMOUNT_ZERO')
      await assertRevert(tokenWrapper.withdraw(bigExp(1, 30), { from: holder }), 'TW_INVALID_WITHDRAW_AMOUNT')
    })

    context('token recovery', () => {
      // Ensure there is a recovery vault set for the DAO
      beforeEach('set recovery vault', async () => {
        await dao.setRecoveryVaultAppId(await acl.appId(), { from: root })
      })

      it('describes deposited token as non-recoverable', async () => {
        assert.isFalse(await tokenWrapper.allowRecoverability(erc20.address))
      })

      it('describes other addresses as recoverable', async () => {
        assert.isTrue(await tokenWrapper.allowRecoverability(someone))
      })

      it('cannot recover deposited tokens into vault', async () => {
        await assertRevert(tokenWrapper.transferToVault(erc20.address, { from: someone }), 'RECOVER_DISALLOWED')
      })
    })
  })

  describe('Initialized with a failing token', () => {
    let erc20

    beforeEach('initialize token wrapper with disablable token', async () => {
      erc20 = await ERC20Disablable.new({ from: holder }) // mints 1M e 18 tokens to sender
      await tokenWrapper.initialize(erc20.address, wrappedName, wrappedSymbol)
    })

    it('can not mint if transfer fails', async () => {
      // approve
      const amount = bigExp(1, 18)
      await erc20.approve(tokenWrapper.address, amount, { from: holder })

      // disable token and try to mint
      await erc20.disable(true)
      await assertRevert(tokenWrapper.deposit(amount, { from: holder }), 'TW_TOKEN_TRANSFER_FROM_FAILED')
    })

    it('can not burn if transfer fails', async () => {
      // mint
      const amount = bigExp(1, 18)
      await erc20.approve(tokenWrapper.address, amount, { from: holder })
      await tokenWrapper.deposit(amount, { from: holder })

      // disable token and try to burn
      await erc20.disable(true)
      await assertRevert(tokenWrapper.withdraw(amount, { from: holder }), 'TW_TOKEN_TRANSFER_FAILED')
    })
  })
})
