import { Address } from '@graphprotocol/graph-ts'
import { getTokenWrapperEntity } from './TokenWrapper'

/*
 * Called when an app proxy is detected.
 *
 * Return the name of a data source template if you would like to create it for a given appId.
 * Return null otherwise.
 *
 * The returned name is used to instantiate a template declared in the subgraph manifest file,
 * which must have the same name.
 */
export function getTemplateForApp(appId: string): string | null {
  const TOKEN_WRAPPER_OPEN =
    '0x550fca0bfe67deacb87df417a4b4758db3152410deaad1357183d293251bb9a6'

  if (appId == TOKEN_WRAPPER_OPEN) {
    return 'TokenWrapper'
  } else {
    return null
  }
}

export function onOrgTemplateCreated(orgAddress: Address): void {}
export function onAppTemplateCreated(appAddress: Address, appId: string): void {
  getTokenWrapperEntity(appAddress)
}
export function onTokenTemplateCreated(tokenAddress: Address): void {}
