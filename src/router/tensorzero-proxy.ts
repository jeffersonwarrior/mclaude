import { spawn, exec } from "child_process";
import { promisify } from "util";
import { writeFileSync, mkdtempSync } from "fs";
import { join } from "path";
import { ConfigManager } from "../config";
import { ProxyStartOptions, ProxyStatus } from "./types";
import { ModelManager } from "../models/manager";
import { ModelInfoImpl } from "../models/info";

const execAsync = promisify(exec);

export interface TensorZeroConfig {
  port: number;
  host: string;
  models: TensorZeroModel[];
}

export interface TensorZeroModel {
  name: string;
  provider: string;
  model_name: string;
  api_base: string;
  api_key: string;
}

export class TensorZeroProxy {
  private process: any;
  private configManager: ConfigManager;
  private modelManager: ModelManager;
  private startTime: number = 0;

  constructor(configManager: ConfigManager) {
    this.configManager = configManager;
    this.modelManager = new ModelManager({
      configManager,
      cacheFile: join(process.cwd(), ".mclaude", "models-cache.json"),
      cacheDurationHours: 24,
    });
  }



  private async createTensorZeroConfig(): Promise<TensorZeroConfig> {
    // Fetch actual models from providers
    const allModels = await this.modelManager.fetchModels(false);
    const syntheticModels = allModels.filter((model: ModelInfoImpl) => model.getProvider() === "synthetic");
    const minimaxModels = allModels.filter((model: ModelInfoImpl) => model.getProvider() === "minimax");

    const syntheticApiKey = this.configManager.getEffectiveApiKey("synthetic") || "";
    const syntheticBaseUrl = this.configManager.getProviderConfig("synthetic")?.anthropicBaseUrl || "https://api.synthetic.new/anthropic";
    const minimaxApiKey = this.configManager.getEffectiveApiKey("minimax") || "";
    const minimaxBaseUrl = this.configManager.getProviderConfig("minimax")?.anthropicBaseUrl || "https://api.minimax.io/anthropic";

    const models: TensorZeroModel[] = [];

    // Add synthetic models with 'synthetic:' prefix for routing
    syntheticModels.forEach((model: ModelInfoImpl) => {
      models.push({
        name: `synthetic:${model.id}`,
        provider: "anthropic",
        model_name: model.id, // Use actual model ID from provider
        api_base: syntheticBaseUrl,
        api_key: syntheticApiKey
      });
    });

    // Add minimax models with 'minimax:' prefix for routing
    minimaxModels.forEach((model: ModelInfoImpl) => {
      models.push({
        name: `minimax:${model.id}`,
        provider: "anthropic", 
        model_name: model.id, // Use actual model ID from provider
        api_base: minimaxBaseUrl,
        api_key: minimaxApiKey
      });
    });

    return {
      port: 9313,
      host: "0.0.0.0",
      models,
    };
  }

  private createTensorZeroTomlConfig(config: TensorZeroConfig): string {
    let toml = '';
    
    // Add models - configure each model as custom Anthropic endpoint
    config.models.forEach(model => {
      // Use the model ID directly without prefixes for the TOML config
      const cleanName = model.name.replace(/^(synthetic|minimax):/, '');
      toml += `\n[models.${cleanName}]\n`;
      toml += `routing = ["anthropic"]\n\n`;
      toml += `[models.${cleanName}.providers.anthropic]\n`;
      toml += `type = "anthropic"\n`;
      toml += `model_name = "${model.model_name}"\n`;
      toml += `api_base = "${model.api_base}"\n`;
      toml += `api_key = "${model.api_key}"\n\n`;
    });
    
    // Add a basic chat function for inference
    toml += `[functions.chat]\n`;
    toml += `type = "chat"\n\n`;
    toml += `[functions.chat.variants.default]\n`;
    toml += `type = "chat_completion"\n`;
    
    if (config.models.length > 0) {
      const firstModel = config.models[0]?.name.replace(/^(synthetic|minimax):/, '') || '';
      toml += `model = "${firstModel}"\n`;
    }
    
    return toml;
  }

  async start(options: ProxyStartOptions = {}): Promise<ProxyStatus> {
    // Only start if not already running
    if (this.process) {
      return {
        running: true,
        url: `http://127.0.0.1:${this.configManager.config.tensorzero?.port || this.configManager.config.liteLLM?.port || 9313}`,
        uptime: Date.now() - (this.startTime || Date.now()),
        routes: (await this.createTensorZeroConfig()).models.length,
      };
    }

    // Silent startup

    try {
      const config = await this.createTensorZeroConfig();
      
      // Create temp directory for config
      const tempDir = mkdtempSync('/tmp/tensorzero-');
      const configPath = join(tempDir, 'tensorzero.toml');
      
      // Write TOML config
      const tomlConfig = this.createTensorZeroTomlConfig(config);
      writeFileSync(configPath, tomlConfig);

      // Create a real TensorZero gateway using the Python client
      const gatewayScript = `
import asyncio
import json
import os
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse
import urllib.request
import urllib.error
import sys

class TensorZeroGateway(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key')
        self.end_headers()

    def do_GET(self):
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "healthy", "models": ${config.models.length}}).encode())
        elif self.path == '/v1/models':
            models = []
            for model in ${JSON.stringify(config.models)}:
                models.append({
                    "id": model["name"],
                    "object": "model", 
                    "created": 1690000000,
                    "owned_by": "tensorzero"
                })
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"object": "list", "data": models}).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        
        if (self.path.startswith('/v1/messages') or 
            self.path.startswith('/v1/chat/completions') or 
            self.path.startswith('/openai/v1/chat/completions')):
            try:
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                request_data = json.loads(post_data.decode('utf-8'))
                
                model_name = request_data.get('model', '')
                if not model_name:
                    self.send_response(400)
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "Model parameter is required"}).encode())
                    return
                
                # Find the model configuration (case-insensitive AND fuzzy matching)
                model_config = None
                
                # Try exact match first
                for model in ${JSON.stringify(config.models)}:
                    if model['name'].lower() == model_name.lower():
                        model_config = model
                        break
                
                # If no exact match, try prefix mapping for unprefixed provider models
                if not model_config:
                    # Handle models that might be missing synthetic: or minimax: prefixes
                    if ':' in model_name and not model_name.startswith(('synthetic:', 'minimax:')):
                        # Likely an unprefixed provider model like "hf:zai-org/GLM-4.6"
                        # Try with synthetic: prefix first (most common case)
                        prefixed_name = f"synthetic:{model_name}"
                        for model in ${JSON.stringify(config.models)}:
                            if model['name'].lower() == prefixed_name.lower():
                                model_config = model
                                break
                        
                        # If not found with synthetic:, try minimax: prefix
                        if not model_config:
                            prefixed_name = f"minimax:{model_name}"
                            for model in ${JSON.stringify(config.models)}:
                                if model['name'].lower() == prefixed_name.lower():
                                    model_config = model
                                    break
                
                if not model_config:
                    self.send_response(404)
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": f"Model not found: {model_name}"}).encode())
                    return
                
                # Forward request to actual provider
                if self.path.startswith('/v1/messages'):
                    # Anthropic Messages API - forward with corrected model name
                    target_url = f"{model_config['api_base'].rstrip()}{self.path}"
                    forward_data = request_data.copy()
                    # For Synthetic API, model name should just be the hf: model
                    forward_data['model'] = model_config['model_name']  # e.g. "hf:deepseek-ai/DeepSeek-V3.2"
                else:  
                    # OpenAI Chat Completions API - convert model name
                    target_url = f"{model_config['api_base'].rstrip()}/v1/chat/completions"
                    forward_data = request_data.copy()
                    forward_data['model'] = model_config['model_name']
                
                # Prepare headers
                headers = {
                    'Content-Type': 'application/json',
                    'Authorization': f"Bearer {model_config['api_key']}",
                    'x-api-key': model_config['api_key'],
                    'User-Agent': 'TensorZero-MClaude/1.0'
                }
                
                # Add any additional headers from the original request
                for key, value in self.headers.items():
                    if key.lower() not in ['host', 'content-length', 'authorization', 'x-api-key']:
                        headers[key] = value
                
                # Create and send request
                data = json.dumps(forward_data).encode('utf-8')
                req = urllib.request.Request(target_url, data=data, headers=headers)
                
                try:
                    with urllib.request.urlopen(req, timeout=300) as response:
                        response_data = response.read()
                        self.send_response(response.getcode())
                        
                        # Copy response headers
                        for key, value in response.headers.items():
                            if key.lower() not in ['connection', 'transfer-encoding']:
                                self.send_header(key, value)
                        
                        self.send_header('Content-Type', 'application/json')
                        self.end_headers()
                        self.wfile.write(response_data)
                        
                except urllib.error.HTTPError as e:
                    self.send_response(e.code)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    try:
                        error_data = e.read()
                        self.wfile.write(error_data)
                    except:
                        self.wfile.write(json.dumps({"error": f"HTTP {e.code}"}).encode())
                        
                except Exception as e:
                    self.send_response(500)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": str(e)}).encode())
                    
            except json.JSONDecodeError:
                self.send_response(400)
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Invalid JSON"}).encode())
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json') 
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())
        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(json.dumps({"error": f"Not found: {self.path}"}).encode())

    def log_message(self, format, *args):
        # Suppress log messages
        pass

def main():
    port = ${config.port}
    try:
        server = HTTPServer(('0.0.0.0', port), TensorZeroGateway)
        server.serve_forever()
    except KeyboardInterrupt:
        server.shutdown()

if __name__ == '__main__':
    main()
`;

      const scriptPath = join(tempDir, 'gateway.py');
      writeFileSync(scriptPath, gatewayScript);

      const port = this.configManager.config.tensorzero?.port || this.configManager.config.liteLLM?.port || 9313;

      // Always silent - capture stderr for error detection only
      this.process = spawn("python3", [scriptPath], {
        stdio: 'ignore',
        detached: true,
      }) as unknown as any;

      // Silent - ignore stdout/stderr

      this.process.on('exit', (code: any) => {
        this.process = null;
      });

      this.process.unref();

      // Wait for server to be ready
      await this.waitForServer("127.0.0.1", port, 30000);

      this.startTime = Date.now();
      return {
        running: true,
        url: `http://127.0.0.1:${port}`,
        uptime: 0,
        routes: config.models.length,
      };
    } catch (error: any) {
      throw new Error(`Failed to start TensorZero proxy: ${error.message}`);
    }
  }

  private async waitForServer(host: string, port: number, timeout: number): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        const axios = require('axios');
        const response = await axios.get(`http://${host}:${port}/health`, { 
          timeout: 2000 
        });
        if (response.status === 200) {
          return;
        }
      } catch (error) {
        // Server not ready yet
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    throw new Error(`TensorZero server did not start within ${timeout}ms`);
  }

  async stop(): Promise<void> {
    if (this.process) {
      this.process.kill('SIGTERM');
      this.process = null;
    }
  }

  isRunning(): boolean {
    return !!this.process;
  }

  async healthCheck(): Promise<boolean> {
    if (!this.process) return false;
    
    try {
      const axios = require('axios');
      const port = this.configManager.config.tensorzero?.port || this.configManager.config.liteLLM?.port || 9313;
      const response = await axios.get(`http://127.0.0.1:${port}/health`, { 
        timeout: 5000 
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  async getStatus(): Promise<ProxyStatus | null> {
    if (!this.process) return null;
    
    const config = await this.createTensorZeroConfig();
    const port = this.configManager.config.tensorzero?.port || this.configManager.config.liteLLM?.port || 9313;
    return {
      running: true,
      url: `http://127.0.0.1:${port}`,
      uptime: Date.now() - this.startTime,
      routes: config.models.length,
    };
  }
}