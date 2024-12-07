export interface TheCleanerConstructedParams {
    verbose: boolean;
    update: boolean;
    intensity: string;
}

export interface TheHelperConstructedParams {
    query?: "manager" | "clean" | "settings" | string | undefined;
}

export interface TheMigratorConstructedParams {
    project: string | undefined;
    target: string | undefined;
}

export interface TheSettingsConstructedParams {
    args: string[];
}

export interface TheUpdaterConstructedParams {
    force: boolean;
    silent: boolean;
    mute: boolean;
}
