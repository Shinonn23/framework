import { Box, Newline, Text } from "ink";
import Spinner from "ink-spinner";
import TextInput from "ink-text-input";
import React, { useEffect, useState } from "react";
import type { InitAppProps } from "../type";
import type { InitState } from "@packages/app/type";
import { init } from "@packages/app/init";

const InitApp: React.FC<InitAppProps> = ({ options }: InitAppProps) => {
    const [step, setStep] = useState<
        "name" | "path" | "confirm" | "installing"
    >(options.name ? (options.path ? "confirm" : "path") : "name");
    const [name, setName] = useState(options.name || "");
    const [path, setPath] = useState(options.path || "");
    const [confirmValue, setConfirmValue] = useState("");
    const [initState, setInitState] = useState<InitState | null>(null);
    const [dots, setDots] = useState("");

    const defaultName = "my-app";
    const defaultPath = "./my-app";

    // Animation for dots
    useEffect(() => {
        const interval = setInterval(() => {
            setDots((prev) => {
                if (prev === "...") return "";
                return prev + ".";
            });
        }, 500);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (step === "installing") {
            const runInit = async () => {
                try {
                    await init(
                        path || defaultPath,
                        name || defaultName,
                        null,
                        (state: InitState) => {
                            setInitState(state);
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
        }
    }, [step, path, name]);

    const handleNameSubmit = (value: string) => {
        setName(value || defaultName);
        setStep("path");
    };

    const handlePathSubmit = (value: string) => {
        setPath(value || defaultPath);
        setStep("confirm");
    };

    const handleConfirm = (value: string) => {
        setConfirmValue("");
        if (value.toLowerCase() === "y" || value === "") {
            setStep("installing");
        } else {
            process.exit(0);
        }
    };

    if (step === "installing") {
        const stepOrder = [
            "validating",
            "creating_path",
            "downloading_template",
            "updating_package",
        ];
        const currentStepIndex = stepOrder.indexOf(initState?.step || "");

        // Completed screen
        if (initState?.step === "completed") {
            // Exit after showing completion message
            setTimeout(() => {
                process.exit(0);
            }, 100);

            return (
                <Box flexDirection="column" padding={1}>
                    <Box marginBottom={1}>
                        <Text>
                            <Text bold>▲</Text>
                            <Text dimColor> </Text>
                            <Text bold>Created</Text>
                        </Text>
                    </Box>

                    <Box
                        flexDirection="column"
                        marginBottom={1}
                        paddingLeft={2}
                    >
                        <Text dimColor>─────────────────────────</Text>
                    </Box>

                    <Box
                        flexDirection="column"
                        marginBottom={1}
                        paddingLeft={2}
                    >
                        <Box>
                            <Text dimColor>├─ </Text>
                            <Text color="green">✓</Text>
                            <Text dimColor> Created project</Text>
                        </Box>
                        <Box>
                            <Text dimColor>├─ </Text>
                            <Text color="green">✓</Text>
                            <Text dimColor> Install dependencies</Text>
                        </Box>
                    </Box>

                    <Box
                        flexDirection="column"
                        marginBottom={1}
                        paddingLeft={2}
                    >
                        <Text dimColor>─────────────────────────</Text>
                    </Box>

                    <Box flexDirection="column" paddingLeft={2}>
                        <Box marginBottom={1}>
                            <Text>Application created at </Text>
                            <Text bold>{path || defaultPath}</Text>
                        </Box>

                        <Box marginBottom={1}>
                            <Text dimColor>Next steps:</Text>
                        </Box>

                        <Box flexDirection="column" paddingLeft={2}>
                            <Box>
                                <Text dimColor>1. </Text>
                                <Text bold>cd {path || defaultPath}</Text>
                            </Box>
                            <Box>
                                <Text dimColor>2. </Text>
                                <Text bold>bun run dev</Text>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            );
        }

        // Error screen
        if (initState?.step === "error") {
            // Exit with error code after showing error message
            setTimeout(() => {
                process.exit(1);
            }, 100);

            return (
                <Box flexDirection="column" padding={1}>
                    <Box marginBottom={1}>
                        <Text>
                            <Text bold>▲</Text>
                            <Text dimColor> </Text>
                            <Text bold color="red">
                                Error
                            </Text>
                        </Text>
                    </Box>

                    <Box flexDirection="column" paddingLeft={2}>
                        <Text dimColor>─────────────────────────</Text>
                    </Box>

                    <Box flexDirection="column" marginTop={1} paddingLeft={2}>
                        <Text color="red">× {initState.message}</Text>
                    </Box>

                    <Box marginTop={1} paddingLeft={2}>
                        <Text dimColor>Please try again</Text>
                    </Box>
                </Box>
            );
        }

        // Installing screen
        return (
            <Box flexDirection="column" padding={1}>
                <Box marginBottom={1}>
                    <Text>
                        <Text bold>▲</Text>
                        <Text dimColor> </Text>
                        <Text bold>Creating</Text>
                        <Text dimColor>{dots}</Text>
                    </Text>
                </Box>

                <Box flexDirection="column" marginBottom={1} paddingLeft={2}>
                    <Text dimColor>─────────────────────────</Text>
                </Box>

                <Box flexDirection="column" paddingLeft={2}>
                    <Box marginBottom={1}>
                        <Text dimColor>Path: </Text>
                        <Text bold>{path || defaultPath}</Text>
                    </Box>

                    {/* Validating */}
                    {currentStepIndex >= 0 && (
                        <Box>
                            {initState?.step === "validating" ? (
                                <>
                                    <Text dimColor>├─ </Text>
                                    <Text color="gray">
                                        {React.createElement(Spinner as any, {
                                            type: "dots",
                                        })}
                                    </Text>
                                    <Text> Validating input</Text>
                                </>
                            ) : (
                                <>
                                    <Text dimColor>├─ </Text>
                                    <Text color="green">✓</Text>
                                    <Text dimColor> Validated input</Text>
                                </>
                            )}
                        </Box>
                    )}

                    {/* Creating path */}
                    {currentStepIndex >= 1 && (
                        <Box>
                            {initState?.step === "creating_path" ? (
                                <>
                                    <Text dimColor>├─ </Text>
                                    <Text color="gray">
                                        {React.createElement(Spinner as any, {
                                            type: "dots",
                                        })}
                                    </Text>
                                    <Text> Creating project path</Text>
                                </>
                            ) : (
                                <>
                                    <Text dimColor>├─ </Text>
                                    <Text color="green">✓</Text>
                                    <Text dimColor> Created project path</Text>
                                </>
                            )}
                        </Box>
                    )}

                    {/* Downloading template */}
                    {currentStepIndex >= 2 && (
                        <Box>
                            {initState?.step === "downloading_template" ? (
                                <>
                                    <Text dimColor>├─ </Text>
                                    <Text color="gray">
                                        {React.createElement(Spinner as any, {
                                            type: "dots",
                                        })}
                                    </Text>
                                    <Text> Downloading template</Text>
                                </>
                            ) : (
                                <>
                                    <Text dimColor>├─ </Text>
                                    <Text color="green">✓</Text>
                                    <Text dimColor> Downloaded template</Text>
                                </>
                            )}
                        </Box>
                    )}

                    {/* Updating package */}
                    {currentStepIndex >= 3 && (
                        <Box>
                            {initState?.step === "updating_package" ? (
                                <>
                                    <Text dimColor>└─ </Text>
                                    <Text color="gray">
                                        {React.createElement(Spinner as any, {
                                            type: "dots",
                                        })}
                                    </Text>
                                    <Text> Updating package.json</Text>
                                </>
                            ) : (
                                <>
                                    <Text dimColor>└─ </Text>
                                    <Text color="green">✓</Text>
                                    <Text dimColor> Updated package.json</Text>
                                </>
                            )}
                        </Box>
                    )}
                </Box>

                {initState?.message && (
                    <Box marginTop={1} paddingLeft={2}>
                        <Text dimColor>{initState.message}</Text>
                    </Box>
                )}
            </Box>
        );
    }

    if (step === "confirm") {
        return (
            <Box flexDirection="column" padding={1}>
                <Box marginBottom={1}>
                    <Text>
                        <Text bold>▲</Text>
                        <Text dimColor> </Text>
                        <Text bold>Confirm</Text>
                    </Text>
                </Box>

                <Box flexDirection="column" paddingLeft={2}>
                    <Text dimColor>─────────────────────────</Text>
                </Box>

                <Box flexDirection="column" marginTop={1} paddingLeft={2}>
                    <Box>
                        <Text dimColor>Name </Text>
                        <Text bold>{name || defaultName}</Text>
                    </Box>
                    <Box>
                        <Text dimColor>Path </Text>
                        <Text bold>{path || defaultPath}</Text>
                    </Box>
                </Box>

                <Box marginTop={1} paddingLeft={2}>
                    <Text dimColor>─────────────────────────</Text>
                </Box>

                <Box marginTop={1} paddingLeft={2}>
                    <Text dimColor>Continue? (Y/n) </Text>
                    <TextInput
                        value={confirmValue}
                        onChange={setConfirmValue}
                        onSubmit={handleConfirm}
                    />
                </Box>
            </Box>
        );
    }

    if (step === "path") {
        return (
            <Box flexDirection="column" padding={1}>
                <Box marginBottom={1}>
                    <Text>
                        <Text bold>▲</Text>
                        <Text dimColor> </Text>
                        <Text bold>Initialize</Text>
                    </Text>
                </Box>

                <Box flexDirection="column" paddingLeft={2}>
                    <Text dimColor>─────────────────────────</Text>
                </Box>

                <Box marginTop={1} paddingLeft={2}>
                    <Text color="green">✓ </Text>
                    <Text dimColor>Name </Text>
                    <Text bold>{name}</Text>
                </Box>

                <Box marginTop={1} paddingLeft={2}>
                    <Text dimColor>─────────────────────────</Text>
                </Box>

                <Box flexDirection="column" marginTop={1} paddingLeft={2}>
                    <Box marginBottom={1}>
                        <Text dimColor>Where to create? </Text>
                        <Text dimColor>(default: {defaultPath})</Text>
                    </Box>
                    <Box>
                        <Text dimColor>→ </Text>
                        <TextInput
                            value={path}
                            onChange={setPath}
                            onSubmit={handlePathSubmit}
                            placeholder={defaultPath}
                        />
                    </Box>
                </Box>
            </Box>
        );
    }

    return (
        <Box flexDirection="column" padding={1}>
            <Box marginBottom={1}>
                <Text>
                    <Text bold>▲</Text>
                    <Text dimColor> </Text>
                    <Text bold>Initialize</Text>
                </Text>
            </Box>

            <Box flexDirection="column" paddingLeft={2}>
                <Text dimColor>─────────────────────────</Text>
            </Box>

            <Box flexDirection="column" marginTop={1} paddingLeft={2}>
                <Box marginBottom={1}>
                    <Text dimColor>Application name? </Text>
                    <Text dimColor>(default: {defaultName})</Text>
                </Box>
                <Box>
                    <Text dimColor>→ </Text>
                    <TextInput
                        value={name}
                        onChange={setName}
                        onSubmit={handleNameSubmit}
                        placeholder={defaultName}
                    />
                </Box>
            </Box>
        </Box>
    );
};

export { InitApp };
