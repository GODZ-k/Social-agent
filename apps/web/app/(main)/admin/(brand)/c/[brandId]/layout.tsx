import WorkspaceLayout from "@/modules/shell/components/workspace-layout";
import React from "react";
import { routes } from "@/config/routes";
import type { WorkspaceBase } from "@/config/routes";

function layout(props: {
  children: React.ReactNode;
  params: Promise<{ brandId: string }>;
  isAdmin?: boolean;
  basePath?: WorkspaceBase;
}) {
  return <WorkspaceLayout {...props} isAdmin={true} basePath={routes.admin.brand.base} />;
}

export default layout;
