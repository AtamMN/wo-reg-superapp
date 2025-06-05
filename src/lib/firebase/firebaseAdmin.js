import admin from "firebase-admin";

const serviceAccount =  JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL:
      "https://wo-reg-superapp-default-rtdb.asia-southeast1.firebasedatabase.app",
  });
}

export const adminDb = admin.database();
export const adminAuth = admin.auth();
