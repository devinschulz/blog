import axios from 'axios'
import { trackEvent } from './googleAnalytics'

const instance = axios.create({
  baseURL: 'https://us-central1-devin-schulz.cloudfunctions.net/likes',
})

const qs = selector => document.querySelector(selector)

const getAll = () => instance.get('/')

const getById = id => instance.get(`/${id}`)

const putById = id => instance.put(`/${id}`)

const getLikeButton = () => qs('.js-like')

const getLikeText = () => qs('.js-like-text')

const getArticle = () => qs('.js-article')

export const maybeLikes = async () => {
  const article = document.querySelector('.js-article')
  if (article) {
    bindEventListeners()
    const { id } = article.dataset
    const {
      data: { count },
    } = await getById(id)
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
  await putById(id)
}

const bindEventListeners = () => {
  getLikeButton().addEventListener('click', increment, false)
}

export const unbindEventListeners = () => {
  getLikeButton().removeEventListener('click', increment, false)
}

const setLikeCount = count => {
  getLikeText().innerText = count
}

const saveLike = id => {
  const likes = { ...loadFromStorage(), [id]: true }
  saveToStorage(likes)
  getLikeButton().classList.add('liked')
}

const saveToStorage = likes =>
  localStorage.setItem('likes', JSON.stringify(likes))

const loadFromStorage = () => JSON.parse(localStorage.getItem('likes')) || {}
