  /**
   * Navigation
   */
((window, document) => {
  const body = document.body
  const nav = document.querySelector('.js-main-nav')
  const navToggle = nav.querySelector('.js-main-nav__toggle')

  const navActiveClass = 'c-main-nav--active'
  const noScrollClass = 'u-no-scroll'

  const setNavAriaPressed = state =>
    navToggle.setAttribute('aria-pressed', state)

  const addClassToElement = (element, className) =>
    element.classList.add(className)

  const removeClassFromElement = (element, className) =>
    element.classList.remove(className)

  const isNavigationActive = () =>
    nav.classList.contains(navActiveClass)

  const setToggleOpen = () => {
    setNavAriaPressed(true)
    addClassToElement(nav, navActiveClass)
    addClassToElement(body, noScrollClass)
  }

  const setToggleClosed = () => {
    setNavAriaPressed(false)
    removeClassFromElement(nav, navActiveClass)
    removeClassFromElement(body, noScrollClass)
  }

  const toggleNavigation = () =>
    isNavigationActive()
      ? setToggleClosed()
      : setToggleOpen()

  const handleKeyPress = event => {
    // ENTER or SPACE is pressed
    if (event.keyCode === 32 || event.keyCode === 13) {
      event.preventDefault()
      toggleNavigation()
    }
  }

  const hasResizedFromMobileToTablet = () =>
    isNavigationActive() && window.innerWidth > 739

  const handleResize = () =>
    hasResizedFromMobileToTablet() && setToggleClosed()

  navToggle.addEventListener('click', toggleNavigation, false)
  navToggle.addEventListener('onkeypress', handleKeyPress, false)

  window.addEventListener('resize', handleResize, false)
})(window, document)
