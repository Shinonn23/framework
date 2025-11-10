type InitState = {
    step: string;
    message: string;
};

type StateCallback = (state: InitState) => void;

interface InitServiceOptions {
    targetPath?: string | null;
    projectName?: string | null;
    templateVersion?: string | null;
    shouldOverwrite?: () => Promise<boolean>;
}

export type {
    // For init process state
    InitState,
    StateCallback,
    InitServiceOptions,
};
