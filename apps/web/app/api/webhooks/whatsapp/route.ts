export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}));

  return Response.json({
    ok: true,
    status: payload?.event ?? "accepted",
  });
}
