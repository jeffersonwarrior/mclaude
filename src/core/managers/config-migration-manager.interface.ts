export interface MigrationOptions {
  force?: boolean;
}

export interface ConfigMigrationManagerInterface {
  migrateConfig(options?: MigrationOptions): Promise<void>;
  promptForMigrationOnLocalInit(): Promise<boolean>;
  initLocalConfig(options?: { force?: boolean }): Promise<void>;
  switchToLocalConfig(): Promise<void>;
  switchToGlobalConfig(): Promise<void>;
  showMigrationStatus(): Promise<void>;
}
