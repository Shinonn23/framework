import { ArchiveX, Book, House, Send, Trash2 } from "lucide-react";

export const data = {
    user: {
        name: "shadcn",
        email: "m@example.com",
        avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
        {
            title: "Projects",
            url: "/projects",
            icon: House,
            isActive: true,
            hasSubSidebar: false,
        },
        {
            title: "Model",
            url: "/model",
            icon: Book,
            isActive: false,
            hasSubSidebar: false,
        },
    ],
};
