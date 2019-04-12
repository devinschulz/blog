import debounce from 'debounce'
;(() => {
  const element = document.querySelector('.js-scroll-top')
  if (!element) {
    return
  }

  const onScroll = debounce(() => {
    const doc = document.documentElement
    const top = Math.max(
      (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0),
      0
    )
    element.classList[top ? 'add' : 'remove']('visible')
  }, 100)

  window.addEventListener('scroll', onScroll, false)
})()
