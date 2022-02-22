const themeStorageKey = 'theme'

const getTheme = () => {
  return localStorage.getItem(themeStorageKey) || 'dark'
}

const setLightMode = () => {
  try {
    localStorage.setItem(themeStorageKey, 'light')
    document.documentElement.classList.add('light')
    document.documentElement.classList.remove('dark')
    document
      .querySelector('meta[name="theme-color"]')
      .setAttribute('content', '#fff')
  } catch (err) {
    console.error(err)
  }
}

const setDarkMode = () => {
  try {
    localStorage.setItem(themeStorageKey, 'dark')
    document.documentElement.classList.remove('light')
    document.documentElement.classList.add('dark')
    document
      .querySelector('meta[name="theme-color"]')
      .setAttribute('content', '#000')
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

export const applyListeners = () => {
  const toggle = document.querySelector('.js-theme-toggle')
  if (toggle) toggle.addEventListener('click', toggleTheme, false)
  return () => {
    toggle.removeEventListener('click', toggleTheme, false)
  }
}
