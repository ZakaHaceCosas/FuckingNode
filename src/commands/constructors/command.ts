import type { CONFIG_FILES } from "../../types.ts";

interface ConstructorParameters {
    CF: CONFIG_FILES;
    // ARGS: string[];
}

export interface TheCleanerConstructedParams extends ConstructorParameters {
    verbose: boolean;
    update: boolean;
    intensity: string;
}

export interface TheHelperConstructedParams extends Omit<ConstructorParameters, "CF"> {
    query?: "manager" | "clean" | "settings" | string | undefined;
}

export interface TheManagerConstructedParams extends ConstructorParameters {
    // lol
}

export interface TheMigratorConstructedParams extends Omit<ConstructorParameters, "CF"> {
    project: string | undefined;
    target: string | undefined;
}

export interface TheSettingsConstructedParams extends ConstructorParameters {
    args: string[];
}

export interface TheUpdaterConstructedParams extends ConstructorParameters {
    force: boolean;
    silent: boolean;
    mute: boolean;
}
