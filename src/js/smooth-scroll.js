;(() => {
  const smoothScroll = event => {
    const link = event.target.closest('a')
    if (!link) {
      return
    }
    const id = link.getAttribute('href').substring(1)
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
      })
      event.preventDefault()
    }
  }

  Array.from(document.querySelectorAll('a'))
    .filter(element => element.getAttribute('href').startsWith('#'))
    .forEach(link => {
      link.addEventListener('click', smoothScroll, false)
    })
})()
