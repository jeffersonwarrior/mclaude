import {
  getProviderSummary,
  type ProviderStatus
} from '../src/ui/components/ProviderStatus';

describe('ProviderStatus Component Logic', () => {
  const mockProviders: ProviderStatus[] = [
    {
      provider: 'synthetic',
      enabled: true,
      connected: true,
      modelCount: 15,
      lastChecked: new Date('2023-12-01T10:00:00Z'),
    },
    {
      provider: 'minimax',
      enabled: true,
      connected: false,
      modelCount: 8,
      lastChecked: new Date('2023-12-01T10:01:00Z'),
    },
    {
      provider: 'auto',
      enabled: false,
      modelCount: 0,
    },
  ];

  describe('getProviderSummary', () => {
    it('should provide accurate summary for mixed states', () => {
      const summary = getProviderSummary(mockProviders);
      expect(summary).toBe('2/3 enabled, 1 connected');
    });

    it('should handle all enabled and connected', () => {
      const allConnected: ProviderStatus[] = [
        { provider: 'synthetic', enabled: true, connected: true },
        { provider: 'minimax', enabled: true, connected: true },
      ];

      const summary = getProviderSummary(allConnected);
      expect(summary).toBe('2/2 enabled');
    });

    it('should handle error states in summary', () => {
      const withErrors: ProviderStatus[] = [
        { provider: 'synthetic', enabled: true, connected: true },
        { provider: 'minimax', enabled: true, hasError: true },
      ];

      const summary = getProviderSummary(withErrors);
      expect(summary).toBe('2/2 enabled, 1 with errors');
    });

    it('should handle all disabled', () => {
      const allDisabled: ProviderStatus[] = [
        { provider: 'synthetic', enabled: false },
        { provider: 'minimax', enabled: false },
      ];

      const summary = getProviderSummary(allDisabled);
      expect(summary).toBe('0/2 enabled');
    });
  });
});