import { Box, Text } from "ink";
import TextInput from "ink-text-input";
import React from "react";

interface ConfirmScreenProps {
    name: string;
    path: string;
    defaultName: string;
    defaultPath: string;
    confirmValue: string;
    onChange: (value: string) => void;
    onSubmit: (value: string) => void;
}

export const ConfirmScreen: React.FC<ConfirmScreenProps> = ({
    name,
    path,
    defaultName,
    defaultPath,
    confirmValue,
    onChange,
    onSubmit,
}) => (
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
            <TextInput value={confirmValue} onChange={onChange} onSubmit={onSubmit} />
        </Box>
    </Box>
);
