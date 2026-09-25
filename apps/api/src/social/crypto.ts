import { createCipheriv, createDecipheriv, createHmac, hkdfSync, randomBytes, timingSafeEqual } from "node:crypto";
import { config } from "@/config/constants";
import { env } from "@/config/env";

const { ALGORITHM, FORMAT_VERSION, IV_BYTES, KEY_BYTES } = config.crypto;

export const socialCryptoReady = () => Boolean(env.SOCIAL_TOKEN_KEY);

// One derived key per purpose, so a state signature can never decrypt a token.
function keyFor(purpose: "token" | "state"): Buffer {
    if (!env.SOCIAL_TOKEN_KEY) throw new Error("SOCIAL_TOKEN_KEY is not set");
    const secret = Buffer.from(env.SOCIAL_TOKEN_KEY, "hex");
    const key = hkdfSync("sha256", secret, "", `cadence:${purpose}`, KEY_BYTES);
    return Buffer.from(key);
}

const encode = (bytes: Buffer) => bytes.toString("base64url");
const decode = (text: string) => Buffer.from(text, "base64url");

/** `v1.<iv>.<tag>.<ciphertext>` */
export function encryptSecret(plain: string): string {
    const iv = randomBytes(IV_BYTES);
    const key = keyFor("token");
    const cipher = createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();
    return [FORMAT_VERSION, encode(iv), encode(tag), encode(encrypted)].join(".");
}

export function decryptSecret(stored: string): string {
    const [version, iv, tag, data] = stored.split(".");
    if (version !== FORMAT_VERSION || !iv || !tag || !data) throw new Error("Unrecognised encrypted value");

    const key = keyFor("token");
    const ivBytes = decode(iv);
    const decipher = createDecipheriv(ALGORITHM, key, ivBytes);
    const tagBytes = decode(tag);
    decipher.setAuthTag(tagBytes);
    const dataBytes = decode(data);
    return Buffer.concat([decipher.update(dataBytes), decipher.final()]).toString("utf8");
}

export function signPayload(payload: string): string {
    const key = keyFor("state");
    const digest = createHmac("sha256", key).update(payload).digest();
    return encode(digest);
}

export function signatureMatches(payload: string, signature: string): boolean {
    const expectedSignature = signPayload(payload);
    const expected = Buffer.from(expectedSignature);
    const given = Buffer.from(signature);
    return expected.length === given.length && timingSafeEqual(expected, given);
}
