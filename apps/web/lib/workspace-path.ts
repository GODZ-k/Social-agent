export type WorkspaceBasePath = "/c" | "/admin/c";

/** A link inside a brand workspace, under the client's own tree or the admin's mirror of it. */
export function workspaceHref(basePath: WorkspaceBasePath, brandId: string, sub?: string): string {
  return `${basePath}/${brandId}${sub ?? ""}`;
}
