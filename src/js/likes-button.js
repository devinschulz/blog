import { getLike, putLike } from './api'

const MAX_LIKES = 50
const KEY = 'likes'

const getStorage = () => JSON.parse(localStorage.getItem(KEY)) || {}

const track = count => {
  try {
    ga('send', 'event', {
      eventCategory: 'Likes',
      eventAction: 'increment',
      eventValue: count,
    })
  } catch (error) {}
}

const setLikes = id => {
  const likes = getStorage()
  likes[id] = (likes[id] || 0) + 1
  localStorage.setItem(KEY, JSON.stringify(likes))
}

const getLikes = id => {
  const storage = getStorage()
  return storage[id] || 0
}

const update = (element, id) => {
  const text = element.querySelector('.js-likes-button-text')
  return count => {
    const likes = getLikes(id)
    if (likes === MAX_LIKES) {
      element.disabled = true
      document.querySelector('.js-likes-button-max').classList.remove('hidden')
    }
    if (likes) {
      element.classList.add('liked')
    }
    element.setAttribute('data-count', count)
    text.innerText = `${count} like${count !== 1 ? 's' : ''}`
  }
}

const canUpdate = id => {
  const count = getLikes(id)
  return count < MAX_LIKES
}

const onClick = (id, updater, counter) => () => {
  if (canUpdate(id)) {
    counter++
    putLike(id)
    setLikes(id)
    updater(counter)
    track(counter)
  }
}
;(async () => {
  const element = document.querySelector('.js-likes-button')
  if (!element) {
    return
  }

  const { count, id } = element.dataset
  const like = await getLike(id)
  const counter = like.count || count
  const updater = update(element, id)
  updater(counter)

  element.addEventListener('click', onClick(id, updater, counter), false)
})()
