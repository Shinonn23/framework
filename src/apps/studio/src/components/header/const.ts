import { Calculator, Calendar, Code, Database, FileText, Package, Settings, User } from "lucide-react";
import { SearchFunction } from "./type";

const searchFunctionsMockup: SearchFunction[] = [
    {
        value: "search-files",
        label: "Search Files",
        icon: FileText,
        description: "Search across all files",
    },
    {
        value: "search-database",
        label: "Search Database",
        icon: Database,
        description: "Query database records",
    },
    {
        value: "search-code",
        label: "Search Code",
        icon: Code,
        description: "Find code snippets",
    },
    {
        value: "search-packages",
        label: "Search Packages",
        icon: Package,
        description: "Find npm packages",
    },
    {
        value: "calculator",
        label: "Calculator",
        icon: Calculator,
        description: "Quick calculations",
    },
    {
        value: "calendar",
        label: "Calendar",
        icon: Calendar,
        description: "View calendar events",
    },
    {
        value: "profile",
        label: "Profile",
        icon: User,
        description: "View your profile",
    },
    {
        value: "settings",
        label: "Settings",
        icon: Settings,
        description: "Application settings",
    },
];

export { searchFunctionsMockup };