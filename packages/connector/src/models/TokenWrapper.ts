import { subscription, App, ForwardingPath } from "@1hive/connect-core"
import { SubscriptionCallback, SubscriptionResult } from "@1hive/connect-types"

import ERC20 from "./ERC20"
import TokenHolder from "./TokenHolder"
import WrappedToken from "./WrappedToken"
import { ITokenWrapperConnector } from "../types"

export default class TokenWrapper {
  #app: App
  #connector: ITokenWrapperConnector

  readonly address: string

  constructor(connector: ITokenWrapperConnector, app: App) {
    this.#connector = connector
    this.#app = app

    this.address = app.address
  }

  async disconnect() {
    await this.#connector.disconnect()
  }

  tokenHolderId(tokenHolderId: string): string {
    return `${this.address}-holder-${tokenHolderId}`
  }

  async id(): Promise<string> {
    const data = await this.#connector.tokenWrapper(this.address)
    return data.id
  }

  async orgAddress(): Promise<string> {
    const data = await this.#connector.tokenWrapper(this.address)
    return data.orgAddress
  }

  async token(): Promise<ERC20> {
    const data = await this.#connector.tokenWrapper(this.address)
    return this.#connector.ERC20(data.token)
  }

  async wrappedToken(): Promise<WrappedToken> {
    return this.#connector.wrappedToken(this.address)
  }

  async tokenHolder(tokenHolder: string): Promise<TokenHolder> {
    return this.#connector.tokenHolder(this.tokenHolderId(tokenHolder))
  }

  onTokenHolder(
    tokenHolder: string,
    callback?: SubscriptionCallback<TokenHolder>
  ): SubscriptionResult<TokenHolder> {
    return subscription<TokenHolder>(callback, (callback) =>
      this.#connector.onTokenHolder(tokenHolder, callback)
    )
  }

  async tokenHolders({ first = 1000, skip = 0 } = {}): Promise<TokenHolder[]> {
    return this.#connector.tokenHolders(this.address, first, skip)
  }

  onTokenHolders(
    { first = 1000, skip = 0 } = {},
    callback?: SubscriptionCallback<TokenHolder[]>
  ): SubscriptionResult<TokenHolder[]> {
    return subscription<TokenHolder[]>(callback, (callback) =>
      this.#connector.onTokenHolders(this.address, first, skip, callback)
    )
  }

  async deposit(
    amount: string,
    signerAddress: string
  ): Promise<ForwardingPath> {
    const intent = await this.#app.intent("deposit", [amount], {
      actAs: signerAddress,
    })

    return intent
  }

  async withdraw(
    amount: string,
    signerAddress: string
  ): Promise<ForwardingPath> {
    const intent = await this.#app.intent("withdraw", [amount], {
      actAs: signerAddress,
    })

    return intent
  }
}
