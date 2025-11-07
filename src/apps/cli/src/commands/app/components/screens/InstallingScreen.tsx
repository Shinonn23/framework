import { Box, Text } from "ink";
import React from "react";
import type { InitState } from "@packages/app/type";
import { ProgressStep } from "./ProgressStep";

interface InstallingScreenProps {
    path: string;
    defaultPath: string;
    dots: string;
    initState: InitState | null;
    stepOrder: readonly string[];
}

export const InstallingScreen: React.FC<InstallingScreenProps> = ({
    path,
    defaultPath,
    dots,
    initState,
    stepOrder,
}) => {
    const currentStepIndex = stepOrder.indexOf(initState?.step || "");
    const finalPath = path || defaultPath;

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
                    <Text bold>{finalPath}</Text>
                </Box>

                {currentStepIndex >= 0 && (
                    <ProgressStep
                        isActive={initState?.step === "validating"}
                        isLast={false}
                        activeLabel="Validating input"
                        completedLabel="Validated input"
                    />
                )}

                {currentStepIndex >= 1 && (
                    <ProgressStep
                        isActive={initState?.step === "creating_path"}
                        isLast={false}
                        activeLabel="Creating project path"
                        completedLabel="Created project path"
                    />
                )}

                {currentStepIndex >= 2 && (
                    <ProgressStep
                        isActive={initState?.step === "downloading_template"}
                        isLast={false}
                        activeLabel="Downloading template"
                        completedLabel="Downloaded template"
                    />
                )}

                {currentStepIndex >= 3 && (
                    <ProgressStep
                        isActive={initState?.step === "updating_package"}
                        isLast={true}
                        activeLabel="Updating package.json"
                        completedLabel="Updated package.json"
                    />
                )}
            </Box>

            {initState?.message && (
                <Box marginTop={1} paddingLeft={2}>
                    <Text dimColor>{initState.message}</Text>
                </Box>
            )}
        </Box>
    );
};
