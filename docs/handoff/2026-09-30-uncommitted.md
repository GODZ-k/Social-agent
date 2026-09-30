# Uncommitted at the 2026-09-30 machine switch

*A checklist, not a backup. If the owner committed before switching machines, git already has all of this and this file is only useful for confirming nothing was left behind. Generated from `git status` against `d5bbd5b` on branch `backend`. Context: `HANDOFF.md` section 1 and its caution block.*

## Summary

- 78 files changed, 1057 insertions(+), 439 deletions(-)
- Baseline commit: `d5bbd5b` on `backend`

## Files

```
A  .agents/skills/clerk-react-router-patterns/templates/react-router-basic-auth/app/app.css
M  .claude/helpers/graft-hooks.cjs
M  .claude/helpers/graft-statusline.cjs
A  .claude/skills/clerk-react-router-patterns/templates/react-router-basic-auth/app/app.css
M  apps/web/app/(auth)/invite/[[...token]]/page.tsx
M  apps/web/app/(auth)/reset-password/page.tsx
M  apps/web/app/(auth)/sign-in/page.tsx
M  apps/web/app/(auth)/sign-up/page.tsx
M  apps/web/app/(auth)/two-factor/manage/page.tsx
M  apps/web/app/(auth)/two-factor/page.tsx
M  apps/web/app/(auth)/two-factor/setup/page.tsx
M  apps/web/app/(auth)/verify/page.tsx
D  apps/web/app/account/page.tsx
M  apps/web/app/admin/(agency)/clients/[clientId]/page.tsx
M  apps/web/app/admin/(agency)/clients/page.tsx
M  apps/web/app/admin/(agency)/layout.tsx
M  apps/web/app/admin/(agency)/observability/agents/[runId]/page.tsx
M  apps/web/app/admin/(agency)/observability/agents/page.tsx
M  apps/web/app/admin/(agency)/observability/frontend/[errorId]/page.tsx
M  apps/web/app/admin/(agency)/observability/frontend/page.tsx
M  apps/web/app/admin/(agency)/observability/page.tsx
M  apps/web/app/admin/(agency)/observability/server/page.tsx
M  apps/web/app/admin/(agency)/settings/page.tsx
M  apps/web/app/admin/(brand)/c/[brandId]/(workspace)/analytics/page.tsx
M  apps/web/app/admin/(brand)/c/[brandId]/(workspace)/approvals/page.tsx
M  apps/web/app/admin/(brand)/c/[brandId]/(workspace)/calendar/page.tsx
M  apps/web/app/admin/(brand)/c/[brandId]/(workspace)/content/page.tsx
M  apps/web/app/admin/(brand)/c/[brandId]/(workspace)/layout.tsx
M  apps/web/app/admin/(brand)/c/[brandId]/(workspace)/page.tsx
M  apps/web/app/admin/(brand)/c/[brandId]/(workspace)/strategy/page.tsx
M  apps/web/app/admin/(brand)/c/[brandId]/(workspace)/strategy/research/page.tsx
M  apps/web/app/admin/(brand)/c/[brandId]/brand/new/page.tsx
M  apps/web/app/admin/layout.tsx
M  apps/web/app/c/[brandId]/analytics/page.tsx
M  apps/web/app/c/[brandId]/approvals/page.tsx
M  apps/web/app/c/[brandId]/calendar/page.tsx
M  apps/web/app/c/[brandId]/content/page.tsx
M  apps/web/app/c/[brandId]/layout.tsx
M  apps/web/app/c/[brandId]/page.tsx
M  apps/web/app/c/[brandId]/settings/page.tsx
M  apps/web/app/c/[brandId]/strategy/page.tsx
M  apps/web/app/c/[brandId]/strategy/research/page.tsx
M  apps/web/app/layout.tsx
M  apps/web/app/onboarding/manual/page.tsx
M  apps/web/app/onboarding/page.tsx
M  apps/web/app/page.tsx
A  apps/web/components/auth/auth-form-skeleton.tsx
M  apps/web/components/shell/account-menu.tsx
M  apps/web/components/shell/admin-brand-header.tsx
A  apps/web/components/shell/admin-header-skeleton.tsx
M  apps/web/components/shell/admin-header.tsx
M  apps/web/components/shell/admin-onboarding-header.tsx
M  apps/web/components/shell/header-menu.tsx
A  apps/web/components/shell/onboarding-header-skeleton.tsx
M  apps/web/components/shell/onboarding-header.tsx
M  apps/web/components/shell/workspace-chrome.tsx
M  apps/web/components/shell/workspace-header.tsx
A  apps/web/features/account/account-dialog.tsx
A  apps/web/features/account/account-row.tsx
A  apps/web/features/account/account-skeleton.tsx
A  apps/web/features/account/change-password-form.tsx
D  apps/web/features/account/password-panel.tsx
R  apps/web/features/account/details-panel.tsx -> apps/web/features/account/profile-tab.tsx
A  apps/web/features/account/security-tab.tsx
D  apps/web/features/account/sessions-panel.tsx
M  apps/web/lib/api/actions.ts
M  apps/web/lib/auth/clerk/client.ts
A  apps/web/lib/auth/clerk/password.ts
M  apps/web/lib/types.ts
M  apps/web/proxy.ts
M  docs/DESIGN_TRACKER.md
MM docs/HANDOFF.md
MM docs/MEMORY.md
M  packages/shared/src/index.ts
A  packages/shared/src/schema/account.schema.ts
A  packages/shared/src/types/.gitkeep
A  packages/shared/src/types/account.types.ts
A  packages/ui/src/components/modal.tsx
?? docs/handoff/2026-09-30-uncommitted.md
```

## Per-file diffstat

```
 .../templates/react-router-basic-auth/app/app.css  |   0
 .claude/helpers/graft-hooks.cjs                    |   2 +-
 .claude/helpers/graft-statusline.cjs               |   2 +-
 .../templates/react-router-basic-auth/app/app.css  |   0
 apps/web/app/(auth)/invite/[[...token]]/page.tsx   |   4 -
 apps/web/app/(auth)/reset-password/page.tsx        |  18 +--
 apps/web/app/(auth)/sign-in/page.tsx               |  43 +++++--
 apps/web/app/(auth)/sign-up/page.tsx               |  29 +++--
 apps/web/app/(auth)/two-factor/manage/page.tsx     |  35 ++++--
 apps/web/app/(auth)/two-factor/page.tsx            |  33 ++++--
 apps/web/app/(auth)/two-factor/setup/page.tsx      |   4 -
 apps/web/app/(auth)/verify/page.tsx                |  26 +++--
 apps/web/app/account/page.tsx                      |  41 -------
 .../app/admin/(agency)/clients/[clientId]/page.tsx |   4 -
 apps/web/app/admin/(agency)/clients/page.tsx       |   4 -
 apps/web/app/admin/(agency)/layout.tsx             |  19 ++--
 .../(agency)/observability/agents/[runId]/page.tsx |   4 -
 .../admin/(agency)/observability/agents/page.tsx   |   4 -
 .../observability/frontend/[errorId]/page.tsx      |   4 -
 .../admin/(agency)/observability/frontend/page.tsx |   4 -
 apps/web/app/admin/(agency)/observability/page.tsx |   4 -
 .../admin/(agency)/observability/server/page.tsx   |   4 -
 apps/web/app/admin/(agency)/settings/page.tsx      |   4 -
 .../c/[brandId]/(workspace)/analytics/page.tsx     |   4 -
 .../c/[brandId]/(workspace)/approvals/page.tsx     |   4 -
 .../c/[brandId]/(workspace)/calendar/page.tsx      |   4 -
 .../c/[brandId]/(workspace)/content/page.tsx       |   4 -
 .../(brand)/c/[brandId]/(workspace)/layout.tsx     |   7 +-
 .../admin/(brand)/c/[brandId]/(workspace)/page.tsx |   4 -
 .../c/[brandId]/(workspace)/strategy/page.tsx      |   4 -
 .../(workspace)/strategy/research/page.tsx         |   4 -
 .../admin/(brand)/c/[brandId]/brand/new/page.tsx   |   4 -
 apps/web/app/admin/layout.tsx                      |  32 ++++--
 apps/web/app/c/[brandId]/analytics/page.tsx        |   4 -
 apps/web/app/c/[brandId]/approvals/page.tsx        |   4 -
 apps/web/app/c/[brandId]/calendar/page.tsx         |   4 -
 apps/web/app/c/[brandId]/content/page.tsx          |   4 -
 apps/web/app/c/[brandId]/layout.tsx                |   7 +-
 apps/web/app/c/[brandId]/page.tsx                  |   4 -
 apps/web/app/c/[brandId]/settings/page.tsx         |   4 -
 apps/web/app/c/[brandId]/strategy/page.tsx         |   4 -
 .../web/app/c/[brandId]/strategy/research/page.tsx |   4 -
 apps/web/app/layout.tsx                            |   4 -
 apps/web/app/onboarding/manual/page.tsx            |  19 ++--
 apps/web/app/onboarding/page.tsx                   |   4 -
 apps/web/app/page.tsx                              |   4 -
 apps/web/components/auth/auth-form-skeleton.tsx    |  24 ++++
 apps/web/components/shell/account-menu.tsx         |  79 +++++++------
 apps/web/components/shell/admin-brand-header.tsx   |   2 +-
 .../web/components/shell/admin-header-skeleton.tsx |  13 +++
 apps/web/components/shell/admin-header.tsx         |   2 +-
 .../components/shell/admin-onboarding-header.tsx   |   2 +-
 apps/web/components/shell/header-menu.tsx          |  14 ++-
 .../shell/onboarding-header-skeleton.tsx           |  12 ++
 apps/web/components/shell/onboarding-header.tsx    |   2 +-
 apps/web/components/shell/workspace-chrome.tsx     |  10 +-
 apps/web/components/shell/workspace-header.tsx     |   2 +-
 apps/web/features/account/account-dialog.tsx       | 123 +++++++++++++++++++++
 apps/web/features/account/account-row.tsx          |  33 ++++++
 apps/web/features/account/account-skeleton.tsx     |  79 +++++++++++++
 apps/web/features/account/change-password-form.tsx | 111 +++++++++++++++++++
 apps/web/features/account/password-panel.tsx       |  32 ------
 .../account/{details-panel.tsx => profile-tab.tsx} |  68 ++++++------
 apps/web/features/account/security-tab.tsx         | 114 +++++++++++++++++++
 apps/web/features/account/sessions-panel.tsx       |  46 --------
 apps/web/lib/api/actions.ts                        |  18 ++-
 apps/web/lib/auth/clerk/client.ts                  |   1 +
 apps/web/lib/auth/clerk/password.ts                |  42 +++++++
 apps/web/lib/types.ts                              |  25 +----
 apps/web/proxy.ts                                  |  24 ++++
 docs/DESIGN_TRACKER.md                             |  16 ++-
 docs/HANDOFF.md                                    |  46 +++++++-
 docs/MEMORY.md                                     |   7 +-
 packages/shared/src/index.ts                       |   2 +
 packages/shared/src/schema/account.schema.ts       |  25 +++++
 packages/shared/src/types/.gitkeep                 |   0
 packages/shared/src/types/account.types.ts         |  10 ++
 packages/ui/src/components/modal.tsx               |  79 +++++++++++++
 78 files changed, 1057 insertions(+), 439 deletions(-)
```
