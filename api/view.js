import db from '../lib/db'

export default async (req, res) => {
  if (!req.query.page) {
    res.status(400).send('Missing field `page`')
    return
  }

  try {
    const views = db.collection('views').doc(req.query.page)
    await db.runTransaction(async (t) => {
      const doc = await t.get(views)

      if (!doc.exists) {
        await t.set(views, {count: 1})
        return
      }

      const count = (doc.data().count || 0) + 1
      await t.update(views, {count})
    })
    res.status(200).send('ok')
  } catch (e) {
    console.log('transaction error', e)
    res.status(500)
  }
}
