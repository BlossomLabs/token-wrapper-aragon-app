import { QueryResult } from "@1hive/connect-thegraph"

import WrappedToken from "../../models/WrappedToken"
import { WrappedTokenData } from "../../types"

function buildWrappedToken(wrappedToken: any): WrappedToken {
  const { id, name, symbol, decimals, token, tokenWrapper, totalSupply } =
    wrappedToken

  const wrappedTokenData: WrappedTokenData = {
    id,
    name,
    symbol,
    decimals,
    tokenId: token.id,
    tokenWrapperId: tokenWrapper.id,
    totalSupply: totalSupply,
  }

  return new WrappedToken(wrappedTokenData)
}

export function parseWrappedToken(result: QueryResult): WrappedToken | null {
  const wrappedToken = result.data.wrappedToken
  return wrappedToken ? buildWrappedToken(wrappedToken) : null
}
