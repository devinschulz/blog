import { Controller } from 'stimulus'

export default class extends Controller {
  animate(event) {
    event.target.classList.add('o-wobble')
  }

  cleanup() {
    event.target.classList.remove('o-wobble')
  }
}
