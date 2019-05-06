import { Controller } from 'stimulus'
import { getLike, putLike } from './api'

const KEY = 'likes'

const getStorage = () => JSON.parse(localStorage.getItem(KEY)) || {}

const setLikes = id => {
  const likes = getStorage()
  likes[id] = (likes[id] || 0) + 1
  localStorage.setItem(KEY, JSON.stringify(likes))
}

const getLikes = id => {
  const storage = getStorage()
  return storage[id] || 0
}

export default class extends Controller {
  static targets = ['max', 'count', 'button']

  constructor(props) {
    super(props)
    this.count = 0
    this.MAX_LIKES = 50
  }

  async connect() {
    await this.getLikes()
    this.setLikes()
    this.update()
  }

  putLike() {
    putLike(this.data.get('id'))
  }

  setLikes() {
    this.data.set('count', this.count)
    this.countTarget.innerText = this.text()
    setLikes(this.data.get('id'))
  }

  text() {
    return `${this.count} like${this.count === 1 ? '' : ''}`
  }

  async getLikes() {
    const { count = 0 } = await getLike(this.data.get('id'))
    this.count = count
  }

  canUpdate() {
    const count = getLikes(this.data.get('id'))
    return count < this.MAX_LIKES
  }

  update() {
    const likes = getLikes(this.data.get('id'))
    if (likes >= this.MAX_LIKES) {
      this.buttonTarget.disabled = true
      this.maxTarget.classList.remove('hidden')
    }
    if (likes) {
      this.buttonTarget.classList.add('liked')
    }
  }

  onClick() {
    if (this.canUpdate()) {
      this.count++
      this.putLike()
      this.setLikes()
      this.update()
      this.track()
    }
  }

  track() {
    try {
      ga('send', 'event', {
        eventCategory: 'Likes',
        eventAction: 'increment',
        eventValue: count,
      })
    } catch (error) {}
  }
}
