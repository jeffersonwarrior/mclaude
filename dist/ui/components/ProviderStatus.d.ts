import React from 'react';
export interface ProviderStatus {
    provider: string;
    enabled: boolean;
    connected?: boolean;
    hasError?: boolean;
    errorMessage?: string;
    modelCount?: number;
    lastChecked?: Date;
}
export interface ProviderStatusProps {
    providers: ProviderStatus[];
    showDetails?: boolean;
    compact?: boolean;
}
export declare const ProviderStatusIndicator: React.FC<ProviderStatusProps>;
/**
 * Get summary status text for quick display
 */
export declare const getProviderSummary: (providers: ProviderStatus[]) => string;
//# sourceMappingURL=ProviderStatus.d.ts.map