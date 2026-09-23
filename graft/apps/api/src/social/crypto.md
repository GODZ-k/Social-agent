# apps/api/src/social/crypto.ts

- socialCryptoReady · function · L7-L7 — socialCryptoReady = ()
- keyFor · function · L10-L13 — function keyFor(purpose: "token" | "state"): Buffer
- encode · function · L15-L15 — encode = (bytes: Buffer)
- decode · function · L16-L16 — decode = (text: string)
- encryptSecret · function · L19-L24 — function encryptSecret(plain: string): string
- decryptSecret · function · L26-L33 — function decryptSecret(stored: string): string
- signPayload · function · L35-L37 — function signPayload(payload: string): string
- signatureMatches · function · L39-L43 — function signatureMatches(payload: string, signature: string): boolean
