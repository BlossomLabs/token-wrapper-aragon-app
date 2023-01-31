import { ITokenWrapperConnector, TokenHolderData } from '../types'
import { formatBn } from '../helpers'
import ERC20 from './ERC20'

export default class TokenHolder {
  #connector: ITokenWrapperConnector

  readonly id: string
  readonly address: string
  readonly tokenId: string
  readonly balance: string
  readonly tokenSymbol: string
  readonly tokenDecimals: string

  constructor(data: TokenHolderData, connector: ITokenWrapperConnector) {
    this.#connector = connector

    this.id = data.id
    this.address = data.address
    this.tokenId = data.tokenId
    this.balance = data.balance
    this.tokenSymbol = data.tokenSymbol
    this.tokenDecimals = data.tokenDecimals
  }

  get formattedBalance(): string {
    return formatBn(this.balance, this.tokenDecimals)
  }

  async token(): Promise<ERC20> {
    return this.#connector.ERC20(this.tokenId)
  }
}
