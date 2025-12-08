# MClaude Working Models Guide

## Synthetic API Models (hf: prefix)

### ✅ **Confirmed Working Models**
The following models are tested and confirmed working through the TensorZero proxy (as of v1.8.6):

#### **Chat & General Purpose**
- `hf:zai-org/GLM-4.6` - GLM-4.6 conversation model
- `hf:deepseek-ai/DeepSeek-V3-0324` - DeepSeek V3 latest version
- `hf:deepseek-ai/DeepSeek-R1-0528` - DeepSeek R1 reasoning model
- `hf:deepseek-ai/DeepSeek-V3.1` - DeepSeek V3 earlier version

#### **Large Language Models**
- `hf:MiniMaxAI/MiniMax-M2` - MiniMax M2 large model
- `hf:moonshotai/Kimi-K2-Thinking` - Kimi K2 thinking variant
- `hf:meta-llama/Llama-3.3-70B-Instruct` - Llama 3.3 instruction model (70B)

#### **Specialized Models**
- `hf:Qwen/Qwen3-VL-235B-A22B-Instruct` - Qwen3 Vision-Language multimodal (235B)
- `hf:Qwen/Qwen3-Coder-480B-A35B-Instruct` - Qwen3 Code generation model (480B)
- `hf:meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8` - Llama 4 Maverick instruction model

### ❌ **Known Non-Working Models**
These models appear in the Synthetic API catalog but return 404 errors when used:

- `hf:deepseek-ai/DeepSeek-R1` - Legacy version (use DeepSeek-R1-0528 instead)
- `hf:meta-llama/Llama-3.1-405B-Instruct` - May be deprecated/moved
- `hf:meta-llama/Llama-3.1-70B-Instruct` - May be deprecated/moved
- `hf:meta-llama/Llama-3.1-8B-Instruct` - May be deprecated/moved
- `hf:meta-llama/Llama-4-Scout-17B-16E-Instruct` - May be deprecated/moved
- `hf:moonshotai/Kimi-K2-Instruct` - Use Kimi-K2-Thinking instead
- `hf:openai/gpt-oss-120b` - API formatting issues

### ⚠️ **Models with Issues**
- `hf:openai/gpt-oss-120b` - Returns 400 error due to API formatting issues

## MiniMax Models (minimax: prefix)
- `minimax:MiniMax-M2` - Direct MiniMax API routing

## Usage Examples

### Working Model Requests
```bash
# Tested and confirmed working
mclaude --model hf:zai-org/GLM-4.6
mclaude --model hf:deepseek-ai/DeepSeek-V3-0324
mclaude --model hf:meta-llama/Llama-3.3-70B-Instruct
mclaude --model hf:Qwen/Qwen3-Coder-480B-A35B-Instruct

# MiniMax direct
mclaude --model minimax:MiniMax-M2

# Synthetic prefix (alternative format)
mclaude --model synthetic:zai-org/GLM-4.6
mclaude --model synthetic:deepseek-ai/DeepSeek-V3-0324
```

### Quick Model Testing
```bash
# Test a model quickly
echo "Hello" | mclaude --model hf:zai-org/GLM-4.6 --dangerously-skip-permissions

# Check available models in proxy
curl -s http://127.0.0.1:9313/v1/models | jq '.data[].id'
```

## Model Selection Strategy

### **For General Chat**
1. First choice: `hf:zai-org/GLM-4.6` (fast, reliable)
2. Alternative: `hf:deepseek-ai/DeepSeek-V3-0324` (latest DeepSeek)

### **For Reasoning Tasks**
1. First choice: `hf:deepseek-ai/DeepSeek-R1-0528` (reasoning optimized)
2. Alternative: `hf:moonshotai/Kimi-K2-Thinking`

### **For Large Context**
1. First choice: `hf:meta-llama/Llama-3.3-70B-Instruct` (70B param)
2. Alternative: `hf:MiniMaxAI/MiniMax-M2`

### **For Code Generation**
1. First choice: `hf:Qwen/Qwen3-Coder-480B-A35B-Instruct`
2. Alternative: `hf:deepseek-ai/DeepSeek-V3-0324`

### **For Multimodal (Vision+Language)**
1. Only option: `hf:Qwen/Qwen3-VL-235B-A22B-Instruct`

## Notes

- **Model Availability**: The Synthetic API regularly updates its model catalog
- **Case Sensitivity**: Use exact case as shown above
- **hf: Prefix**: Automatically mapped to Synthetic API by the TensorZero proxy
- **Proxy Status**: Use `mclaude proxy status` to verify proxy is running
- **Error Handling**: 404 errors typically indicate model unavailability in provider API

## Last Updated
- Date: 2025-12-08
- MClaude Version: 1.8.6
 Synthetic API Model Status: As cataloged above

Always verify model availability by testing before use in production workflows.
