// based on https://github.com/gohugoio/hugo/blame/master/docs/themes/gohugoioTheme/src/js/anchorforid.js
const createAnchorForID = id => {
  const anchor = document.createElement('a')
  anchor.className = 'c-article__link'
  anchor.href = `#${id}`
  anchor.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="c-article__icon"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>'
  return anchor
}

const createLinksWithinContainer = (container, level) => {
  const headers = container.getElementsByTagName(`h${level}`)
  for (let header of headers) {
    if (header.id) {
      header.appendChild(createAnchorForID(header.id))
    }
  }
}

const article = document.querySelector('.c-article__content')
if (article) {
  // h2-h6
  for (let i = 2; i <= 6; i++) {
    createLinksWithinContainer(article, i)
  }
}
