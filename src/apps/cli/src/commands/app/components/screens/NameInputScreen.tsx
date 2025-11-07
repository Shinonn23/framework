import { Box, Text } from "ink";
import TextInput from "ink-text-input";
import React from "react";

interface NameInputScreenProps {
    value: string;
    defaultValue: string;
    onChange: (value: string) => void;
    onSubmit: (value: string) => void;
}

export const NameInputScreen: React.FC<NameInputScreenProps> = ({
    value,
    defaultValue,
    onChange,
    onSubmit,
}) => (
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
                <Text dimColor>(default: {defaultValue})</Text>
            </Box>
            <Box>
                <Text dimColor>→ </Text>
                <TextInput
                    value={value}
                    onChange={onChange}
                    onSubmit={onSubmit}
                    placeholder={defaultValue}
                />
            </Box>
        </Box>
    </Box>
);
