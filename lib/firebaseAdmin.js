import admin from "firebase-admin";

export function getFirebaseAdmin() {
  // If firebase is already initialized, just return it immediately
  if (admin.apps.length > 0) {
    return admin;
  }

  // Double-check if the key exists before running to prevent crash during builds
  if (!process.env.FIREBASE_PRIVATE_KEY) {
    console.warn(
      "Firebase credentials missing (expected during build). Returning mock client.",
    );
    return admin;
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
    });
  } catch (error) {
    console.error("Firebase admin initialization failed:", error);
  }

  return admin;
}

// import admin from "firebase-admin";

// if (!admin.apps.length) {
//   admin.initializeApp({
//     credential: admin.credential.cert({
//       projectId: process.env.FIREBASE_PROJECT_ID,
//       clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
//       privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
//     }),
//   });
// }

// export default admin;
