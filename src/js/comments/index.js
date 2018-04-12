import {
  formatReplyDates,
  bindReplyToEventListeners,
  unbindReplyToEventListeners,
} from './reply'
import { bindSubmitEventListeners, unbindSubmitEventListeners } from './submit'

export const init = () => {
  bindReplyToEventListeners()
  formatReplyDates()
  bindSubmitEventListeners()
}

export const maybeInit = () => {
  if (hasCommenting()) {
    init()
  }
}

export const maybeDeInit = () => {
  if (hasCommenting()) {
    unbindReplyToEventListeners()
    unbindSubmitEventListeners()
  }
}

const hasCommenting = () => {
  return !!document.querySelector('.c-form--comments')
}
