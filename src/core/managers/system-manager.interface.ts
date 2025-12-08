import { AppOptions } from "../app";

export interface SystemManagerInterface {
  setupLogging(options: AppOptions): Promise<void>;
  performSilentUpdate(): Promise<void>;
  doctor(): Promise<void>;
  clearCache(): Promise<void>;
  cacheInfo(): Promise<void>;
}
