export interface TheCleanerConstructedParams {
    verbose: boolean;
    update: boolean;
    lint: boolean;
    prettify: boolean;
    commit: boolean;
    destroy: boolean;
    intensity: string;
}

export interface TheHelperConstructedParams {
    query?: "manager" | "clean" | "settings" | "kickstart" | "migrate" | string | undefined;
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

export interface TheKickstartConstructedParams {
    gitUrl: string;
    path?: string;
    manager?: string;
}
