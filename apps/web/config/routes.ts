
function brandWorkspace<Base extends string>(base: Base) {
  return {
    /** What `WorkspaceLayout` and the nav links are built from. */
    base,
    overview: (brandId: string) => `${base}/${brandId}`,
    analytics: (brandId: string) => `${base}/${brandId}/analytics`,
    approvals: (brandId: string) => `${base}/${brandId}/approvals`,
    calendar: (brandId: string) => `${base}/${brandId}/calendar`,
    content: (brandId: string) => `${base}/${brandId}/content`,
    settings: (brandId: string) => `${base}/${brandId}/settings`,
    settingsTab: (brandId: string, tab: BrandSettingsTab) => `${base}/${brandId}/settings?tab=${tab}`,
    strategy: (brandId: string) => `${base}/${brandId}/strategy`,
    strategyAsk: (brandId: string) => `${base}/${brandId}/strategy?ask=1`,
    research: (brandId: string) => `${base}/${brandId}/strategy/research`,
    postSheet: (brandId: string, postId: string) => `${base}/${brandId}?post=${postId}`,
    segment: (brandId: string, segment: string) => (segment ? `${base}/${brandId}/${segment}` : `${base}/${brandId}`),
  };
}

export type BrandSettingsTab = "brand" | "accounts" | "preferences";

export type AgencySettingsTab = "team" | "notifications";

const adminRoutes = {
  home: "/admin",
  clients: {
    list: "/admin/clients",
    needsYou: "/admin/clients?filter=needs-you",
    invite: "/admin/clients?invite=1",
    detail: (clientId: string) => `/admin/clients/${clientId}`,
    newBrand: (clientId: string) => `/admin/clients/${clientId}/brand/new`,
    resumeBrand: (clientId: string, brandId: string) => `/admin/clients/${clientId}/brand/new?brandId=${brandId}`,
  },
  settings: {
    root: "/admin/settings",
    tab: (tab: AgencySettingsTab) => `/admin/settings?tab=${tab}`,
  },
  observability: {
    overview: "/admin/observability",
    agents: "/admin/observability/agents",
    agentsForRange: (range: string) => `/admin/observability/agents?range=${range}`,
    agentRun: (runId: string) => `/admin/observability/agents/${runId}`,
    frontend: "/admin/observability/frontend",
    frontendError: (errorId: string) => `/admin/observability/frontend/${errorId}`,
    server: "/admin/observability/server",
  },
  brand: brandWorkspace("/admin/c"),
};

const authRoutes = {
  signIn: "/sign-in",
  signUp: "/sign-up",
  ssoCallback: "/sso-callback",
  verify: "/verify",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  invite: "/invite",
  twoFactor: "/two-factor",
  twoFactorLostAccess: "/two-factor/lost-access",
  twoFactorSetup: "/two-factor/setup",
};

export const routes = {
  home: "/",
  auth: authRoutes,
  onboarding: {
    start: "/onboarding",
    manual: "/onboarding/manual",
    forUrl: (url: string) => `/onboarding?url=${encodeURIComponent(url)}`,
    resume: (brandId: string) => `/onboarding?brandId=${brandId}`,
    forClient: (clientId: string) => `/onboarding?for=${clientId}`,
  },
  brand: brandWorkspace("/c"),
  admin: adminRoutes,
};

export type WorkspaceBase = typeof routes.brand.base | typeof routes.admin.brand.base;

export function workspaceRoutes(base: WorkspaceBase) {
  return base === routes.admin.brand.base ? routes.admin.brand : routes.brand;
}

export const publicRoutePatterns = [
  `${authRoutes.signIn}(/.*)?`,
  `${authRoutes.signUp}(/.*)?`,
  `${authRoutes.ssoCallback}(/.*)?`,
  `${authRoutes.verify}(/.*)?`,
  `${authRoutes.forgotPassword}(/.*)?`,
  `${authRoutes.resetPassword}(/.*)?`,
  `${authRoutes.invite}(/.*)?`,
  authRoutes.twoFactor,
  authRoutes.twoFactorLostAccess,
];

export const signedOutOnlyRoutePatterns = [
  `${authRoutes.signIn}(/.*)?`,
  `${authRoutes.signUp}(/.*)?`,
  `${authRoutes.verify}(/.*)?`,
  `${authRoutes.forgotPassword}(/.*)?`,
  `${authRoutes.resetPassword}(/.*)?`,
  authRoutes.twoFactor,
  authRoutes.twoFactorLostAccess,
];
