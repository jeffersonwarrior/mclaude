import React from 'react';
import { ModelInfoImpl } from '../../models';
interface ModelSelectorProps {
    models: ModelInfoImpl[];
    onSelect: (regularModel: ModelInfoImpl | null, thinkingModel: ModelInfoImpl | null) => void;
    onCancel: () => void;
    searchPlaceholder?: string;
    initialRegularModel?: ModelInfoImpl | null;
    initialThinkingModel?: ModelInfoImpl | null;
    enabledProviders?: string[];
    authenticationError?: string | null;
    providerStatus?: {
        synthetic: {
            available: boolean;
            lastChecked?: Date;
        };
        minimax: {
            available: boolean;
            lastChecked?: Date;
        };
    };
}
export declare const ModelSelector: React.FC<ModelSelectorProps>;
export {};
//# sourceMappingURL=ModelSelector.d.ts.map