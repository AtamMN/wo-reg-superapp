import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/firebaseAdmin";

export async function POST(req) {
  try {
    const body = await req.text();
    console.log("RAW BODY:", body);

    const { uid, newEmail } = JSON.parse(body);

    if (!uid || !newEmail) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    await adminAuth.updateUser(uid, { email: newEmail });
    await adminDb.ref(`accounts/users/${uid}`).update({ email: newEmail });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("SERVER ERROR:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

