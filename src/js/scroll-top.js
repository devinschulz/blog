import debounce from 'debounce'
;(() => {
  const doc = document.documentElement
  const elem = document.querySelector('.js-scroll-top')

  if (!elem) {
    return
  }

  const onScroll = debounce(() => {
    const top = Math.max(
      (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0),
      0
    )
    elem.classList[top ? 'add' : 'remove']('visible')
  }, 100)

  window.addEventListener('scroll', onScroll, false)
})()
