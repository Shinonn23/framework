import { Box, Text } from "ink";
import React from "react";

interface CompletedScreenProps {
    path: string;
    defaultPath: string;
    onExit: () => void;
}

export const CompletedScreen: React.FC<CompletedScreenProps> = ({
    path,
    defaultPath,
    onExit,
}) => {
    const finalPath = path || defaultPath;

    React.useEffect(() => {
        const timer = setTimeout(onExit, 100);
        return () => clearTimeout(timer);
    }, [onExit]);

    return (
        <Box flexDirection="column" padding={1}>
            <Box marginBottom={1}>
                <Text>
                    <Text bold>▲</Text>
                    <Text dimColor> </Text>
                    <Text bold>Created</Text>
                </Text>
            </Box>

            <Box flexDirection="column" marginBottom={1} paddingLeft={2}>
                <Text dimColor>─────────────────────────</Text>
            </Box>

            <Box flexDirection="column" marginBottom={1} paddingLeft={2}>
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

            <Box flexDirection="column" marginBottom={1} paddingLeft={2}>
                <Text dimColor>─────────────────────────</Text>
            </Box>

            <Box flexDirection="column" paddingLeft={2}>
                <Box marginBottom={1}>
                    <Text>Application created at </Text>
                    <Text bold>{finalPath}</Text>
                </Box>

                <Box marginBottom={1}>
                    <Text dimColor>Next steps:</Text>
                </Box>

                <Box flexDirection="column" paddingLeft={2}>
                    <Box>
                        <Text dimColor>1. </Text>
                        <Text bold>cd {finalPath}</Text>
                    </Box>
                    <Box>
                        <Text dimColor>2. </Text>
                        <Text bold>bun run dev</Text>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};
