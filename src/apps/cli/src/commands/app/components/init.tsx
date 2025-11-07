import React, { useEffect, useState } from "react";
import type { InitAppProps } from "../type";
import type { InitState } from "@packages/app/type";
import { init } from "@packages/app/init";
import {
    VersionInputScreen,
    type VersionOption,
    NameInputScreen,
    PathInputScreen,
    ConfirmScreen,
    OverwriteScreen,
    InstallingScreen,
    CompletedScreen,
    ErrorScreen,
} from "./screens";

const DEFAULT_NAME = "my-app";
const DEFAULT_PATH = "./my-app";

const STEP_ORDER = [
    "validating",
    "creating_path",
    "downloading_template",
    "updating_package",
] as const;

type Step =
    | "name"
    | "version"
    | "path"
    | "confirm"
    | "overwrite"
    | "installing";

const InitApp: React.FC<InitAppProps> = ({ options }) => {
    const getInitialStep = (): Step => {
        const hasAllOptions = options.name && options.appVersion && options.path;
        
        // If all required options are provided and --yes flag is set, skip directly to installing
        if (hasAllOptions && options.yes) {
            return "installing";
        }

        // If all options provided but no --yes, go to confirm
        if (hasAllOptions) {
            return "confirm";
        }

        // Determine which step to ask for next
        if (options.name) {
            if (options.appVersion) {
                return "path";
            }
            return "version";
        }
        
        return "name";
    };

    const [step, setStep] = useState<Step>(getInitialStep());
    const [name, setName] = useState(options.name || "");
    const [path, setPath] = useState(options.path || "");
    const [version, setVersion] = useState(options.appVersion || "");
    const [confirmValue, setConfirmValue] = useState("");
    const [overwriteValue, setOverwriteValue] = useState("");
    const [initState, setInitState] = useState<InitState | null>(null);
    const [dots, setDots] = useState("");
    const [overwriteResolve, setOverwriteResolve] = useState<
        ((value: boolean) => void) | null
    >(null);
    const [hasStartedInit, setHasStartedInit] = useState(false);

    // Animate loading dots
    useEffect(() => {
        const interval = setInterval(() => {
            setDots((prev) => (prev === "..." ? "" : prev + "."));
        }, 500);
        return () => clearInterval(interval);
    }, []);

    // Run initialization when step is "installing"
    useEffect(() => {
        if (step !== "installing" || hasStartedInit) return;

        setHasStartedInit(true);

        const runInit = async () => {
            // Defer execution to avoid React reconciler conflicts
            await new Promise((resolve) => setTimeout(resolve, 0));

            try {
                await init(
                    path || DEFAULT_PATH,
                    name || DEFAULT_NAME,
                    version || "dev",
                    setInitState,
                    async () => {
                        // This callback asks user if they want to overwrite
                        if (options.yes) {
                            return true; // Auto-approve if --yes flag
                        }

                        // Show overwrite screen and wait for user decision
                        return new Promise<boolean>((resolve) => {
                            setStep("overwrite");
                            setOverwriteResolve(() => (value: boolean) => {
                                // After resolving, switch back to installing screen
                                setStep("installing");
                                resolve(value);
                            });
                        });
                    },
                );
            } catch (error) {
                setInitState({
                    step: "error",
                    message:
                        error instanceof Error
                            ? error.message
                            : "An unknown error occurred",
                });
            }
        };

        runInit();
    }, [step, path, name, version, options.yes, hasStartedInit]);

    const handleNameSubmit = (value: string) => {
        setName(value || DEFAULT_NAME);
        setStep("version");
    };

    const handleVersionSubmit = (item: VersionOption) => {
        setVersion(item.value);
        setStep("path");
    };

    const handlePathSubmit = (value: string) => {
        setPath(value || DEFAULT_PATH);
        setStep("confirm");
    };

    const handleConfirm = (value: string) => {
        setConfirmValue("");
        const isConfirmed = value.toLowerCase() === "y" || value === "";
        if (isConfirmed) {
            setStep("installing");
        } else {
            process.exit(0);
        }
    };

    const handleOverwrite = (value: string) => {
        setOverwriteValue("");
        const isConfirmed = value.toLowerCase() === "y";

        // Resolve the promise from the init function
        if (overwriteResolve) {
            overwriteResolve(isConfirmed);
            setOverwriteResolve(null);
        }

        if (!isConfirmed) {
            process.exit(0);
        }
        
        // Continue showing installing screen while init process continues
        // The init process is still running in background and will update initState
    };

    const handleExit = (code: number) => {
        return () => process.exit(code);
    };

    // Render screens based on current step
    // Note: overwrite screen can appear on top of installing
    if (step === "overwrite") {
        return (
            <OverwriteScreen
                path={path || DEFAULT_PATH}
                confirmValue={overwriteValue}
                onChange={setOverwriteValue}
                onSubmit={handleOverwrite}
            />
        );
    }

    if (step === "name") {
        return (
            <NameInputScreen
                value={name}
                defaultValue={DEFAULT_NAME}
                onChange={setName}
                onSubmit={handleNameSubmit}
            />
        );
    }

    if (step === "version") {
        return (
            <VersionInputScreen
                value={version}
                defaultValue="dev"
                onSelect={handleVersionSubmit}
            />
        );
    }

    if (step === "path") {
        return (
            <PathInputScreen
                name={name}
                value={path}
                defaultValue={DEFAULT_PATH}
                onChange={setPath}
                onSubmit={handlePathSubmit}
            />
        );
    }

    if (step === "confirm") {
        return (
            <ConfirmScreen
                name={name}
                path={path}
                defaultName={DEFAULT_NAME}
                defaultPath={DEFAULT_PATH}
                confirmValue={confirmValue}
                onChange={setConfirmValue}
                onSubmit={handleConfirm}
            />
        );
    }

    if (step === "installing") {
        if (initState?.step === "completed") {
            return (
                <CompletedScreen
                    path={path}
                    defaultPath={DEFAULT_PATH}
                    onExit={handleExit(0)}
                />
            );
        }

        if (initState?.step === "error") {
            return (
                <ErrorScreen
                    message={initState.message}
                    onExit={handleExit(1)}
                />
            );
        }

        return (
            <InstallingScreen
                path={path}
                defaultPath={DEFAULT_PATH}
                dots={dots}
                initState={initState}
                stepOrder={STEP_ORDER}
            />
        );
    }

    return null;
};

export { InitApp };
