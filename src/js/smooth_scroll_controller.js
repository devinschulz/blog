import { Controller } from 'stimulus'

export default class extends Controller {
  connect () {
    this.bindSmoothScroll()
  }

  smoothScroll (event) {
    const link = event.target.closest('a')
    if (!link) {
      return
    }
    const id = link.getAttribute('href').substring(1)
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth'
      })
      event.preventDefault()
    }
  }

  bindSmoothScroll () {
    Array.from(document.querySelectorAll('a'))
      .filter(element => element.getAttribute('href').startsWith('#'))
      .forEach(link => {
        link.addEventListener('click', this.smoothScroll, false)
      })
  }
}
