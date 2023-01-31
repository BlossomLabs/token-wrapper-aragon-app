import { BigInt, Address, store } from '@graphprotocol/graph-ts'
import {
  Token as TokenEntity,
  TokenHolder as TokenHolderEntity,
  TokenWrapper as TokenWrapperEntity,
  WrappedToken as WrappedTokenEntity,
} from '../generated/schema'
import { ERC20 as ERC20Contract } from '../generated/templates/TokenWrapper/ERC20'
import {
  TokenWrapper as TokenWrapperContract,
  Deposit as DepositEvent,
  Withdrawal as WithdrawalEvent,
} from '../generated/templates/TokenWrapper/TokenWrapper'

export function buildERC20(address: Address): string {
  const id = address.toHexString()
  let token = TokenEntity.load(id)

  if (token === null) {
    const tokenContract = ERC20Contract.bind(address)
    token = new TokenEntity(id)
    token.name = tokenContract.name()
    token.symbol = tokenContract.symbol()
    token.decimals = tokenContract.decimals()
    token.save()
  }

  return token.id
}

export function getTokenWrapperEntity(address: Address): TokenWrapperEntity {
  const tokenWrapperId = address.toHexString()

  let tokenWrapperEntity = TokenWrapperEntity.load(tokenWrapperId)
  if (!tokenWrapperEntity) {
    tokenWrapperEntity = new TokenWrapperEntity(tokenWrapperId)

    const tokenWrapperContract = TokenWrapperContract.bind(address)
    tokenWrapperEntity.orgAddress = tokenWrapperContract.kernel()

    const depositedTokenAddress = tokenWrapperContract.depositedToken()
    tokenWrapperEntity.token = buildERC20(depositedTokenAddress)

    tokenWrapperEntity.save()

    let wrappedTokenEntity = WrappedTokenEntity.load(tokenWrapperId)
    if (!wrappedTokenEntity) {
      wrappedTokenEntity = new WrappedTokenEntity(tokenWrapperId)
      wrappedTokenEntity.name = tokenWrapperContract.name()
      wrappedTokenEntity.symbol = tokenWrapperContract.symbol()
      const token = TokenEntity.load(depositedTokenAddress.toHexString())
      wrappedTokenEntity.decimals = token ? token.decimals : 0
      wrappedTokenEntity.token = tokenWrapperEntity.token
      wrappedTokenEntity.totalSupply = BigInt.fromI32(0)
      wrappedTokenEntity.tokenWrapper = tokenWrapperId

      wrappedTokenEntity.save()
    }
  }

  return tokenWrapperEntity!
}

function buildTokenHolderEntityId(
  appAddress: Address,
  entity: Address
): string {
  return appAddress.toHexString() + '-holder-' + entity.toHexString()
}

export function handleDeposit(event: DepositEvent): void {
  const tokenHolderId = buildTokenHolderEntityId(
    event.address,
    event.params.entity
  )
  let tokenHolder = TokenHolderEntity.load(tokenHolderId)

  if (!tokenHolder) {
    tokenHolder = new TokenHolderEntity(tokenHolderId)
    tokenHolder.address = event.params.entity
    tokenHolder.token = event.address.toHexString()
    tokenHolder.balance = BigInt.fromI32(0)
  }

  tokenHolder.balance = tokenHolder.balance.plus(event.params.amount)

  const wrappedToken = WrappedTokenEntity.load(event.address.toHexString())
  wrappedToken.totalSupply = wrappedToken.totalSupply.plus(event.params.amount)

  wrappedToken.save()

  tokenHolder.save()
}

export function handleWithdrawal(event: WithdrawalEvent): void {
  const tokenHolderId = buildTokenHolderEntityId(
    event.address,
    event.params.entity
  )
  let tokenHolder = TokenHolderEntity.load(tokenHolderId)

  if (!tokenHolder) {
    tokenHolder = new TokenHolderEntity(tokenHolderId)
    tokenHolder.address = event.params.entity
    tokenHolder.token = event.address.toHexString()
    tokenHolder.balance = BigInt.fromI32(0)
  }
  tokenHolder.balance = tokenHolder.balance.minus(event.params.amount)

  if (tokenHolder.balance.equals(BigInt.fromI32(0))) {
    store.remove('TokenHolder', tokenHolderId)
  } else {
    tokenHolder.save()
  }

  const wrappedToken = WrappedTokenEntity.load(event.address.toHexString())
  wrappedToken.totalSupply = wrappedToken.totalSupply.minus(event.params.amount)

  wrappedToken.save()
}
