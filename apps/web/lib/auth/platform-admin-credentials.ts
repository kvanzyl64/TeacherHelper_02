import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";

const keyLength = 64;

function deriveKey(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(password, salt, keyLength, { N: 16_384, r: 8, p: 1 }, (error, key) => {
      if (error) reject(error);
      else resolve(key as Buffer);
    });
  });
}

export async function hashPlatformAdminPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const key = await deriveKey(password, salt);
  return `scrypt$${salt}$${key.toString("hex")}`;
}

export async function verifyPlatformAdminPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  const [algorithm, salt, expectedHex, ...extra] = passwordHash.split("$");
  if (
    algorithm !== "scrypt" ||
    !salt ||
    !expectedHex ||
    extra.length > 0 ||
    !/^[a-f0-9]{32}$/.test(salt) ||
    !/^[a-f0-9]{128}$/.test(expectedHex)
  ) {
    return false;
  }

  const expected = Buffer.from(expectedHex, "hex");
  const actual = await deriveKey(password, salt);
  return timingSafeEqual(actual, expected);
}
