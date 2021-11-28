import * as admin from 'firebase-admin'

const initializeApp = () => {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: (process.env.FIREBASE_PRIVATE_KEY as string).replace(
        /\\n/g,
        '\n'
      ),
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  })
}

admin.apps.length ? admin.app() : initializeApp()

export default admin
