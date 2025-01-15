export interface TheCleanerConstructedParams {
    flags: {
        verbose: boolean;
        update: boolean;
        lint: boolean;
        prettify: boolean;
        commit: boolean;
        destroy: boolean;
    };
    parameters: {
        intensity: string;
        project: string | 0;
    };
}

export interface TheHelperConstructedParams {
    query?: string | undefined;
}

export interface TheMigratorConstructedParams {
    project: string | undefined;
    desiredManager: string | undefined;
}

export interface TheSettingsConstructedParams {
    args: string[];
}

export interface TheUpdaterConstructedParams {
    silent: boolean;
}

export interface TheKickstartConstructedParams {
    gitUrl: string;
    path?: string;
    manager?: string;
}
