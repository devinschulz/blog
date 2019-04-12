import 'whatwg-fetch'

const BASE_URL = 'https://us-central1-devin-schulz.cloudfunctions.net'

const toJSON = response => response.json()

const expandPath = (id = '') => `${BASE_URL}/likes/${id}`

export const getLikes = () => window.fetch(expandPath()).then(toJSON)

export const getLike = id => window.fetch(expandPath(id)).then(toJSON)

export const putLike = id =>
  window.fetch(expandPath(id), {
    method: 'PUT',
  })
