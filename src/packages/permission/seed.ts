import { prisma } from "../prisma";

const RESOURCES = ["project", "module", "document", "report", "workspace"];
const ACTIONS = ["create", "read", "update", "delete"];

export async function seedPermissions() {
    // 1. Create Permissions
    const permissions: string[] = ["*"]; // Global wildcard

    for (const res of RESOURCES) {
        permissions.push(`${res}:*`); // Resource wildcard
        for (const act of ACTIONS) {
            permissions.push(`${res}:${act}`);
        }
    }

    for (const action of permissions) {
        await prisma.permission.upsert({
            where: { action },
            update: {},
            create: { action, description: `Permission to ${action}` },
        });
    }

    // 2. Create Roles
    // Super Admin (Global)
    let superAdmin = await prisma.role.findFirst({
        where: { name: "Super Admin", projectId: null },
    });

    if (!superAdmin) {
        superAdmin = await prisma.role.create({
            data: {
                name: "Super Admin",
                projectId: null,
                description: "Global System Administrator",
            },
        });
    }

    // Assign '*' to Super Admin
    const allPerm = await prisma.permission.findUnique({
        where: { action: "*" },
    });
    if (allPerm) {
        await prisma.rolePermission.upsert({
            where: {
                roleId_permissionId: {
                    roleId: superAdmin.id,
                    permissionId: allPerm.id,
                },
            },
            update: {},
            create: { roleId: superAdmin.id, permissionId: allPerm.id },
        });
    }

    // Project Roles (Templates)
    const rolesDef = [
        { name: "Owner", perms: ["*"] },
        { name: "Editor", perms: ["read", "create", "update"] },
        { name: "Viewer", perms: ["read"] },
    ];

    for (const r of rolesDef) {
        let role = await prisma.role.findFirst({
            where: { name: r.name, projectId: null },
        });

        if (!role) {
            role = await prisma.role.create({
                data: {
                    name: r.name,
                    projectId: null,
                    description: `Standard ${r.name} Role`,
                },
            });
        }

        // Assign permissions
        // For "Owner", we might want specific resource wildcards or just rely on logic.
        // If I assign "project:*" to Owner, and Owner is assigned to a Project, it works.
        // But if Owner is assigned to a Module, "project:*" doesn't make sense?
        // Actually, if I assign Owner to a Module, I expect them to own the Module.
        // So they should have "module:*" and "document:*" etc.
        // This implies Roles might need to be resource-specific or we use broad permissions.
        // Let's stick to the plan:
        // Owner: All permissions on the target resource and children.
        // If I assign Owner on Project, they get everything.
        // If I assign Owner on Module, they get everything in Module.
        // So "Owner" role should map to ALL actions?
        // Or maybe we just give them `*`?
        // If I give `*` to Owner, and assign Owner to Project 1.
        // `check(user, 'project:delete', 'Project', 1)` -> resolves permissions.
        // Direct grant Owner -> `*`.
        // So yes, `*` works for Owner on that resource.

        // For Editor:
        // They need `read`, `create`, `update` on the resource and children.
        // So we need to map these to actual permission strings.
        // If assigned to Project, they need `project:read`, `module:create`, etc.
        // This is hard to map generically if we use specific strings like `project:read`.
        // Unless we use generic strings like `read`, `write`?
        // But user asked for `project:read`.

        // Solution:
        // The "Editor" role should probably contain a huge list of permissions:
        // `project:read`, `project:update`
        // `module:read`, `module:create`, `module:update`
        // `document:read`, `document:create`, `document:update`
        // ...

        // Let's build that list.
        const rolePerms: string[] = [];
        if (r.name === "Owner") {
            // Owner gets everything.
            // But wait, `*` is global wildcard.
            // If I have `*` permission, does it mean I can do anything?
            // Yes, my service checks `actions.has("*")`.
            // So Owner gets `*`.
            rolePerms.push("*");
        } else {
            for (const res of RESOURCES) {
                for (const p of r.perms) {
                    rolePerms.push(`${res}:${p}`);
                }
            }
        }

        for (const action of rolePerms) {
            // We need to find the permission ID
            const perm = await prisma.permission.findUnique({
                where: { action },
            });
            if (perm) {
                await prisma.rolePermission.upsert({
                    where: {
                        roleId_permissionId: {
                            roleId: role.id,
                            permissionId: perm.id,
                        },
                    },
                    update: {},
                    create: { roleId: role.id, permissionId: perm.id },
                });
            }
        }
    }
}
