/**
 * Robust ModelSelector with automatic fallback mechanisms
 * Tries different UI approaches and falls back when errors occur
 */
import React from 'react';
import { ModelInfoImpl } from '../../models';
interface RobustModelSelectorProps {
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
export declare const RobustModelSelector: React.FC<RobustModelSelectorProps>;
export default RobustModelSelector;
//# sourceMappingURL=RobustModelSelector.d.ts.map