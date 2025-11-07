interface InitOptions {
    name?: string;
    path?: string;
    architecture?: "monolith" | "microservices";
}

interface InitAppProps {
    options: InitOptions;
}


export type {
    // For init command
    InitOptions,
    InitAppProps
}