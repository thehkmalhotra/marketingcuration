import "server-only";

import crypto from "crypto";

const algorithm = "aes-256-gcm";

const key = Buffer.from(
    process.env.INSTAGRAM_ENCRYPTION_KEY,
    "hex"
);

export function encrypt(text) {

    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(
        algorithm,
        key,
        iv
    );

    const encrypted = Buffer.concat([
        cipher.update(text, "utf8"),
        cipher.final()
    ]);

    const authTag = cipher.getAuthTag();

    return [
        iv.toString("hex"),
        authTag.toString("hex"),
        encrypted.toString("hex")
    ].join(":");
}

export function decrypt(text) {

    const [ivHex, authTagHex, encryptedHex] = text.split(":");

    const decipher = crypto.createDecipheriv(
        algorithm,
        key,
        Buffer.from(ivHex, "hex")
    );

    decipher.setAuthTag(
        Buffer.from(authTagHex, "hex")
    );

    const decrypted = Buffer.concat([
        decipher.update(Buffer.from(encryptedHex, "hex")),
        decipher.final()
    ]);

    return decrypted.toString("utf8");
}