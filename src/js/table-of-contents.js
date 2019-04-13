;(() => {
  const clickHandler = () => {
    try {
      ga('send', 'event', 'Table of Contents', 'click')
    } catch (error) {}
  }

  Array.from(document.querySelectorAll('#TableOfContents a')).forEach(link => {
    link.addEventListener('click', clickHandler, false)
  })
})()
