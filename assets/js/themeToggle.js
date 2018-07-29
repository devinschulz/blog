import { trackEvent } from './googleAnalytics'

export const init = () => {
  const isDark = loadFromStorage()
  if (isDark === 'true') {
    document.documentElement.classList.add('theme-dark')
  }
}

export const bindEventListeners = () => {
  const toggle = getToggle()
  if (toggle) toggle.addEventListener('click', handleToggleEvent, false)
}

export const unbindEventListeners = () => {
  const toggle = getToggle()
  if (toggle) toggle.removeEventListener('click', handleToggleEvent, false)
}

const getToggle = () => document.querySelector('.js-day-night')

const handleToggleEvent = () => {
  const isDark = document.documentElement.classList.contains('theme-dark')
  saveToStorage(!isDark)

  document.documentElement.classList.toggle('theme-dark')

  const toggle = getToggle()
  toggle.classList.toggle('is-active')
  toggle.setAttribute('aria-checked', !isDark)

  trackEvent('theme_switcher', {
    event_label: 'Day/night theme switcher',
    event_category: 'engagement',
    method: isDark ? 'dark_to_light' : 'light_to_dark',
  })
}

const saveToStorage = isDark => localStorage.setItem('isDark', isDark)
const loadFromStorage = () => localStorage.getItem('isDark')
