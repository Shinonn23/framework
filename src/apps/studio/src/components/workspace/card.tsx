import React from "react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Icon, IconName } from "@/components/ui/icon-picker";

interface WorkspaceCardProps {
    title: string;
    description?: string;
    icon?: string;
}

const WorkspaceCard = React.forwardRef<HTMLDivElement, WorkspaceCardProps>(
    ({ title, description, icon }, ref) => {
        return (
            <Card ref={ref}>
                <CardHeader>
                    {icon && (
                        <div className="text-2xl mb-2" aria-label={icon}>
                            <Icon name={icon as IconName} className="h-6 w-6" />
                        </div>
                    )}
                    <CardTitle className="truncate">{title}</CardTitle>
                    {description && (
                        <CardDescription className="line-clamp-2">
                            {description}
                        </CardDescription>
                    )}
                </CardHeader>
            </Card>
        );
    },
);

WorkspaceCard.displayName = "WorkspaceCard";

export default WorkspaceCard;
