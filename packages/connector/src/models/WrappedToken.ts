import { WrappedTokenData } from "../types"

export default class WrappedToken {
  readonly id: string
  readonly name: string
  readonly symbol: string
  readonly decimals: string
  readonly tokenId: string
  readonly tokenWrapperId: string
  readonly totalSupply: string

  constructor(data: WrappedTokenData) {
    this.id = data.id
    this.name = data.name
    this.symbol = data.symbol
    this.decimals = data.decimals
    this.tokenId = data.tokenId
    this.tokenWrapperId = data.tokenWrapperId
    this.totalSupply = data.totalSupply
  }
}
