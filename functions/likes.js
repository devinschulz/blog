const functions = require('firebase-functions')
const admin = require('firebase-admin')
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')

const app = express()
app.use(helmet())
app.use(cors())

admin.initializeApp(functions.config().firebase)

const db = admin.firestore()
const likes = db.collection('likes')

const get = (req, res) =>
  likes
    .doc(req.params.id)
    .get()
    .then(doc => {
      if (!doc.exists) {
        res.status(200).json({ count: 0 })
      } else {
        res.status(200).send(doc.data())
      }
    })

const put = (req, res) =>
  db
    .runTransaction(t =>
      t.get(likes.doc(req.params.id)).then(doc => {
        const count = doc.exists ? doc.data().count + 1 : 1
        const method = doc.exists ? 'update' : 'set'
        t[method](likes.doc(req.params.id), { count })
        return Promise.resolve(count)
      }),
    )
    .then(count => res.status(200).json({ count }))
    .catch(error =>
      res
        .status(500)
        .json({ status: 500, message: 'Failed to update count', error }),
    )

const all = (req, res) =>
  likes
    .get()
    .then(snapshots => {
      const response = {}
      snapshots.forEach(doc => {
        response[doc.id] = doc.data()
      })
      res.status(200).json(response)
    })
    .catch(error =>
      res
        .status(500)
        .json({ status: 500, message: 'Failed to fetch all likes' }),
    )

app.get('/:id', get)
app.put('/:id', put)
app.get('/', all)

exports.likes = functions.https.onRequest(app)
