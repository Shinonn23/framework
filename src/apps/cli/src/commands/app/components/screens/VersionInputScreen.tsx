import { Box, Text } from "ink";
import SelectInput from "ink-select-input";
import React from "react";

export interface VersionOption {
    label: string;
    value: string;
}

export interface VersionInputScreenProps {
    value: string;
    defaultValue: string;
    onSelect: (item: VersionOption) => void;
    options?: VersionOption[];
}

export const VersionInputScreen: React.FC<VersionInputScreenProps> = ({
    value,
    defaultValue,
    onSelect,
    options,
}) => {
    const versionOptions: VersionOption[] = options || [
        { label: "1.0.0", value: "1.0.0" },
        { label: "0.1.0", value: "0.1.0" },
        { label: "0.0.1", value: "0.0.1" },
        { label: `Custom (${defaultValue})`, value: defaultValue },
    ];

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
                    <Text dimColor>Select application version:</Text>
                </Box>
                <Box>
                    <SelectInput items={versionOptions} onSelect={onSelect} />
                </Box>
            </Box>
        </Box>
    );
};
