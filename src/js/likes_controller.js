import { Controller } from 'stimulus'
import { getLikes } from './api'

export default class extends Controller {
  static targets = ['like']

  connect() {
    this.load()
  }

  async load() {
    const response = await getLikes()
    this.likeTargets.forEach(element => {
      if (response[element.id]) {
        element.innerText = response[element.id].count
      }
    })
  }
}
