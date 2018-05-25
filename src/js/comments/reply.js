import IntlRelativeFormat from 'intl-relativeformat'
import validate from 'validate'

import { handleSubmit } from './submit'
import '../polyfills/after'

const COMMENT_FORM_CLASS = '.js-comment-form'
const IS_DISABLED_CLASS = 'is-disabled'

const rf = new IntlRelativeFormat('en')

export const formatReplyDates = () => {
  const dates = document.querySelectorAll('.js-comment-date')
  for (let date of dates) {
    date.innerText = rf.format(new Date(date.getAttribute('datetime')))
  }
}

export const bindReplyToEventListeners = () => {
  replyIterator(reply => {
    reply.addEventListener('click', handleReplyClick, false)
  })
}

export const unbindReplyToEventListeners = () => {
  replyIterator(reply => {
    reply.removeEventListener('click', handleReplyClick)
  })
}

const getCommentingReplies = () => {
  return document.querySelectorAll('.js-reply')
}

const handleReplyClick = event => {
  const { target } = event
  event.preventDefault()

  // Prevent clicking the links twice and re-rendering the form multiple times.
  if (target.classList.contains(IS_DISABLED_CLASS)) {
    return
  }

  removeIsDisabled()

  const form = document.querySelector('.js-comment-form')

  // Whenever the user started replying to a comment and now clicked reply to
  // someone else, clean up the form.
  handleReplyCleanup(form)

  form.querySelector('.js-parent').value = target.dataset.parent

  const formElement = form.querySelector('.js-form')
  formElement.classList.add('c-form--reply')
  formElement.onsubmit = handleSubmit

  removeFormErrors(formElement)
  addCancelButton(form)

  const heading = form.querySelector('.js-comment-heading')
  heading.innerText = `Replying to ${target.dataset.name}`

  target.after(form)
  target.classList.add(IS_DISABLED_CLASS)
  target.setAttribute('disabled', 'disabled')
  target.setAttribute('aria-disabled', true)

  form.querySelector('.js-input').focus()
}

const removeReplyform = form => {
  const replyForm = replyHasForm(form)
  if (replyForm) {
    replyForm.parentNode.removeChild(replyForm)
  }
}

const replyHasForm = target => {
  return document.querySelector(`.c-comments ${COMMENT_FORM_CLASS}`)
}

const addCancelButton = form => {
  const button = document.createElement('button')
  button.innerText = 'Cancel'
  button.className = 'js-comment-cancel c-form__cancel c-btn c-btn__link'
  button.onclick = event => handleCancel(event, form)
  const submitButton = form.querySelector('button[type="submit"]')
  form.querySelector('.c-form__btn-group').insertBefore(button, submitButton)
}

const handleCancel = (event, form) => {
  event.preventDefault()
  handleCleanup(form)
}

const handleCleanup = form => {
  removeIsDisabled()
  removeFormErrors(form.querySelector('.js-form'))
  handleReplyCleanup(form)
  document.querySelector('.c-form__wrapper').appendChild(form)
}

const handleReplyCleanup = form => {
  form.querySelector('.js-parent').value = ''

  const heading = form.querySelector('.js-comment-heading')
  heading.innerText = heading.dataset.default

  removeElement(form.querySelector('.js-comment-cancel'))
}

const removeElement = element => {
  if (element) {
    element.parentNode.removeChild(element)
  }
}

const isPrestine = form => {
  const elements = form.querySelectorAll('.js-input')
  for (let element of elements) {
    if (element.value !== '') {
      return false
    }
  }
  return true
}

const removeIsDisabled = () => {
  replyIterator(reply => {
    reply.classList.remove(IS_DISABLED_CLASS)
    reply.removeAttribute('disabled')
    reply.setAttribute('aria-disabled', false)
  })
}

const replyIterator = fn => {
  const replies = getCommentingReplies()
  for (let reply of replies) {
    fn && fn(reply)
  }
}

const removeFormErrors = form => {
  for (let field of form.elements) {
    validate.removeError(field)
  }
}
