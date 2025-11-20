# Permission System

ระบบจัดการสิทธิ์การเข้าถึง Project และ Workspace แบบละเอียด (Fine-grained Access Control)

## Permission Levels

### Project-Level Permissions

| Level | Description | Capabilities |
|-------|-------------|--------------|
| **OWNER** | เจ้าของโปรเจค | - ลบโปรเจค<br>- โอนความเป็นเจ้าของ<br>- จัดการสิทธิ์ทั้งหมด<br>- เข้าถึง workspaces ทั้งหมด (FULL) |
| **ADMIN** | ผู้ดูแลระบบ | - จัดการ settings<br>- จัดการ workspaces<br>- ให้สิทธิ์ (ยกเว้น OWNER)<br>- เข้าถึง workspaces ทั้งหมด (FULL) |
| **EDITOR** | ผู้แก้ไข | - แก้ไข workspaces ทั้งหมด (EDIT)<br>- แก้ไข content<br>- สามารถถูกจำกัดสิทธิ์ในบาง workspace |
| **VIEWER** | ผู้ดู | - ดู project (Read-only)<br>- ดู workspaces ทั้งหมด (VIEW)<br>- สามารถได้สิทธิ์เพิ่มในบาง workspace |

### Workspace-Level Permissions

| Level | Description | Use Case |
|-------|-------------|----------|
| **FULL** | สิทธิ์เต็ม | ผู้จัดการ workspace - แก้ไขได้ทุกอย่าง |
| **EDIT** | แก้ไขได้ | ผู้ร่วมงาน - แก้ไข content ได้ |
| **VIEW** | ดูอย่างเดียว | ผู้ตรวจสอบ - อ่านอย่างเดียว |
| **NONE** | ปฏิเสธการเข้าถึง | ปิดกั้นการเข้าถึง workspace นี้โดยเฉพาะ |

## How Permissions Work

### Permission Inheritance

1. **OWNER & ADMIN**: เข้าถึงทุก workspace ด้วยสิทธิ์ FULL (ไม่สามารถถูกจำกัดได้)
2. **EDITOR**: เข้าถึงทุก workspace ด้วยสิทธิ์ EDIT (ยกเว้นถูกตั้งเป็น NONE)
3. **VIEWER**: เข้าถึงทุก workspace ด้วยสิทธิ์ VIEW (สามารถได้สิทธิ์เพิ่ม)

### Workspace-Specific Permissions

- **Override Default**: สามารถกำหนดสิทธิ์เฉพาะ workspace ได้
- **NONE Permission**: ปิดกั้นการเข้าถึง (ใช้กับ EDITOR, VIEWER)
- **Enhanced Access**: เพิ่มสิทธิ์ให้ VIEWER ได้ EDIT/FULL ในบาง workspace

## Installation

```typescript
import { PermissionManager, Permission } from "@/packages/permission";
import {
    WorkspacePermissionManager,
    WorkspacePermission,
} from "@/packages/permission/workspace";
import { PrismaClient } from "@/packages/prisma/generated";

const prisma = new PrismaClient();
const permissionManager = new PermissionManager(prisma);
const workspacePermissionManager = new WorkspacePermissionManager(prisma);
```

## Basic Usage

### Project Permissions

#### 1. Grant Project Permission

```typescript
// Owner (user 1) grants EDITOR permission to user 2
const result = await permissionManager.grantPermission(
    1,              // Granter ID (must be OWNER or ADMIN)
    2,              // User ID to grant permission
    projectId,      // Project ID
    "EDITOR"        // Permission level
);

if (result.success) {
    console.log("Permission granted");
} else {
    console.log("Error:", result.error);
}
```

#### 2. Check Project Permission

```typescript
// Check if user has at least EDITOR permission
const hasPermission = await permissionManager.hasPermission(
    userId,
    projectId,
    "EDITOR"
);

if (hasPermission) {
    // User can edit
}
```

### Workspace Permissions

#### 1. Grant Workspace-Specific Permission

```typescript
// Give user EDIT permission on specific workspace
const result = await workspacePermissionManager.grantWorkspacePermission(
    adminId,        // Granter (ADMIN or EDITOR)
    userId,         // User to grant permission
    workspaceId,    // Specific workspace
    "EDIT"          // Permission level
);

if (result.success) {
    console.log("Workspace permission granted");
}
```

#### 2. Deny Access to Specific Workspace

```typescript
// Prevent EDITOR from accessing a workspace
await workspacePermissionManager.grantWorkspacePermission(
    adminId,
    editorUserId,
    workspaceId,
    "NONE"          // Explicitly deny access
);
```

#### 3. Grant Enhanced Access

```typescript
// Give VIEWER user EDIT access to specific workspace
await workspacePermissionManager.grantWorkspacePermission(
    adminId,
    viewerUserId,
    workspaceId,
    "EDIT"          // Override default VIEW with EDIT
);
```

#### 4. Check Workspace Permission

```typescript
const hasPermission =
    await workspacePermissionManager.hasWorkspacePermission(
        userId,
        workspaceId,
        "EDIT"
    );

if (hasPermission) {
    // User can edit this workspace
}
```

#### 5. Get Effective Workspace Permission

```typescript
const permissions =
    await workspacePermissionManager.getUserWorkspacePermission(
        userId,
        workspaceId
    );

console.log("Project role:", permissions.projectPermission);
console.log("Workspace override:", permissions.workspacePermission);
console.log("Effective permission:", permissions.effectivePermission);
// Example output:
// Project role: VIEWER
// Workspace override: EDIT
// Effective permission: EDIT
```

#### 6. List User's Accessible Workspaces

```typescript
const workspaces =
    await workspacePermissionManager.getUserAccessibleWorkspaces(
        userId,
        projectId
    );

workspaces.forEach((ws) => {
    console.log(`${ws.name}: ${ws.effectivePermission}`);
});
```

### 2. Check Permission (Legacy)

```typescript
const permission = await permissionManager.getUserPermission(
    userId,
    projectId
);

console.log(`User has ${permission} permission`);
// Output: "User has EDITOR permission"
```

### 4. Revoke Permission

```typescript
const result = await permissionManager.revokePermission(
    adminId,        // Admin or Owner ID
    userId,         // User to revoke permission from
    projectId
);
```

### 5. List Project Permissions

```typescript
const permissions = await permissionManager.getProjectPermissions(projectId);

console.log("Owner:", permissions.owner);
console.log("Users:", permissions.users);
```

### 6. List User's Projects

```typescript
const projects = await permissionManager.getUserProjects(userId);

console.log("Owned:", projects.owned);
console.log("Shared:", projects.shared);
```

## Using Middleware

### Project Middleware

```typescript
import {
    canViewProject,
    canEditProject,
    canAdminProject,
    isProjectOwner,
} from "@/packages/permission/middleware";

// Check view permission
const viewResult = await canViewProject(userId, projectId);
if (!viewResult.allowed) {
    throw new Error(viewResult.error);
}

// Check edit permission
const editResult = await canEditProject(userId, projectId);
if (editResult.allowed) {
    // Perform edit
}
```

### Workspace Middleware

```typescript
import {
    canViewWorkspace,
    canEditWorkspace,
    hasFullWorkspaceAccess,
} from "@/packages/permission/middleware";

// Check if user can view workspace
const viewResult = await canViewWorkspace(userId, workspaceId);
if (!viewResult.allowed) {
    throw new Error(viewResult.error);
}

// Check if user can edit workspace
const editResult = await canEditWorkspace(userId, workspaceId);
if (editResult.allowed) {
    // Perform edit
}

// Check if user has full access
const fullResult = await hasFullWorkspaceAccess(userId, workspaceId);
if (fullResult.allowed) {
    // Manage workspace
}
```

## Permission Use Cases

### Use Case 1: Department-Specific Workspaces

```typescript
// Project: Company Dashboard
// User A: PROJECT EDITOR (can edit all workspaces by default)
// User B: PROJECT VIEWER (can only view by default)

// Create workspaces
const financeWs = await prisma.workspace.create({
    data: { name: "Finance", projectId }
});
const hrWs = await prisma.workspace.create({
    data: { name: "HR", projectId }
});

// Restrict User A from Finance workspace
await workspacePermissionManager.grantWorkspacePermission(
    ownerId,
    userA_Id,
    financeWs.id,
    "NONE"  // Deny access
);

// Give User B edit access to HR workspace
await workspacePermissionManager.grantWorkspacePermission(
    ownerId,
    userB_Id,
    hrWs.id,
    "EDIT"  // Enhanced from VIEW to EDIT
);

// Result:
// User A: Can edit all except Finance
// User B: Can view all, but can edit HR
```

### Use Case 2: External Collaborator

```typescript
// Give external user access to only one workspace
const externalUser = await prisma.user.create({
    data: { username: "external", email: "external@company.com" }
});

// No project-level permission needed
// Grant direct workspace permission
await workspacePermissionManager.grantWorkspacePermission(
    ownerId,
    externalUser.id,
    specificWorkspaceId,
    "EDIT"
);

// Result: External user can only access this specific workspace
```

### Use Case 3: Temporary Access

```typescript
// Give VIEWER temporary EDIT access to workspace
await workspacePermissionManager.grantWorkspacePermission(
    adminId,
    viewerId,
    workspaceId,
    "EDIT"
);

// Later, revoke it
await workspacePermissionManager.revokeWorkspacePermission(
    adminId,
    viewerId,
    workspaceId
);

// Result: User returns to default VIEWER (VIEW) permission
```

## Permission Rules

### Project-Level Rules

#### Granting Permissions

- **OWNER** can grant any permission (including OWNER)
- **ADMIN** can grant ADMIN, EDITOR, VIEWER (but not OWNER)
- **EDITOR** and **VIEWER** cannot grant permissions

#### Revoking Permissions

- Same rules as granting
- Cannot revoke permission higher than your own level

#### Permission Hierarchy

```
OWNER (4) > ADMIN (3) > EDITOR (2) > VIEWER (1)
```

When checking permissions:
- If you need EDITOR, ADMIN and OWNER also pass
- If you need ADMIN, only ADMIN and OWNER pass
- If you need OWNER, only OWNER passes

### Workspace-Level Rules

#### Permission Inheritance

Default workspace permissions based on project role:
- **OWNER**: FULL on all workspaces (cannot be overridden)
- **ADMIN**: FULL on all workspaces (cannot be overridden)
- **EDITOR**: EDIT on all workspaces (can be reduced to NONE)
- **VIEWER**: VIEW on all workspaces (can be enhanced to EDIT or reduced to NONE)

#### Workspace Permission Hierarchy

```
FULL (3) > EDIT (2) > VIEW (1) > NONE (0)
```

#### Override Rules

- OWNER and ADMIN always have FULL access (no overrides allowed)
- EDITOR: Can be denied (NONE) but not enhanced
- VIEWER: Can be enhanced (EDIT) or denied (NONE)

#### Granting Workspace Permissions

- **OWNER** can grant any workspace permission
- **ADMIN** can grant any workspace permission
- **EDITOR** and **VIEWER** cannot grant workspace permissions

## Database Schema

### Project Permission Models

```prisma
enum Permission {
    OWNER
    ADMIN
    EDITOR
    VIEWER
}

model ProjectPermission {
    id        Int        @id @default(autoincrement())
    userId    Int
    projectId Int
    role      Permission @default(VIEWER)
    
    user    User    @relation(fields: [userId], references: [id])
    project Project @relation(fields: [projectId], references: [id])
    
    @@unique([userId, projectId])
}
```

### Workspace Permission Models

```prisma
enum WorkspacePermission {
    FULL
    EDIT
    VIEW
    NONE
}

model UserWorkspacePermission {
    id            Int                 @id @default(autoincrement())
    userId        Int
    workspaceId   Int
    permission    WorkspacePermission
    grantedById   Int
    grantedAt     DateTime            @default(now())

    user        User      @relation(fields: [userId], references: [id])
    workspace   Workspace @relation(fields: [workspaceId], references: [id])
    grantedBy   User      @relation("GrantedWorkspacePermissions", fields: [grantedById], references: [id])

    @@unique([userId, workspaceId])
}
```

## Common Use Cases

### Project-Level Use Cases

#### API Route Protection

```typescript
// GET /api/projects/:id
async function getProject(userId: number, projectId: number) {
    const viewCheck = await canViewProject(userId, projectId);
    if (!viewCheck.allowed) {
        return { error: "Forbidden", status: 403 };
    }
    
    return await prisma.project.findUnique({ where: { id: projectId } });
}

// PUT /api/projects/:id
async function updateProject(userId: number, projectId: number, data: any) {
    const editCheck = await canEditProject(userId, projectId);
    if (!editCheck.allowed) {
        return { error: "Forbidden", status: 403 };
    }
    
    return await prisma.project.update({
        where: { id: projectId },
        data,
    });
}

// DELETE /api/projects/:id
async function deleteProject(userId: number, projectId: number) {
    const ownerCheck = await isProjectOwner(userId, projectId);
    if (!ownerCheck.allowed) {
        return { error: "Forbidden", status: 403 };
    }
    
    return await prisma.project.delete({ where: { id: projectId } });
}
```

#### Team Collaboration

```typescript
// Add team member as EDITOR
await permissionManager.grantPermission(
    ownerId,
    teamMemberId,
    projectId,
    "EDITOR"
);

// Promote to ADMIN
await permissionManager.grantPermission(
    ownerId,
    teamMemberId,
    projectId,
    "ADMIN"
);

// Remove team member
await permissionManager.revokePermission(
    ownerId,
    teamMemberId,
    projectId
);
```

### Workspace-Level Use Cases

#### Workspace Content Protection

```typescript
// GET /api/workspaces/:id/content
async function getWorkspaceContent(userId: number, workspaceId: number) {
    const viewCheck = await canViewWorkspace(userId, workspaceId);
    if (!viewCheck.allowed) {
        return { error: "Forbidden", status: 403 };
    }
    
    return await prisma.workspace.findUnique({
        where: { id: workspaceId },
        include: { content: true },
    });
}

// PUT /api/workspaces/:id/content
async function updateWorkspaceContent(
    userId: number,
    workspaceId: number,
    data: any
) {
    const editCheck = await canEditWorkspace(userId, workspaceId);
    if (!editCheck.allowed) {
        return { error: "Forbidden", status: 403 };
    }
    
    return await prisma.workspace.update({
        where: { id: workspaceId },
        data,
    });
}
```

#### Department-Specific Access

```typescript
// Create department workspaces
const finance = await prisma.workspace.create({
    data: { name: "Finance Reports", projectId },
});
const engineering = await prisma.workspace.create({
    data: { name: "Engineering Docs", projectId },
});

// Finance team gets full access to finance workspace only
for (const userId of financeTeamIds) {
    await workspacePermissionManager.grantWorkspacePermission(
        ownerId,
        userId,
        finance.id,
        "FULL"
    );
    await workspacePermissionManager.grantWorkspacePermission(
        ownerId,
        userId,
        engineering.id,
        "NONE"
    );
}

// Engineering team gets full access to engineering workspace only
for (const userId of engineeringTeamIds) {
    await workspacePermissionManager.grantWorkspacePermission(
        ownerId,
        userId,
        engineering.id,
        "FULL"
    );
    await workspacePermissionManager.grantWorkspacePermission(
        ownerId,
        userId,
        finance.id,
        "NONE"
    );
}
```

## Examples

See `examples.ts` for more detailed usage examples.
