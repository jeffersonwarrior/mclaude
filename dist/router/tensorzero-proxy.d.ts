import { ConfigManager } from "../config";
import { ProxyStatus } from "./types";
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
export declare class TensorZeroProxy {
    private process;
    private configManager;
    private modelManager;
    private startTime;
    constructor(configManager: ConfigManager);
    private createTensorZeroConfig;
    private createTensorZeroTomlConfig;
    start(): Promise<ProxyStatus>;
    private waitForServer;
    stop(): Promise<void>;
    isRunning(): boolean;
    healthCheck(): Promise<boolean>;
    getStatus(): Promise<ProxyStatus | null>;
}
//# sourceMappingURL=tensorzero-proxy.d.ts.map