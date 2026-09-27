import { NextResponse } from "next/server";
import { getDatabasePool } from "../../../lib/database";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ status: "unavailable", database: "not_configured" }, { status: 503 });
  }

  try {
    await getDatabasePool().query("SELECT 1");
    return NextResponse.json({ status: "ok", database: "ok" });
  } catch {
    return NextResponse.json({ status: "unavailable", database: "unreachable" }, { status: 503 });
  }
}