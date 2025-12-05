/**
 * Utility functions to sanitize API error messages for better user experience
 */
export declare function sanitizeApiError(error: any): string;
export declare function isAuthError(error: any): boolean;
export declare function isNetworkError(error: any): boolean;
export declare function getAuthErrorMessage(error: any): string;
export declare function getAuthProvider(error: any): "synthetic" | "minimax" | null;
