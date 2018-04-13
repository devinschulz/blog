// based on https://github.com/gohugoio/hugo/blame/master/docs/themes/gohugoioTheme/src/js/anchorforid.js
const createAnchorForID = id => {
  const anchor = document.createElement('a')
  anchor.className = 'c-article__link'
  anchor.href = `#${id}`
  anchor.innerHTML =
    '<svg class="c-icon c-icon--link"><use xlink:href="#shape-link"></use></svg>'
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
