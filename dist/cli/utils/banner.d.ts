interface BannerOptions {
    verbose?: boolean;
    additionalArgs?: string[];
}
export declare function normalizeDangerousFlags(args: string[]): string[];
export declare function createBanner(options?: BannerOptions): string;
export {};
