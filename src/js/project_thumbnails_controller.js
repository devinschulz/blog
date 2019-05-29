import { Controller } from 'stimulus'

export default class extends Controller {
  onClick(event) {
    try {
      ga('send', 'event', 'Project Thumbnails', 'click')
    } catch (error) {}
  }
}
