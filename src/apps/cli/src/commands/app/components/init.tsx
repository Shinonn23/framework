import { Box, Newline, Text } from "ink";
import Gradient from "ink-gradient";
import Spinner from "ink-spinner";
import TextInput from "ink-text-input";
import React, { useEffect, useState } from "react";
import type { InitAppProps } from "../type";

const InitApp: React.FC<InitAppProps> = ({ options }: InitAppProps) => {
    const [step, setStep] = useState<
        "name" | "path" | "confirm" | "installing"
    >(options.name ? (options.path ? "confirm" : "path") : "name");
    const [name, setName] = useState(options.name || "");
    const [path, setPath] = useState(options.path || "");
    const [progress, setProgress] = useState(0);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [confirmValue, setConfirmValue] = useState("");

    const defaultName = "my-app";
    const defaultPath = "./my-app";

    const ALL_STEPS = [
        { label: "Creating project structure..." },
        { label: "Installing dependencies..." },
        { label: "Setting up configuration..." },
        { label: "Initializing git repository..." },
    ];

    useEffect(() => {
        if (step === "installing") {
            const stepInterval = setInterval(() => {
                setCurrentStepIndex((prevIndex) => {
                    // ถ้าถึง step สุดท้ายแล้ว ก็ให้หยุด interval
                    if (prevIndex >= ALL_STEPS.length - 1) {
                        clearInterval(stepInterval);
                        return prevIndex;
                    }
                    return prevIndex + 1;
                });
            }, 500); // 500ms ต่อ 1 step

            const progressInterval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 100) {
                        clearInterval(progressInterval);
                        clearInterval(stepInterval); // สั่ง clear stepInterval ตรงนี้ด้วย
                        setTimeout(() => process.exit(0), 1500);
                        return 100;
                    }
                    return prev + 1;
                });
            }, 30);

            return () => {
                clearInterval(progressInterval);
                clearInterval(stepInterval);
            };
        }
    }, [step, ALL_STEPS.length]);

    const handleNameSubmit = (value: string) => {
        setName(value || defaultName);
        setStep("path");
    };

    const handlePathSubmit = (value: string) => {
        setPath(value || defaultPath);
        setStep("confirm");
    };

    const handleConfirm = (value: string) => {
        setConfirmValue(""); // reset field
        if (value.toLowerCase() === "y" || value === "") {
            setStep("installing");
        } else {
            process.exit(0);
        }
    };

    if (step === "installing") {
        const filledBlocks = Math.floor(progress / 5);
        const emptyBlocks = 20 - filledBlocks;
        const progressBar = "█".repeat(filledBlocks) + "░".repeat(emptyBlocks);

        return (
            <Box flexDirection="column" padding={1}>
                <Box marginBottom={1}>
                    <Gradient name="rainbow">
                        <Text>
                            Creating application at {path || defaultPath}
                        </Text>
                    </Gradient>
                </Box>

                <Box marginBottom={1}>
                    <Text>
                        <Text color="cyan">✓</Text>
                        <Text> Creating application at </Text>
                        <Text bold color="cyan">
                            {path || defaultPath}
                        </Text>
                    </Text>
                </Box>

                <Box flexDirection="column" marginBottom={1}>
                    {ALL_STEPS.map((step, idx) => {
                        let status: "done" | "running" | "pending";

                        if (progress === 100) {
                            status = "done";
                        } else if (idx < currentStepIndex) {
                            status = "done";
                        } else if (idx === currentStepIndex) {
                            status = "running";
                        } else {
                            status = "pending";
                        }

                        if (status === "pending") {
                            return null;
                        }

                        return (
                            <Box key={step.label} marginBottom={0}>
                                {status === "running" ? (
                                    <>
                                        <Text color="green">
                                            {React.createElement(Spinner as any, { type: "dots" })}
                                        </Text>
                                        <Text> {step.label}</Text>
                                    </>
                                ) : (
                                    // 'done' -> แสดง ✓
                                    <Text>
                                        <Text color="green">✓</Text>
                                        <Text color="gray"> {step.label}</Text>
                                    </Text>
                                )}
                            </Box>
                        );
                    })}
                </Box>
                <Box marginBottom={1}>
                    <Text color="gray">
                        <Text>
                            [{progressBar}] {progress}%
                        </Text>
                    </Text>
                </Box>

                {progress === 100 && (
                    <Box flexDirection="column" marginTop={1}>
                        <Text color="green" bold>
                            ✓ Application created successfully!
                        </Text>
                        <Newline />
                        <Text color="cyan" bold>
                            Next steps:
                        </Text>
                        <Text color="gray"> cd {path || defaultPath}</Text>
                        <Text color="gray"> npm run dev</Text>
                        <Newline />
                        <Text dimColor>Happy coding! 🚀</Text>
                    </Box>
                )}
            </Box>
        );
    }

    if (step === "confirm") {
        return (
            <Box flexDirection="column" padding={1}>
                <Box marginBottom={1}>
                    <Gradient name="passion">
                        <Text bold>⚡ Ready to create your app</Text>
                    </Gradient>
                </Box>

                <Box
                    flexDirection="column"
                    marginBottom={1}
                    paddingLeft={2}
                    borderStyle="round"
                    borderColor="gray"
                    padding={1}
                >
                    <Text>
                        <Text color="gray">Name: </Text>
                        <Text bold color="cyan">
                            {name || defaultName}
                        </Text>
                    </Text>
                    <Text>
                        <Text color="gray">Path: </Text>
                        <Text bold color="cyan">
                            {path || defaultPath}
                        </Text>
                    </Text>
                    <Text>
                        <Text color="gray">Template: </Text>
                        <Text bold color="magenta">
                            Next.js + TypeScript
                        </Text>
                    </Text>
                    <Text>
                        <Text color="gray">Manager: </Text>
                        <Text bold color="yellow">
                            npm
                        </Text>
                    </Text>
                </Box>

                <Box>
                    <Text color="green">? </Text>
                    <Text>Continue? </Text>
                    <Text color="gray">(Y/n) </Text>
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
                    <Gradient name="cristal">
                        <Text bold>✨ Initialize New Application</Text>
                    </Gradient>
                </Box>

                <Box marginBottom={1}>
                    <Text color="green">✓ </Text>
                    <Text color="gray">Application name: </Text>
                    <Text bold color="cyan">
                        {name}
                    </Text>
                </Box>

                <Box flexDirection="column">
                    <Box>
                        <Text color="cyan">? </Text>
                        <Text>Where to create? </Text>
                        <Text color="gray">(default: {defaultPath})</Text>
                    </Box>
                    <Box paddingLeft={2}>
                        <Text color="gray">→ </Text>
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
                <Gradient name="morning">
                    <Text bold>✨ Initialize New Application</Text>
                </Gradient>
            </Box>

            <Box flexDirection="column">
                <Box>
                    <Text color="cyan">? </Text>
                    <Text>Application name? </Text>
                    <Text color="gray">(default: {defaultName})</Text>
                </Box>
                <Box paddingLeft={2}>
                    <Text color="gray">→ </Text>
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
