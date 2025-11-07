import { Box, Text } from "ink";
import TextInput from "ink-text-input";
import React from "react";

interface OverwriteScreenProps {
    path: string;
    confirmValue: string;
    onChange: (value: string) => void;
    onSubmit: (value: string) => void;
}

export const OverwriteScreen: React.FC<OverwriteScreenProps> = ({
    path,
    confirmValue,
    onChange,
    onSubmit,
}) => (
    <Box flexDirection="column" padding={1}>
        <Box marginBottom={1}>
            <Text>
                <Text bold>▲</Text>
                <Text dimColor> </Text>
                <Text bold color="yellow">
                    Warning
                </Text>
            </Text>
        </Box>

        <Box flexDirection="column" paddingLeft={2}>
            <Text dimColor>─────────────────────────</Text>
        </Box>

        <Box flexDirection="column" marginTop={1} paddingLeft={2}>
            <Box marginBottom={1}>
                <Text color="yellow">
                    Directory already exists:
                </Text>
            </Box>
            <Box marginBottom={1}>
                <Text bold>{path}</Text>
            </Box>
            <Box>
                <Text dimColor>
                    This will delete all existing files in this directory.
                </Text>
            </Box>
        </Box>

        <Box marginTop={1} paddingLeft={2}>
            <Text dimColor>─────────────────────────</Text>
        </Box>

        <Box marginTop={1} paddingLeft={2}>
            <Text dimColor>Overwrite? (y/N) </Text>
            <TextInput value={confirmValue} onChange={onChange} onSubmit={onSubmit} />
        </Box>
    </Box>
);
