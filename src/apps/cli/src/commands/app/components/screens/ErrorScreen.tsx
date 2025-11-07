import { Box, Text } from "ink";
import React from "react";

interface ErrorScreenProps {
    message: string;
    onExit: () => void;
}

export const ErrorScreen: React.FC<ErrorScreenProps> = ({ message, onExit }) => {
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
                    <Text bold color="red">
                        Error
                    </Text>
                </Text>
            </Box>

            <Box flexDirection="column" paddingLeft={2}>
                <Text dimColor>─────────────────────────</Text>
            </Box>

            <Box flexDirection="column" marginTop={1} paddingLeft={2}>
                <Text color="red">× {message}</Text>
            </Box>

            <Box marginTop={1} paddingLeft={2}>
                <Text dimColor>Please try again</Text>
            </Box>
        </Box>
    );
};
