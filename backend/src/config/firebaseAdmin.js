import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT?.trim();
const configuredProjectId = process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;

let serviceAccount = null;

if (serviceAccountRaw) {
  try {
    serviceAccount = JSON.parse(serviceAccountRaw);
  } catch (error) {
    console.warn("FIREBASE_SERVICE_ACCOUNT no es un JSON válido. Se intentará usar credenciales por defecto.");
  }
}

const projectId = serviceAccount?.project_id || configuredProjectId;
let firebaseAdminConfigured = false;

if (!admin.apps.length) {
  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId,
    });
    firebaseAdminConfigured = true;
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS || projectId) {
    admin.initializeApp({
      projectId,
      credential: admin.credential.applicationDefault(),
    });
    firebaseAdminConfigured = true;
  } else {
    console.warn("Firebase Admin no está configurado: falta FIREBASE_SERVICE_ACCOUNT o GOOGLE_APPLICATION_CREDENTIALS/FIREBASE_PROJECT_ID.");
  }
} else {
  firebaseAdminConfigured = true;
}

export const firebaseAdmin = admin;
export const firebaseAuth = firebaseAdminConfigured ? admin.auth() : null;
export const isFirebaseAdminConfigured = firebaseAdminConfigured;
