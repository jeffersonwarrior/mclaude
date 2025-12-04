/**
 * Fallback Model Selection methods
 * Provides multiple approaches when primary UI fails
 */
import React from 'react';
import { ModelInfoImpl } from '../../models';
interface FallbackModelSelectorProps {
    models: ModelInfoImpl[];
    onSelect: (regularModel: ModelInfoImpl | null, thinkingModel: ModelInfoImpl | null) => void;
    onCancel: () => void;
}
export declare const SimpleNumberedListSelector: React.FC<FallbackModelSelectorProps>;
export declare const MinimalArrowSelector: React.FC<FallbackModelSelectorProps>;
export declare const ConsoleBasedSelector: ({ models, onSelect, onCancel }: FallbackModelSelectorProps) => import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=FallbackModelSelector.d.ts.map