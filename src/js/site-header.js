;(() => {
  const header = document.querySelector('.js-site-header-logo')
  const className = 'o-wobble'

  const handleEvent = event => {
    if (!header.classList.contains(className)) {
      header.classList.add(className)
    }
  }

  const cleanup = () => {
    header.classList.remove(className)
  }

  if (header) {
    header.addEventListener('mouseenter', handleEvent, false)
    header.addEventListener('focus', handleEvent, false)
    header.addEventListener('animationend', cleanup, false)
  }
})()
