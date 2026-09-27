import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { error as logError } from "node:console";
import { promisify } from "node:util";
import { createInterface } from "node:readline/promises";
import process, { stdin, stdout } from "node:process";
import nextEnv from "@next/env";
import { Pool } from "pg";

const { loadEnvConfig } = nextEnv;

const scrypt = promisify(scryptCallback);
const input = createInterface({ input: stdin, output: stdout });
loadEnvConfig(process.cwd());

async function readHidden(prompt) {
  stdout.write(prompt);
  return new Promise((resolve, reject) => {
    let value = "";
    const finish = (error) => {
      stdin.off("data", onData);
      stdin.off("error", onError);
      stdin.setRawMode(false);
      if (error) reject(error);
      else resolve(value);
    };
    const onError = (error) => finish(error);
    const onData = (chunk) => {
      for (const character of chunk.toString("utf8")) {
        if (character === "\r" || character === "\n") {
          stdout.write("\n");
          finish();
          return;
        }
        if (character === "\u0003") {
          stdout.write("\n");
          finish(new Error("Cancelled"));
          return;
        }
        if (character === "\u0008" || character === "\u007f") {
          value = value.slice(0, -1);
        } else {
          value += character;
        }
      }
    };

    stdin.setRawMode(true);
    stdin.on("data", onData);
    stdin.on("error", onError);
    stdin.resume();
  });
}

async function main() {
  if (!stdin.isTTY || typeof stdin.setRawMode !== "function") {
    throw new Error("Run this command in an interactive terminal so the password stays hidden.");
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("Set DATABASE_URL to the local teacher_helper_dev database.");

  const email = (await input.question("Platform admin email: ")).trim().toLowerCase();
  const displayName = (await input.question("Display name: ")).trim();
  const roleInput = (
    await input.question("Role [platform_owner/support_readonly] (platform_owner): ")
  ).trim();
  const role = roleInput || "platform_owner";
  input.close();
  const password = await readHidden("Password (min 12 characters): ");
  const passwordConfirmation = await readHidden("Confirm password: ");

  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !displayName ||
    displayName.length > 200 ||
    !["platform_owner", "support_readonly"].includes(role)
  ) {
    throw new Error("Provide a valid email, display name, and supported platform-admin role.");
  }
  if (password.length < 12 || password.length > 1024) {
    throw new Error("Password must be between 12 and 1024 characters.");
  }
  if (password !== passwordConfirmation) throw new Error("Passwords do not match.");

  const salt = randomBytes(16).toString("hex");
  const key = await scrypt(password, salt, 64, { N: 16_384, r: 8, p: 1 });
  const passwordHash = `scrypt$${salt}$${key.toString("hex")}`;
  const pool = new Pool({ connectionString: databaseUrl });

  try {
    await pool.query(
      `INSERT INTO app.platform_admins (email, display_name, password_hash, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT ((lower(trim(email)))) DO UPDATE
         SET display_name = EXCLUDED.display_name,
             password_hash = EXCLUDED.password_hash,
             role = EXCLUDED.role,
             status = 'active',
             updated_at = now()`,
      [email, displayName, passwordHash, role],
    );
    stdout.write(`Platform admin provisioned: ${email} (${role}).\n`);
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  input.close();
  logError(error instanceof Error ? error.message : "Platform admin provisioning failed.");
  process.exitCode = 1;
});
