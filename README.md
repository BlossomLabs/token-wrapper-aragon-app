# Token Wrapper

Token Wrapper is an Aragon app offering a checkpointed ERC20 token interface that is usable in Aragon Voting applications. Its purpose is to bridge external, "vanilla" ERC20 tokens to a checkpointed token.

Token holders of the outside token have the ability to wrap and unwrap their tokens to gain or decrease balance in this wrapped token.

## 🚨 Security review status: audited

The `TokenWrapper` contract was [last professionally audited in 2020-01](https://github.com/aragonone/voting-connectors/blob/master/AUDIT.md).

This is a forked version with changes in the contract, we are awaiting another professional review.

## Caveats

In efforts to save gas costs and space to introduce the checkpointing, token amounts are limited to `uint192`. This should not pose a problem for any token, but as `uint192` supports a _very_ large range of numbers, but the TokenWrapper will stop accepting deposits once if it hits `2^192 - 1`.

## Installation Tutorial

You can use the following script in an [EVMcrispr terminal](https://evmcrispr.blossom.software).

```
connect <dao> (
  # The first step is to install the Token Wrapper into your DAO:
  install blossom-token-wrapper.open:new <token address> <wrapped token name> <wrapped token symbol>

  # Then, create a new Voting app instance powered by your Token Wrapper:
  install voting:new blossom-token-wrapper.open:new 50e16 15e16 7d

  # Next, create a permission for the TokenWrapper
  exec acl createPermission ANY_ENTITY blossom-token-wrapper.open:new @id(DUMMY_ROLE) voting:new
  
  # And finally, create a permission for the new Voting app instance
  grant ANY_ENTITY voting:new CREATE_VOTES_ROLE voting:new
)
```

The `token address` is the address of the ERC20 token you would like to "wrap" into an organizational token.

When you execute the script, you should be able to view the Token Wrapper app in the Aragon client. You can try it out by wrapping one of your tokens.

The voting install command above uses the following voting parameters, use your own:

- `50e16` or `500000000000000000`: 50% minimum support
- `15e16` or `150000000000000000`: 15% minimum approval
- `7d` or `604800`: Voting period of 7 days (604800 seconds)
