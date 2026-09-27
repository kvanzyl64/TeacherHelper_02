import { error as logError } from "node:console";
import process, { stdin, stdout } from "node:process";
import { Pool } from "pg";

const roleName = "teacher_helper_test_role";

function readHidden(prompt) {
  return new Promise((resolve, reject) => {
    stdout.write(prompt);
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
    throw new Error("Run this command in an interactive terminal so passwords stay hidden.");
  }

  const adminPassword = await readHidden("Local PostgreSQL admin password (postgres): ");
  if (!adminPassword) throw new Error("The PostgreSQL admin password is required.");

  const password = await readHidden("New teacher_helper_test_role password (min 12 characters): ");
  const confirmation = await readHidden("Confirm new test role password: ");
  if (password.length < 12 || password.length > 1024) {
    throw new Error("Password must be between 12 and 1024 characters.");
  }
  if (password !== confirmation) throw new Error("Passwords do not match.");

  const pool = new Pool({
    host: "127.0.0.1",
    port: 5432,
    database: "teacher_helper_test",
    user: "postgres",
    password: adminPassword,
  });

  try {
    const { rows: databaseRows } = await pool.query("SELECT current_database() AS name");
    if (databaseRows[0]?.name !== "teacher_helper_test") {
      throw new Error("Refusing to connect to a database other than teacher_helper_test.");
    }

    const { rows: roleRows } = await pool.query(
      "SELECT rolcanlogin, rolsuper, rolbypassrls FROM pg_roles WHERE rolname = $1",
      [roleName],
    );
    const role = roleRows[0];
    if (!role?.rolcanlogin || role.rolsuper || role.rolbypassrls) {
      throw new Error(
        "The test role is missing or does not have the expected restricted privileges.",
      );
    }

    const { rows } = await pool.query(
      "SELECT format('ALTER ROLE %I WITH PASSWORD %L', $1::text, $2::text) AS statement",
      [roleName, password],
    );
    await pool.query(rows[0].statement);
    stdout.write("Password reset for teacher_helper_test_role on local teacher_helper_test.\n");
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  logError(error instanceof Error ? error.message : "Test role password reset failed.");
  process.exitCode = 1;
});
