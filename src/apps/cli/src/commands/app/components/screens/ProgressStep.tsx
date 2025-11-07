import { Box, Text } from "ink";
import Spinner from "ink-spinner";
import React from "react";

interface ProgressStepProps {
    isActive: boolean;
    isLast: boolean;
    activeLabel: string;
    completedLabel: string;
}

export const ProgressStep: React.FC<ProgressStepProps> = ({
    isActive,
    isLast,
    activeLabel,
    completedLabel,
}) => {
    const prefix = isLast ? "└─ " : "├─ ";

    return (
        <Box>
            <Text dimColor>{prefix}</Text>
            {isActive ? (
                <>
                    <Text color="gray">
                        {React.createElement(Spinner as any, {
                            type: "dots",
                        })}
                    </Text>
                    <Text> {activeLabel}</Text>
                </>
            ) : (
                <>
                    <Text color="green">✓</Text>
                    <Text dimColor> {completedLabel}</Text>
                </>
            )}
        </Box>
    );
};
