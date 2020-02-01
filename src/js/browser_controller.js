import { Controller } from 'stimulus'
import 'tocca'

const ENABLE = 'enable'
const DISABLE = 'disable'

export default class extends Controller {
  static targets = ['slide', 'next', 'previous', 'viewport', 'index']

  initialize() {
    const fn = element => this.element.contains(element)
    this.slides = this.slideTargets.filter(fn)
    this.nextButton = this.nextTargets.filter(fn)
    this.previousButton = this.previousTargets.filter(fn)
    this.viewport = this.viewportTargets.filter(fn)
    this.clientIndex = this.indexTargets.filter(fn)[0] || {}
    this.showSlide(0)
    this.enableOrDisable()
  }

  next() {
    if (this.hasNext()) {
      this.showSlide(this.index + 1)
    }
    this.enableOrDisable()
  }

  previous() {
    if (this.hasPrevious()) {
      this.showSlide(this.index - 1)
    }
    this.enableOrDisable()
  }

  enableOrDisable() {
    this.enableOrDisableNext()
    this.enableOrDisablePrevious()
  }

  hasPrevious() {
    return this.slides[this.index - 1]
  }

  hasNext() {
    return this.slides[this.index + 1]
  }

  enableOrDisablePrevious() {
    const method = this.hasPrevious() ? ENABLE : DISABLE
    this.previousButton.forEach(this[method])
  }

  enableOrDisableNext() {
    const method = this.hasNext() ? ENABLE : DISABLE
    this.nextButton.forEach(this[method])
  }

  enable(target) {
    target.removeAttribute('disabled')
  }

  disable(target) {
    target.setAttribute('disabled', 'disabled')
  }

  showSlide(index) {
    this.index = index
    this.slides.forEach((el, i) => {
      el.classList.toggle('hidden', index !== i)
      el.classList.toggle('block', index === i)
    })
    this.scrollTop()
    this.data.set('index', this.index)
    this.clientIndex.innerText = `${this.index + 1}`.padStart(2, '0')
  }

  scrollTop() {
    this.viewport.forEach(viewport => (viewport.scrollTop = 0))
  }
}
