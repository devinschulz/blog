import { Controller } from 'stimulus'

export default class extends Controller {
  initialize() {
    this.dark = JSON.parse(localStorage.getItem('theme'))
    if (this.dark === null) {
      this.dark = window.matchMedia('(prefers-color-scheme: dark)').matches
    }

    document.addEventListener(
      'turbolinks:before-render',
      this.handleBeforeRender.bind(this)
    )

    this.setMode(this.dark, document.body)
  }

  toggle() {
    this.dark = !this.dark
    localStorage.setItem('theme', JSON.stringify(this.dark))
    this.setMode(this.dark, document.body)
  }

  handleBeforeRender(event) {
    this.setMode(this.dark, event.data.newBody)
  }

  setMode(isDark, body) {
    document.documentElement.classList.toggle('mode-dark', isDark)
    body
      .querySelector('.toggle')
      .setAttribute('aria-pressed', isDark.toString())
  }
}
