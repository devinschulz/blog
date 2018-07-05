export default () => {}

const getToggle = () => document.querySelector('.js-day-night')

export const init = () => {
  const isDark = loadFromStorage()
  if (isDark === 'true') {
    document.body.classList.add('theme-dark')
  }
}

export const bindEventListeners = () => {
  const toggle = getToggle()
  if (toggle) {
    toggle.addEventListener('click', handleToggleEvent, false)
  }
}

export const unbindEventListeners = () => {
  const toggle = getToggle()
  if (toggle) {
    toggle.removeEventListener('click', handleToggleEvent, false)
  }
}

const handleToggleEvent = () => {
  const isDark = document.body.classList.contains('theme-dark')
  saveToStorage(!isDark)

  document.body.classList.toggle('theme-dark')

  const toggle = getToggle()
  toggle.classList.toggle('is-active')
  toggle.setAttribute('aria-checked', !isDark)
}

const saveToStorage = isDark => localStorage.setItem('isDark', isDark)
const loadFromStorage = () => localStorage.getItem('isDark')
