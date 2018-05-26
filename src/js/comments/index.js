import {
  formatReplyDates,
  bindReplyToEventListeners,
  unbindReplyToEventListeners,
} from './reply'
import { init as initSubmit, deinit as deinitSubmit } from './submit'

export const init = () => {
  initSubmit()
  bindReplyToEventListeners()
  formatReplyDates()
  initRecaptcha()
}

export const maybeInit = () => {
  if (hasCommenting()) {
    init()
  }
}

export const maybeDeInit = () => {
  if (hasCommenting()) {
    unbindReplyToEventListeners()
    deinitSubmit()
  }
}

const hasCommenting = () => {
  return !!document.querySelector('.c-form--comments')
}

export const initRecaptcha = () => {
  if (hasCommenting()) {
    const container = document.getElementById('g-recaptcha-container')
    container.innerHTML = ''
    const recaptcha = document.createElement('div')
    grecaptcha.ready(() => {
      grecaptcha.render(recaptcha, {
        sitekey: '6LcrGVsUAAAAAP2LKjw2P_y_FW1LVE86RZqcfjfg',
      })
      container.appendChild(recaptcha)
    })
  }
}
