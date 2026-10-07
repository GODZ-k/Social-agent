import WorkspaceLayout from "@/components/workspace/workspace-layout";
import { WorkspaceBasePath } from "@/lib/workspace-path";
import React from "react";

function layout(props: {
  children: React.ReactNode;
  params: Promise<{ brandId: string }>;
  isAdmin?: boolean;
  basePath?: WorkspaceBasePath;
}) {
  return <WorkspaceLayout {...props} isAdmin={true} basePath="/admin/c" />;
}

export default layout;
