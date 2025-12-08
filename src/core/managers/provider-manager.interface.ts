export interface ProviderManagerInterface {
  enableProvider(provider: string): Promise<void>;
  disableProvider(provider: string): Promise<void>;
  setDefaultProvider(provider: string): Promise<void>;
  providerStatus(options?: { provider?: string }): Promise<void>;
  testProvider(provider: string): Promise<void>;
}
