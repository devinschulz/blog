const themeStorageKey = 'theme'

const getTheme = () => {
  return localStorage.getItem(themeStorageKey) || 'dark'
}

const setLightMode = () => {
  try {
    localStorage.setItem(themeStorageKey, 'light')
    document.documentElement.classList.add('light')
    document.documentElement.classList.remove('dark')
  } catch (err) {
    console.error(err)
  }
}

const setDarkMode = () => {
  try {
    localStorage.setItem(themeStorageKey, 'dark')
    document.documentElement.classList.remove('light')
    document.documentElement.classList.add('dark')
  } catch (err) {
    console.error(err)
  }
}

const toggleTheme = () => {
  const theme = getTheme()
  if (theme === 'dark') {
    setLightMode()
  } else {
    setDarkMode()
  }
}

;(() => {
  const toggle = document.querySelector('.js-theme-toggle')
  if (toggle) toggle.addEventListener('click', toggleTheme, false)
})()
