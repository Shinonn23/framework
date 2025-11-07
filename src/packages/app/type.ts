type InitState = {
    step: string;
    message: string;
};

type StateCallback = (state: InitState) => void;

export type {
    // For init process state
    InitState,
    StateCallback,
};
