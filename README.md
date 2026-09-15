# social_agent

A [Turborepo](https://turborepo.dev/) + [pnpm](https://pnpm.io/) workspace.

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

- `api`: an [Express 5](https://expressjs.com/) API (`apps/api`). Dev via `tsx watch`, production build bundled with `tsup` to `dist/server.js`.
- `web`: a [Next.js](https://nextjs.org/) app on port 3000
- `docs`: a [Next.js](https://nextjs.org/) app on port 3001
- `@social-agent/shared`: shared zod schemas / types / constants (`packages/shared`), built with `tsc` to `dist`. Consumed by `api`.
- `@repo/ui`: a stub React component library shared by `web` and `docs`
- `@repo/eslint-config`: shared `eslint` configurations (`packages/config/eslint-config`)
- `@repo/typescript-config`: shared `tsconfig.json` bases (`packages/config/typescript-config`)

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Common commands

```sh
pnpm install                 # install everything (pnpm 11, Node >= 24)
pnpm dev                     # run all dev servers (api :8080, web :3000, docs :3001)
pnpm dev --filter=api        # just the API (builds @social-agent/shared first)
pnpm build                   # build every package, topologically
pnpm check-types             # tsc --noEmit everywhere
pnpm lint
```

> **Windows note:** if `turbo` fails with "An Application Control policy has blocked this file",
> Smart App Control is rejecting the unsigned `turbo.exe`. It is usually transient: retry after a
> minute or bump `turbo` to a newer patch release. Disabling Smart App Control is a last resort.

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

### Build

To build all apps and packages, run the following command:

With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed (recommended):

```sh
turbo build
```

Without global `turbo`, use your package manager:

```sh
npx turbo build
pnpm exec turbo build
pnpm exec turbo build
```

You can build a specific package by using a [filter](https://turborepo.dev/docs/crafting-your-repository/running-tasks#using-filters):

With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed:

```sh
turbo build --filter=docs
```

Without global `turbo`:

```sh
npx turbo build --filter=docs
pnpm exec turbo build --filter=docs
pnpm exec turbo build --filter=docs
```

### Develop

To develop all apps and packages, run the following command:

With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed (recommended):

```sh
turbo dev
```

Without global `turbo`, use your package manager:

```sh
npx turbo dev
pnpm exec turbo dev
pnpm exec turbo dev
```

You can develop a specific package by using a [filter](https://turborepo.dev/docs/crafting-your-repository/running-tasks#using-filters):

With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed:

```sh
turbo dev --filter=web
```

Without global `turbo`:

```sh
npx turbo dev --filter=web
pnpm exec turbo dev --filter=web
pnpm exec turbo dev --filter=web
```

### Remote Caching

> [!TIP]
> Vercel Remote Cache is free for all plans. Get started today at [vercel.com](https://vercel.com/signup?utm_source=remote-cache-sdk&utm_campaign=free_remote_cache).

Turborepo can use a technique known as [Remote Caching](https://turborepo.dev/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup?utm_source=turborepo-examples), then enter the following commands:

With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed (recommended):

```sh
turbo login
```

Without global `turbo`, use your package manager:

```sh
npx turbo login
pnpm exec turbo login
pnpm exec turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed:

```sh
turbo link
```

Without global `turbo`:

```sh
npx turbo link
pnpm exec turbo link
pnpm exec turbo link
```

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turborepo.dev/docs/crafting-your-repository/running-tasks)
- [Caching](https://turborepo.dev/docs/crafting-your-repository/caching)
- [Remote Caching](https://turborepo.dev/docs/core-concepts/remote-caching)
- [Filtering](https://turborepo.dev/docs/crafting-your-repository/running-tasks#using-filters)
- [Configuration Options](https://turborepo.dev/docs/reference/configuration)
- [CLI Usage](https://turborepo.dev/docs/reference/command-line-reference)
