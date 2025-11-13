import { ScrollArea } from "@/components/ui/scroll-area";
import React from "react";

export default function projectsPage() {
    return (
        <ScrollArea className="h-full w-full pb-12">
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">My Projects</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage and edit your web builder projects
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"></div>
            </div>
        </ScrollArea>
    );
}
