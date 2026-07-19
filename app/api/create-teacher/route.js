import { NextResponse } from "next/server";
import { getFirebaseAdmin } from "@/lib/firebaseAdmin";

export async function POST(request) {
  try {
    const {
      email,
      password,
      name,
      subjectId,
      subjectName,
      classes,
      department,
      isClassTeacher,
      classTeacherOf,
    } = await request.json();

    const admin = getFirebaseAdmin();

    // Create Firebase Auth account
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    const uid = userRecord.uid;

    // Save to Firestore using Admin SDK
    await admin
      .firestore()
      .collection("users")
      .doc(uid)
      .set({
        uid,
        name,
        email,
        role: "teacher",
        subjectId,
        subjectName,
        classes,
        department,
        isClassTeacher: isClassTeacher || false,
        classTeacherOf: classTeacherOf || "",
      });

    return NextResponse.json({ success: true, uid });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
