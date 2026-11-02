import crypto from "node:crypto";

export function decryptWithdrawalPassword(value: string) {
  const secret = process.env.WITHDRAW_PASSWORD_ENCRYPTION_KEY;
  if (!secret) throw new Error("Withdrawal password encryption is not configured.");
  const [ivText, encryptedText] = value.split(".");
  if (!ivText || !encryptedText) throw new Error("Invalid encrypted withdrawal password.");
  const key = Buffer.from(secret, "base64");
  const iv = Buffer.from(ivText, "base64");
  const encrypted = Buffer.from(encryptedText, "base64");
  const tag = encrypted.subarray(encrypted.length - 16);
  const ciphertext = encrypted.subarray(0, encrypted.length - 16);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}
