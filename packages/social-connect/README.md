# @social-agent/social-connect

Connect a social media account for publishing. One small provider per network with the same
four steps: build the consent URL, exchange the code, refresh the token, and get the account's
identity back. No framework, no storage; zod is the one dependency. You keep the tokens.

This package does not remove the app reviews each network runs before an app may publish for
accounts other than its testers. It removes the code.

## Networks

| Network   | Login route                                | Status  |
| --------- | ------------------------------------------ | ------- |
| Instagram | Instagram API with Instagram Login (Meta)  | built   |
| Facebook  | Facebook Login with a Page (Meta)          | planned |
| LinkedIn  | OAuth 2.0, member or Community Management  | planned |
| TikTok    | Login Kit + Content Posting API            | planned |

## Use

```ts
import { createInstagramProvider } from "@social-agent/social-connect";

const instagram = createInstagramProvider({
  appId: process.env.INSTAGRAM_APP_ID!,
  appSecret: process.env.INSTAGRAM_APP_SECRET!,
  redirectUri: "https://api.example.com/oauth/instagram/callback",
});

// 1. Send the browser here. `state` is yours: sign it, check it on the way back.
const url = instagram.authorizeUrl(state);

// 2. On your redirect URI, swap the code. Three Meta calls: short-lived token, 60-day token, profile.
const account = await instagram.exchange(code);
// account.externalAccountId, account.handle, account.avatarUrl, account.scopes, account.token.expiresAt

// 3. Before the token ends (Instagram: 60 days, refreshable once it is a day old).
const fresh = await instagram.refresh(account.token);
```

Errors are `SocialConnectError` with the network's message and HTTP status. Tokens never appear
in messages.

## Shape

- `Provider`: `network`, `scopes`, `authorizeUrl(state)`, `exchange(code)`, `refresh(token)`.
- `ConnectedAccount`: `externalAccountId`, `handle`, `name`, `avatarUrl`, `token`, `scopes`.
- `OAuthToken`: `accessToken`, `refreshToken` (null when the access token refreshes itself), `expiresAt`.

The caller owns `state` signing, token encryption and the redirect routes. In this monorepo
that is `apps/api/src/social`.
