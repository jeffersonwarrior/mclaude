"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = exports.ModelValidationError = exports.ModelInfoSchema = void 0;
var zod_1 = require("zod");
exports.ModelInfoSchema = zod_1.z.object({
    id: zod_1.z.string().describe("Model identifier"),
    object: zod_1.z.string().default("model").describe("Object type"),
    created: zod_1.z.number().optional().describe("Creation timestamp"),
    owned_by: zod_1.z.string().optional().describe("Model owner"),
    provider: zod_1.z.string().optional().describe("Model provider"),
    always_on: zod_1.z.boolean().optional().describe("Always available"),
    hugging_face_id: zod_1.z.string().optional().describe("Hugging Face model ID"),
    name: zod_1.z.string().optional().describe("Model display name"),
    input_modalities: zod_1.z
        .array(zod_1.z.string())
        .optional()
        .describe("Supported input modalities"),
    output_modalities: zod_1.z
        .array(zod_1.z.string())
        .optional()
        .describe("Supported output modalities"),
    context_length: zod_1.z.number().optional().describe("Context window size"),
    max_output_length: zod_1.z.number().optional().describe("Maximum output tokens"),
    pricing: zod_1.z
        .object({
        prompt: zod_1.z.string().optional(),
        completion: zod_1.z.string().optional(),
        image: zod_1.z.string().optional(),
        request: zod_1.z.string().optional(),
        input_cache_reads: zod_1.z.string().optional(),
        input_cache_writes: zod_1.z.string().optional(),
    })
        .optional()
        .describe("Pricing information"),
    quantization: zod_1.z.string().optional().describe("Model quantization"),
    supported_sampling_parameters: zod_1.z
        .array(zod_1.z.string())
        .optional()
        .describe("Supported sampling parameters"),
    supported_features: zod_1.z
        .array(zod_1.z.string())
        .optional()
        .describe("Supported features"),
    openrouter: zod_1.z
        .object({
        slug: zod_1.z.string().optional(),
    })
        .optional()
        .describe("OpenRouter metadata"),
    datacenters: zod_1.z
        .array(zod_1.z.object({
        country_code: zod_1.z.string().optional(),
    }))
        .optional()
        .describe("Available datacenters"),
});
var ModelValidationError = /** @class */ (function (_super) {
    __extends(ModelValidationError, _super);
    function ModelValidationError(message, cause) {
        var _this = _super.call(this, message) || this;
        _this.cause = cause;
        _this.name = "ModelValidationError";
        return _this;
    }
    return ModelValidationError;
}(Error));
exports.ModelValidationError = ModelValidationError;
var ApiError = /** @class */ (function (_super) {
    __extends(ApiError, _super);
    function ApiError(message, status, response) {
        var _this = _super.call(this, message) || this;
        _this.status = status;
        _this.response = response;
        _this.name = "ApiError";
        return _this;
    }
    return ApiError;
}(Error));
exports.ApiError = ApiError;
