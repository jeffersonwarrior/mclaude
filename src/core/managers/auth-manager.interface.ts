export interface AuthManagerInterface {
  validateProviderCredentials(): Promise<{
    synthetic: boolean;
    minimax: boolean;
  }>;
  checkAuth(options?: { provider?: string }): Promise<void>;
  testAuth(provider: string): Promise<{ valid: boolean; error?: string }>;
  resetAuth(provider: string): Promise<void>;
  refreshAuth(provider?: string): Promise<void>;
  formatAuthenticationError(provider: string, error: any): string;
  authStatus(options?: { format?: string }): Promise<void>;
}
