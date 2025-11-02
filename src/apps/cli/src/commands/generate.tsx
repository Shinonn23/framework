import React, { useState, useEffect } from 'react';
import { render, Box, Text, useApp } from 'ink';
import SelectInput from 'ink-select-input';
import Spinner from 'ink-spinner';

interface Item {
    label: string;
    value: string;
}

interface GenerateState {
    type: string | null;
    generating: boolean;
    success: boolean;
    error: string | null;
}

const items: Item[] = [
    { label: 'Controller', value: 'controller' },
    { label: 'Model', value: 'model' },
    { label: 'Component', value: 'component' },
];

interface GenerateCommandProps {
    initialType?: string;
}

const GenerateCommand: React.FC<GenerateCommandProps> = ({ initialType }) => {
    const { exit } = useApp();
    const [state, setState] = useState<GenerateState>({
        type: initialType || null,
        generating: false,
        success: false,
        error: null,
    });

    const handleSelect = (item: Item) => {
        setState(prev => ({
            ...prev,
            type: item.value,
        }));
    };

    useEffect(() => {
        if (!state.type || state.generating || state.success || state.error) {
            return;
        }

        const generate = async () => {
            setState(prev => ({ ...prev, generating: true }));

            try {
                // Generation logic here
                await new Promise((resolve) => setTimeout(resolve, 1500));

                setState(prev => ({
                    ...prev,
                    generating: false,
                    success: true,
                }));

                // Auto-exit after showing success message
                setTimeout(() => {
                    exit();
                }, 1000);
            } catch (error) {
                setState(prev => ({
                    ...prev,
                    generating: false,
                    error: error instanceof Error ? error.message : String(error),
                }));

                setTimeout(() => {
                    exit(error instanceof Error ? error : new Error(String(error)));
                }, 2000);
            }
        };

        generate();
    }, [state.type, state.generating, state.success, state.error, exit]);

    if (!state.type) {
        return (
            <Box flexDirection="column" paddingY={1}>
                <Box marginBottom={1}>
                    <Text>What do you want to generate?</Text>
                </Box>
                <SelectInput items={items} onSelect={handleSelect} />
            </Box>
        );
    }

    return (
        <Box flexDirection="column" paddingY={1}>
            {state.generating && (
                <Box>
                    <Text color="cyan">
                        <Spinner type="dots" />
                    </Text>
                    <Text> Generating {state.type}...</Text>
                </Box>
            )}

            {state.success && (
                <Box>
                    <Text color="green">✓ {state.type} generated successfully!</Text>
                </Box>
            )}

            {state.error && (
                <Box flexDirection="column">
                    <Box>
                        <Text color="red">✗ Failed to generate {state.type}</Text>
                    </Box>
                    <Box marginLeft={2} marginTop={1}>
                        <Text color="red">{state.error}</Text>
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export async function generateCommand(type?: string) {
    const { waitUntilExit } = render(<GenerateCommand initialType={type} />);

    try {
        await waitUntilExit();
    } catch (error) {
        process.exit(1);
    }
}
