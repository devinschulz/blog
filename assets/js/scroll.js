import { trackEvent } from './googleAnalytics'

const getSelector = () => document.querySelector('.js-top')

const handleClick = e => {
  e.preventDefault()
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth',
  })
  trackEvent('scroll_top')
}

export const initScroll = () => {
  const selector = getSelector()
  if (selector) {
    selector.addEventListener('click', handleClick, false)
  }
}

export const deinitScroll = () => {
  const selector = getSelector()
  if (selector) {
    selector.removeEventListener('click', handleClick)
  }
}
