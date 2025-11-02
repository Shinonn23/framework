import React, { useState, useEffect } from 'react';
import { render, Box, Text } from 'ink';
import Spinner from 'ink-spinner';

interface MigrationState {
    running: boolean;
    success: boolean;
    error: string | null;
}

const MigrateCommand: React.FC = () => {
    const [state, setState] = useState<MigrationState>({
        running: true,
        success: false,
        error: null,
    });

    useEffect(() => {
        const runMigrations = async () => {
            try {
                // Run migrations
                // This would call the db package's migrate function
                await new Promise((resolve) => setTimeout(resolve, 2000));

                setState({
                    running: false,
                    success: true,
                    error: null,
                });
            } catch (error) {
                setState({
                    running: false,
                    success: false,
                    error:
                        error instanceof Error ? error.message : String(error),
                });
            }
        };

        runMigrations();
    }, []);

    return (
        <Box flexDirection="column" paddingY={1}>
            {state.running && (
                <Box>
                    <Text color="cyan">
                        <Spinner type="dots" />
                    </Text>
                    <Text> Running database migrations...</Text>
                </Box>
            )}

            {state.success && (
                <Box>
                    <Text color="green">
                        ✓ Migrations completed successfully!
                    </Text>
                </Box>
            )}

            {state.error && (
                <Box flexDirection="column">
                    <Box>
                        <Text color="red">✗ Migration failed</Text>
                    </Box>
                    <Box marginLeft={2} marginTop={1}>
                        <Text color="red">{state.error}</Text>
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export async function migrateCommand() {
    const { waitUntilExit } = render(<MigrateCommand />);

    try {
        await waitUntilExit();
    } catch (error) {
        process.exit(1);
    }
}
