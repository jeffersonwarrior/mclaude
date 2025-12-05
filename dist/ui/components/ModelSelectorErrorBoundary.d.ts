import React from 'react';
interface ModelSelectorErrorBoundaryProps {
    children: React.ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
    onCancel?: () => void;
}
/**
 * Error boundary with retry functionality specifically for ModelSelector
 */
export declare const ModelSelectorErrorBoundary: React.FC<ModelSelectorErrorBoundaryProps>;
export {};
//# sourceMappingURL=ModelSelectorErrorBoundary.d.ts.map