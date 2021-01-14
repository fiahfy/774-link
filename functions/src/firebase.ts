import admin from 'firebase-admin'

const options: admin.AppOptions = {}
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
if (serviceAccount) {
  options.credential = admin.credential.cert(JSON.parse(serviceAccount))
}
admin.initializeApp(options)

export default admin
