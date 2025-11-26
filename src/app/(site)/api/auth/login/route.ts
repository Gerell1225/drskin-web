import { NextResponse } from "next/server";

const ADMIN_PHONES = ["77030808"];

export async function POST(req: Request) {
  try {
    const { phone, password } = await req.json();
    if (!phone || !password) {
      return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
    }

    const role = ADMIN_PHONES.includes(String(phone)) ? "admin" : "user";

    const res = NextResponse.json({
      ok: true,
      role,
      redirect: role === "admin" ? "/admin" : "/",
    });

    const cookieOpts = { httpOnly: true, sameSite: "lax" as const, path: "/", maxAge: 60 * 60 * 24 * 7 };
    res.cookies.set("drskin_role", role, cookieOpts);
    res.cookies.set("drskin_phone", String(phone), cookieOpts);
    return res;
  } catch (e) {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
}
