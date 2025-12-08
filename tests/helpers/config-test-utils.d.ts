import { ConfigManager } from '../../src/config';
export declare function setupConfigTestEnvironment(): {
    createConfigManager: (subPath?: string) => ConfigManager;
};
export declare function createTempEnvFile(): Promise<{
    tempDir: string;
    envPath: string;
}>;
//# sourceMappingURL=config-test-utils.d.ts.map