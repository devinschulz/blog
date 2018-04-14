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
