export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import admin from "@/lib/firebaseAdmin";

export async function DELETE(request) {
  try {
    const { uid } = await request.json();

    if (!uid) {
      return NextResponse.json({ error: "UID is required" }, { status: 400 });
    }

    // Delete from Firebase Auth
    await admin.auth().deleteUser(uid);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
