import { QueryResult } from '@1hive/connect-thegraph'

import { TokenWrapperData } from '../../types'

export function parseTokenWrapper(result: QueryResult): TokenWrapperData {
  const tokenWrapper = result.data.tokenWrapper

  if (!tokenWrapper) {
    throw new Error('Unable to parse disputable voting.')
  }

  const { id, orgAddress, token } = tokenWrapper

  return {
    id,
    orgAddress,
    token: token.id,
  }
}
