import * as admin from 'firebase-admin'

const buff = Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'base64')
const text = buff.toString('utf-8')
const credentials = JSON.parse(text)

try {
  admin.initializeApp({
    credential: admin.credential.cert({
      client_email: credentials.client_email,
      private_key: credentials.private_key,
      project_id: credentials.project_id,
    }),
    databaseURL: 'https://devin-schulz.firebaseio.com',
  })
} catch (error) {
  /*
   * We skip the "already exists" message which is
   * not an actual error when we're hot-reloading.
   */
  if (!/already exists/u.test(error.message)) {
    // eslint-disable-next-line no-console
    console.error('Firebase admin initialization error', error.stack)
  }
}

module.exports = admin.firestore()
