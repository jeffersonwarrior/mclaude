"use strict";
/**
 * Utility functions to sanitize API error messages for better user experience
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeApiError = sanitizeApiError;
exports.isAuthError = isAuthError;
exports.isNetworkError = isNetworkError;
exports.getAuthErrorMessage = getAuthErrorMessage;
exports.getAuthProvider = getAuthProvider;
function sanitizeApiError(error) {
    if (typeof error === "string") {
        return error;
    }
    if (error === null || error === void 0 ? void 0 : error.message) {
        // Look for common API error patterns and simplify them
        var message = error.message;
        // Pattern for JSON API responses
        if (message.includes("{") && message.includes('"')) {
            try {
                var parsed = JSON.parse(message);
                if (parsed.error || parsed.message) {
                    return parsed.error || parsed.message;
                }
            }
            catch (_a) {
                // Not valid JSON, continue processing
            }
        }
        // Pattern for network errors
        if (message.includes("timeout") || message.includes("ETIMEDOUT")) {
            return "Request timed out";
        }
        if (message.includes("ENOTFOUND") || message.includes("ECONNREFUSED")) {
            return "Network connection failed";
        }
        // Pattern for HTTP status errors
        if (message.includes("401")) {
            return "Authentication failed - check your API key";
        }
        if (message.includes("403")) {
            return "Access forbidden - check your permissions";
        }
        if (message.includes("429")) {
            return "Rate limit exceeded - please try again later";
        }
        if (message.includes("500")) {
            return "API server error - please try again later";
        }
        // Return first sentence of error message
        var firstSentence = message.split(".")[0];
        return firstSentence.length > 80
            ? message.substring(0, 80) + "..."
            : firstSentence;
    }
    return "An unexpected error occurred";
}
function isAuthError(error) {
    // Check for ApiError status first
    if ((error === null || error === void 0 ? void 0 : error.status) === 401 || (error === null || error === void 0 ? void 0 : error.status) === 403) {
        return true;
    }
    // Check message content
    var message = (error === null || error === void 0 ? void 0 : error.message) || String(error);
    return (message.includes("401") ||
        message.includes("403") ||
        message.includes("Unauthorized") ||
        message.includes("Invalid API key") ||
        message.includes("Authentication failed") ||
        message.includes("Access forbidden") ||
        message.includes("MiniMax authentication failed") ||
        message.includes("synthetic authentication failed"));
}
function isNetworkError(error) {
    var message = (error === null || error === void 0 ? void 0 : error.message) || String(error);
    return (message.includes("ENOTFOUND") ||
        message.includes("ECONNREFUSED") ||
        message.includes("timeout"));
}
function getAuthErrorMessage(error) {
    // Check for specific status codes
    if ((error === null || error === void 0 ? void 0 : error.status) === 401) {
        return "Your API key appears to be invalid or expired";
    }
    if ((error === null || error === void 0 ? void 0 : error.status) === 403) {
        return "Access forbidden - you may have insufficient permissions or quota exceeded";
    }
    // Check message content for provider-specific errors
    var message = (error === null || error === void 0 ? void 0 : error.message) || String(error);
    if (message.includes("MiniMax")) {
        return "Your MiniMax API key appears to be invalid or expired";
    }
    if (message.includes("synthetic") || message.includes("Synthetic")) {
        return "Your Synthetic API key appears to be invalid or expired";
    }
    return "Authentication failed - your API key appears to be invalid or expired";
}
function getAuthProvider(error) {
    var message = (error === null || error === void 0 ? void 0 : error.message) || String(error);
    if (message.includes("MiniMax")) {
        return "minimax";
    }
    if (message.includes("synthetic") || message.includes("Synthetic")) {
        return "synthetic";
    }
    // Check error data for provider information
    if (error === null || error === void 0 ? void 0 : error.data) {
        var errorData = String(error.data);
        if (errorData.includes("MiniMax")) {
            return "minimax";
        }
        if (errorData.includes("synthetic") || errorData.includes("Synthetic")) {
            return "synthetic";
        }
    }
    return null;
}
