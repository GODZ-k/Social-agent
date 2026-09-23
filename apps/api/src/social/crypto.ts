import { createCipheriv, createDecipheriv, createHmac, hkdfSync, randomBytes, timingSafeEqual } from "node:crypto";
import { config } from "@/config/constants";
import { env } from "@/config/env";

const { ALGORITHM, FORMAT_VERSION, IV_BYTES, KEY_BYTES } = config.crypto;

export const socialCryptoReady = () => Boolean(env.SOCIAL_TOKEN_KEY);

// One derived key per purpose, so a state signature can never decrypt a token.
function keyFor(purpose: "token" | "state"): Buffer {
    if (!env.SOCIAL_TOKEN_KEY) throw new Error("SOCIAL_TOKEN_KEY is not set");
    return Buffer.from(hkdfSync("sha256", Buffer.from(env.SOCIAL_TOKEN_KEY, "hex"), "", `cadence:${purpose}`, KEY_BYTES));
}

const encode = (bytes: Buffer) => bytes.toString("base64url");
const decode = (text: string) => Buffer.from(text, "base64url");

/** `v1.<iv>.<tag>.<ciphertext>` */
export function encryptSecret(plain: string): string {
    const iv = randomBytes(IV_BYTES);
    const cipher = createCipheriv(ALGORITHM, keyFor("token"), iv);
    const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
    return [FORMAT_VERSION, encode(iv), encode(cipher.getAuthTag()), encode(encrypted)].join(".");
}

export function decryptSecret(stored: string): string {
    const [version, iv, tag, data] = stored.split(".");
    if (version !== FORMAT_VERSION || !iv || !tag || !data) throw new Error("Unrecognised encrypted value");

    const decipher = createDecipheriv(ALGORITHM, keyFor("token"), decode(iv));
    decipher.setAuthTag(decode(tag));
    return Buffer.concat([decipher.update(decode(data)), decipher.final()]).toString("utf8");
}

export function signPayload(payload: string): string {
    return encode(createHmac("sha256", keyFor("state")).update(payload).digest());
}

export function signatureMatches(payload: string, signature: string): boolean {
    const expected = Buffer.from(signPayload(payload));
    const given = Buffer.from(signature);
    return expected.length === given.length && timingSafeEqual(expected, given);
}
