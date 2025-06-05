import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/firebaseAdmin";

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, password, role } = body;

    // Buat akun tanpa auto-login
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: name,
    });

    const uid = userRecord.uid;

    await adminDb.ref(`accounts/users/${uid}`).set({
      name,
      email,
      role,
      createdAt: Date.now(),
    });

    return NextResponse.json({ success: true, uid });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
