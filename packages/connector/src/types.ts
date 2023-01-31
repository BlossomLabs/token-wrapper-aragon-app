import { SubscriptionCallback, SubscriptionHandler } from '@1hive/connect-types'

import ERC20 from './models/ERC20'
import WrappedToken from './models/WrappedToken'
import TokenHolder from './models/TokenHolder'

export interface TokenWrapperData {
  id: string
  orgAddress: string
  token: string
}

export interface WrappedTokenData {
  id: string
  name: string
  symbol: string
  decimals: string
  tokenId: string
  tokenWrapperId: string
  totalSupply: string
}

export interface TokenHolderData {
  id: string
  address: string
  tokenId: string
  balance: string
  tokenDecimals: string
  tokenSymbol: string
}

export interface ERC20Data {
  id: string
  name: string
  symbol: string
  decimals: string
}

export interface ITokenWrapperConnector {
  disconnect(): Promise<void>
  tokenWrapper(tokenWrapper: string): Promise<TokenWrapperData>
  onTokenWrapper(
    tokenWrapper: string,
    callback: SubscriptionCallback<TokenWrapperData>
  ): SubscriptionHandler
  wrappedToken(wrappedTokenId: string): Promise<WrappedToken>
  onWrappedToken(
    wrappedTokenId: string,
    callback: SubscriptionCallback<WrappedToken>
  ): SubscriptionHandler
  tokenHolder(tokenHolder: string): Promise<TokenHolder>
  onTokenHolder(
    tokenHolder: string,
    callback?: SubscriptionCallback<TokenHolder>
  ): SubscriptionHandler
  tokenHolders(
    tokenWrapper: string,
    first: number,
    skip: number
  ): Promise<TokenHolder[]>
  onTokenHolders(
    tokenWrapper: string,
    first: number,
    skip: number,
    callback: SubscriptionCallback<TokenHolder[]>
  ): SubscriptionHandler
  ERC20(tokenAddress: string): Promise<ERC20>
  onERC20(
    tokenAddress: string,
    callback: SubscriptionCallback<ERC20>
  ): SubscriptionHandler
}
