"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelInfoImpl = void 0;
exports.createModelInfo = createModelInfo;
var ModelInfoImpl = /** @class */ (function () {
    function ModelInfoImpl(data) {
        var result = require("./types").ModelInfoSchema.safeParse(data);
        if (!result.success) {
            throw new Error("Invalid model data: ".concat(result.error.message));
        }
        var modelData = result.data;
        this.id = modelData.id;
        this.object = modelData.object;
        this.created = modelData.created;
        this.owned_by = modelData.owned_by;
        this.provider = modelData.provider;
        this.always_on = modelData.always_on;
        this.hugging_face_id = modelData.hugging_face_id;
        this.name = modelData.name;
        this.input_modalities = modelData.input_modalities;
        this.output_modalities = modelData.output_modalities;
        this.context_length = modelData.context_length;
        this.max_output_length = modelData.max_output_length;
        this.pricing = modelData.pricing;
        this.quantization = modelData.quantization;
        this.supported_sampling_parameters =
            modelData.supported_sampling_parameters;
        this.supported_features = modelData.supported_features;
        this.openrouter = modelData.openrouter;
        this.datacenters = modelData.datacenters;
    }
    ModelInfoImpl.prototype.getDisplayName = function () {
        return this.name || this.id;
    };
    ModelInfoImpl.prototype.getProvider = function () {
        if (this.provider) {
            return this.provider;
        }
        // Fallback to parsing from ID for backward compatibility
        if (this.id.includes(":")) {
            return this.id.split(":", 1)[0] || "unknown";
        }
        return "unknown";
    };
    /**
     * Get provider-specific capabilities
     */
    ModelInfoImpl.prototype.getProviderCapabilities = function () {
        var capabilities = [];
        // General capabilities
        if (this.input_modalities && this.input_modalities.length > 0) {
            capabilities.push.apply(capabilities, this.input_modalities.map(function (modality) { return "input:".concat(modality); }));
        }
        if (this.output_modalities && this.output_modalities.length > 0) {
            capabilities.push.apply(capabilities, this.output_modalities.map(function (modality) { return "output:".concat(modality); }));
        }
        // Provider-specific capabilities
        var provider = this.getProvider();
        switch (provider) {
            case "synthetic":
                capabilities.push("anthropic-compatible", "openai-compatible");
                break;
            case "minimax":
                capabilities.push("minimax-native", "anthropic-compatible");
                break;
        }
        // Add supported features
        if (this.supported_features && this.supported_features.length > 0) {
            capabilities.push.apply(capabilities, this.supported_features);
        }
        return __spreadArray([], new Set(capabilities), true); // Remove duplicates
    };
    /**
     * Check if model supports a specific capability
     */
    ModelInfoImpl.prototype.hasCapability = function (capability) {
        return this.getProviderCapabilities().includes(capability);
    };
    /**
     * Get provider tag for display
     */
    ModelInfoImpl.prototype.getProviderTag = function () {
        var provider = this.getProvider();
        var providerName = provider.trim() || "unknown";
        switch (providerName) {
            case "synthetic":
                return "🤖 Synthetic";
            case "minimax":
                return "⚡ MiniMax";
            default:
                return "\u2753 ".concat(providerName);
        }
    };
    /**
     * Check if this is a Claude-compatible model
     */
    ModelInfoImpl.prototype.isClaudeCompatible = function () {
        var provider = this.getProvider();
        return (provider === "synthetic" ||
            provider === "minimax" ||
            this.hasCapability("anthropic-compatible"));
    };
    ModelInfoImpl.prototype.getModelName = function () {
        var _this = this;
        return (this.name ||
            (function () {
                if (_this.id.includes(":")) {
                    return _this.id.split(":", 2)[1] || _this.id;
                }
                return _this.id;
            })());
    };
    ModelInfoImpl.prototype.toJSON = function () {
        return {
            id: this.id,
            object: this.object,
            created: this.created,
            owned_by: this.owned_by,
            provider: this.provider,
            always_on: this.always_on,
            hugging_face_id: this.hugging_face_id,
            name: this.name,
            input_modalities: this.input_modalities,
            output_modalities: this.output_modalities,
            context_length: this.context_length,
            max_output_length: this.max_output_length,
            pricing: this.pricing,
            quantization: this.quantization,
            supported_sampling_parameters: this.supported_sampling_parameters,
            supported_features: this.supported_features,
            openrouter: this.openrouter,
            datacenters: this.datacenters,
        };
    };
    return ModelInfoImpl;
}());
exports.ModelInfoImpl = ModelInfoImpl;
function createModelInfo(data) {
    return new ModelInfoImpl(data);
}
