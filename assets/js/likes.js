import { trackEvent } from './googleAnalytics'
import 'whatwg-fetch'
import toJSON from './utils/toJson'

const baseUrl = 'https://us-central1-devin-schulz.cloudfunctions.net/likes'
const options = { mode: 'cors' }

const routes = {
  byId: id => `${baseUrl}/${id}`,
  getAll: () => `${baseUrl}/`,
}

const qs = selector => document.querySelector(selector)

const getAll = () => fetch(routes.getAll(), options).then(toJSON)

const getById = id => fetch(routes.byId(id), options).then(toJSON)

const putById = id => fetch(routes.byId(id), { ...options, method: 'PUT' })

const getLikeButton = () => qs('.js-like')

const getLikeText = () => qs('.js-like-text')

const getArticle = () => qs('.js-article')

const handleError = error => {
  console.error(error)
}

export const maybeLikes = async () => {
  const article = document.querySelector('.js-article')
  if (article) {
    bindEventListeners()
    const { id } = article.dataset
    const { count } = await getById(id).catch(handleError)
    setLikeCount(count)

    const likes = loadFromStorage()
    if (likes[id]) {
      getLikeButton().classList.add('liked')
    }
  }
}

const increment = async e => {
  const newCount = parseInt(getLikeText().innerText)
  const { id } = getLikeButton().dataset

  setLikeCount(newCount + 1)
  saveLike(id)
  trackEvent('like_post', {
    event_category: 'engagement',
  })
  await putById(id).catch(handleError)
}

const bindEventListeners = () => {
  getLikeButton().addEventListener('click', increment, false)
}

export const unbindEventListeners = () => {
  getLikeButton().removeEventListener('click', increment, false)
}

const setLikeCount = count => {
  const element = getLikeText()
  if (element) element.innerText = count
}

const saveLike = id => {
  const likes = { ...loadFromStorage(), [id]: true }
  saveToStorage(likes)
  getLikeButton().classList.add('liked')
}

const saveToStorage = likes =>
  localStorage.setItem('likes', JSON.stringify(likes))

const loadFromStorage = () => JSON.parse(localStorage.getItem('likes')) || {}
