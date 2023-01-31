import { QueryResult } from '@1hive/connect-thegraph'

import TokenHolder from '../../models/TokenHolder'
import { TokenHolderData } from '../../types'

function buildTokenHolder(tokenHolder: any, connector: any): TokenHolder {
  const { id, address, token, balance } = tokenHolder

  const tokenHolderData: TokenHolderData = {
    id,
    address,
    tokenId: token.id,
    tokenDecimals: token.decimals,
    tokenSymbol: token.symbol,
    balance,
  }

  return new TokenHolder(tokenHolderData, connector)
}

export function parseTokenHolder(
  result: QueryResult,
  connector: any
): TokenHolder | null {
  const tokenHolder = result.data.tokenHolder
  return tokenHolder ? buildTokenHolder(tokenHolder, connector) : null
}

export function parseTokenHolders(
  result: QueryResult,
  connector: any
): TokenHolder | null {
  const tokenHolders = result.data.tokenHolders

  if (!tokenHolders) {
    throw new Error('Unable to parse token holders.')
  }

  return tokenHolders.map((tokenHolder: any) =>
    buildTokenHolder(tokenHolder, connector)
  )
}
