import gql from 'graphql-tag'

export const GET_TOKEN_WRAPPER = (type: string) => gql`
  ${type} TokenWrapper($tokenWrapper: String!) {
    tokenWrapper(id: $tokenWrapper) {
      id
      token {
        id      
      }
      orgAddress
    }
  }
`

export const GET_TOKEN_HOLDER = (type: string) => gql`
  ${type} TokenHolder($tokenHolder: String!) {
    tokenHolder(id: $tokenHolder) {
      id
      address
      token {
        id
        symbol
        decimals
      }
      balance
    }
  }
`
export const ALL_TOKEN_HOLDERS = (type: string) => gql`
  ${type} tokenHolders($token: String!, $first: Int!, $skip: Int!) {
    tokenHolders(where: {
      token: $token
    }, first: $first, skip: $skip) {
      id
      address
      token {
        id
        symbol
        decimals
      }
      balance
    }
  }
`

export const GET_WRAPPED_TOKEN = (type: string) => gql`
  ${type} WrappedToken($wrappedToken: String!) {
    wrappedToken(id: $wrappedToken) {
      id
      name
      symbol
      decimals
      token {
        id      
      }
      tokenWrapper {
        id
      }
      totalSupply
    }
  }
`

export const GET_ERC20 = (type: string) => gql`
  ${type} ERC20($tokenAddress: String!) {
    token(id: $tokenAddress) {
      id
      name
      symbol
      decimals
    }
  }
`
