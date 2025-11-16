import { RefreshCw } from "lucide-react";
import { Button } from "../ui/button";

function WorkspaceError({
    error,
    onRetry,
}: {
    error: string;
    onRetry: () => void;
}) {
    return (
        <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
            <h1 className="text-2xl font-bold mb-2">Workspace not found</h1>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={onRetry} variant="default">
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
            </Button>
        </div>
    );
}

export default WorkspaceError;