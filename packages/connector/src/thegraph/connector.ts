import { providers as ethersProviders } from "ethers"
import { GraphQLWrapper, QueryResult } from "@1hive/connect-thegraph"
import { SubscriptionCallback, SubscriptionHandler } from "@1hive/connect-types"

import { TokenWrapperData, ITokenWrapperConnector } from "../types"
import ERC20 from "../models/ERC20"
import TokenHolder from "../models/TokenHolder"
import WrappedToken from "../models/WrappedToken"
import * as queries from "./queries"
import {
  parseTokenHolder,
  parseTokenHolders,
  parseTokenWrapper,
  parseERC20,
  parseWrappedToken,
} from "./parsers"

export function subgraphUrlFromChainId(chainId: number) {
  if (chainId === 1) {
    return "https://api.thegraph.com/subgraphs/name/blossomlabs/aragon-bl-token-wrapper"
  }
  if (chainId === 100) {
    return "https://api.thegraph.com/subgraphs/name/blossomlabs/aragon-bl-token-wrapper-gnosis"
  }
  return null
}

type TokenWrapperConnectorTheGraphConfig = {
  pollInterval?: number
  subgraphUrl?: string
  verbose?: boolean
}

export default class TokenWrapperConnectorTheGraph
  implements ITokenWrapperConnector
{
  #gql: GraphQLWrapper
  #ethersProvider: ethersProviders.Provider

  constructor(
    config: TokenWrapperConnectorTheGraphConfig,
    provider: ethersProviders.Provider
  ) {
    if (!config.subgraphUrl) {
      throw new Error(
        "DisputableVotingConnectorTheGraph requires subgraphUrl to be passed."
      )
    }

    this.#gql = new GraphQLWrapper(config.subgraphUrl, {
      pollInterval: config.pollInterval,
      verbose: config.verbose,
    })

    this.#ethersProvider = provider
  }

  async disconnect() {
    this.#gql.close()
  }

  async tokenWrapper(tokenWrapper: string): Promise<TokenWrapperData> {
    return this.#gql.performQueryWithParser<TokenWrapperData>(
      queries.GET_TOKEN_WRAPPER("query"),
      { tokenWrapper },
      (result: QueryResult) => parseTokenWrapper(result)
    )
  }

  onTokenWrapper(
    tokenWrapper: string,
    callback: SubscriptionCallback<TokenWrapperData>
  ): SubscriptionHandler {
    return this.#gql.subscribeToQueryWithParser<TokenWrapperData>(
      queries.GET_TOKEN_WRAPPER("subscription"),
      { tokenWrapper },
      callback,
      (result: QueryResult) => parseTokenWrapper(result)
    )
  }

  async wrappedToken(wrappedToken: string): Promise<WrappedToken> {
    return this.#gql.performQueryWithParser<WrappedToken>(
      queries.GET_WRAPPED_TOKEN("query"),
      { wrappedToken },
      (result: QueryResult) => parseWrappedToken(result)
    )
  }

  onWrappedToken(
    wrappedToken: string,
    callback: SubscriptionCallback<WrappedToken>
  ): SubscriptionHandler {
    return this.#gql.subscribeToQueryWithParser<WrappedToken>(
      queries.GET_WRAPPED_TOKEN("subscription"),
      { wrappedToken },
      callback,
      (result: QueryResult) => parseWrappedToken(result)
    )
  }

  async tokenHolder(tokenHolder: string): Promise<TokenHolder> {
    return this.#gql.performQueryWithParser<TokenHolder>(
      queries.GET_TOKEN_HOLDER("query"),
      { tokenHolder },
      (result: QueryResult) => parseTokenHolder(result, this)
    )
  }

  onTokenHolder(
    tokenHolder: string,
    callback: SubscriptionCallback<TokenHolder>
  ): SubscriptionHandler {
    return this.#gql.subscribeToQueryWithParser<TokenHolder>(
      queries.GET_TOKEN_HOLDER("subscription"),
      { tokenHolder },
      callback,
      (result: QueryResult) => parseTokenHolder(result, this)
    )
  }

  async tokenHolders(
    tokenWrapper: string,
    first: number,
    skip: number
  ): Promise<TokenHolder[]> {
    return this.#gql.performQueryWithParser<TokenHolder[]>(
      queries.ALL_TOKEN_HOLDERS("query"),
      { tokenWrapper, first, skip },
      (result: QueryResult) => parseTokenHolders(result, this)
    )
  }

  onTokenHolders(
    token: string,
    first: number,
    skip: number,
    callback: SubscriptionCallback<TokenHolder[]>
  ): SubscriptionHandler {
    return this.#gql.subscribeToQueryWithParser<TokenHolder[]>(
      queries.ALL_TOKEN_HOLDERS("subscription"),
      { token, first, skip },
      callback,
      (result: QueryResult) => parseTokenHolders(result, this)
    )
  }

  async ERC20(tokenAddress: string): Promise<ERC20> {
    return this.#gql.performQueryWithParser(
      queries.GET_ERC20("query"),
      { tokenAddress },
      (result: QueryResult) => parseERC20(result, this.#ethersProvider)
    )
  }

  onERC20(
    tokenAddress: string,
    callback: SubscriptionCallback<ERC20>
  ): SubscriptionHandler {
    return this.#gql.subscribeToQueryWithParser<ERC20>(
      queries.GET_ERC20("subscription"),
      { tokenAddress },
      callback,
      (result: QueryResult) => parseERC20(result, this.#ethersProvider)
    )
  }
}
