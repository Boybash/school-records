import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const { studentId } = await request.json();

    if (!studentId) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 },
      );
    }

    // Set a secure httpOnly cookie
    const cookieStore = await cookies();
    cookieStore.set("parent_session", studentId, {
      httpOnly: true, // can't be accessed by JS
      secure: true, // only sent over HTTPS
      sameSite: "strict", // prevents CSRF
      maxAge: 60 * 60, // expires in 1 hour
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("parent_session");

    if (!session) {
      return NextResponse.json({ studentId: null }, { status: 401 });
    }

    return NextResponse.json({ studentId: session.value });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("parent_session");
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
