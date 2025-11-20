-- CreateTable
CREATE TABLE "UserWorkspacePermission" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "workspaceId" INTEGER NOT NULL,
    "permission" TEXT NOT NULL DEFAULT 'VIEW',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserWorkspacePermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserWorkspacePermission_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "UserWorkspacePermission_userId_idx" ON "UserWorkspacePermission"("userId");

-- CreateIndex
CREATE INDEX "UserWorkspacePermission_workspaceId_idx" ON "UserWorkspacePermission"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "UserWorkspacePermission_userId_workspaceId_key" ON "UserWorkspacePermission"("userId", "workspaceId");
