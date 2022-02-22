import '@hotwired/turbo'
import {applyListeners} from './theme'

let listeners

document.addEventListener('turbo:load', () => {
  listeners = applyListeners()
})

document.addEventListener('turbo:before-render', () => {
  try {
    listeners()
  } catch (e) {}
})
