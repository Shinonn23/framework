interface InitOptions {
    name?: string;
    path?: string;
    appVersion?: string;
    yes?: boolean;
}

interface InitAppProps {
    options: InitOptions;
}

export type {
    // For init command
    InitOptions,
    InitAppProps,
};
