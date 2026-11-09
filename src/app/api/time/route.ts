// Same-origin Vercel time only; no extra service, account access, or database write.
export const dynamic = "force-dynamic";
export function GET() {
  return Response.json(
    { serverTime: Date.now() },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
