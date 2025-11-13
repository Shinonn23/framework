import React from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartArea } from "lucide-react";

interface WorkspaceCardProps {
    title: string;
    description?: string;
    icon?: string;
}

function WorkspaceCard({ title, description, icon }: WorkspaceCardProps) {
    return (
        <Card>
            <CardHeader>
                {icon && (
                    <div className="text-2xl mb-2" aria-label={icon}>
                        <ChartArea/>
                    </div>
                )}
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
        </Card>
    );
}

export default WorkspaceCard;