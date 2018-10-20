const functions = require('firebase-functions')
const admin = require('firebase-admin')
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')

const app = express()
app.use(helmet())
app.use(
  cors({
    origin: /^(.+\.)?devinschulz.com/,
  })
)

admin.initializeApp(functions.config().firebase)

function handleGET(req, res) {
  return admin
    .database()
    .ref(`/likes/${req.params.id}`)
    .once('value', snapshot => {
      const value = snapshot.val() || { count: 0 }
      res.status(200).json(value)
    })
}

function handlePUT(req, res) {
  return admin
    .database()
    .ref(`/likes/${req.params.id}`)
    .transaction(
      currentData =>
        currentData ? { count: currentData.count + 1 } : { count: 1 },
      (error, committed, snapshot) => {
        if (error) {
          return res.status(500).json({ error })
        }
        if (!committed) {
          return res.status(500).json({ error: 'Transaction aborted' })
        }
        res.status(200).json(snapshot.val())
      }
    )
}

function handleGETAll(req, res) {
  return admin
    .database()
    .ref('/likes')
    .once('value', snapshot => res.status(200).json(snapshot.val()))
}

app.get('/:id', handleGET)
app.put('/:id', handlePUT)
app.get('/', handleGETAll)

exports.likes = functions.https.onRequest(app)
