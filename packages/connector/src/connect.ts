import { createAppConnector } from '@1hive/connect-core'
import TokenWrapper from './models/TokenWrapper'
import TokenWrapperConnectorTheGraph, {
  subgraphUrlFromChainId,
} from './thegraph/connector'

type Config = {
  pollInterval?: number
  subgraphUrl?: string
}

export default createAppConnector<TokenWrapper, Config>(
  ({ app, config, connector, network, orgConnector, verbose }) => {
    if (connector !== 'thegraph') {
      console.warn(
        `Connector unsupported: ${connector}. Using "thegraph" instead.`
      )
    }

    const subgraphUrl =
      config.subgraphUrl ?? subgraphUrlFromChainId(network.chainId) ?? undefined

    let pollInterval
    if (orgConnector.name === 'thegraph') {
      pollInterval =
        config?.pollInterval ?? orgConnector.config?.pollInterval ?? undefined
    }

    const connectorTheGraph = new TokenWrapperConnectorTheGraph(
      {
        pollInterval,
        subgraphUrl,
        verbose,
      },
      app.provider
    )

    return new TokenWrapper(connectorTheGraph, app)
  }
)
