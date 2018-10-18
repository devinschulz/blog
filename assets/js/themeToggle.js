import { trackEvent } from './googleAnalytics'

const getToggle = () => document.querySelector('.js-themer')

const setDarkMode = isDark => {
  const invertor = document.querySelector('.js-inverter')
  // Triggers repaint in most browsers:
  invertor.setAttribute('media', isDark ? 'screen' : 'none')
  // Forces repaint in Chrome:
  invertor.textContent = invertor.textContent.trim()
}

export const init = () => {
  const isDark = loadFromStorage()
  if (isDark === 'true') {
    setDarkMode(true)
    getToggle().checked = true
  }
}

export const handleChange = () => {
  const checkbox = getToggle()
  const isDark = checkbox.checked
  saveToStorage(isDark)
  setDarkMode(isDark)
  trackEvent('theme', {
    event_category: 'engagement',
    value: isDark ? 'dark' : 'light',
  })
}

export const bindEventListeners = () => {
  const toggle = getToggle()
  if (toggle) toggle.addEventListener('change', handleChange, false)
}

export const unbindEventListeners = () => {
  const toggle = getToggle()
  if (toggle) toggle.removeEventListener('change', handleChange)
}

const saveToStorage = isDark => localStorage.setItem('isDark', isDark)
const loadFromStorage = () => localStorage.getItem('isDark')
