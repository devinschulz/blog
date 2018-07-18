const svg =
  '<svg class="c-icon c-icon--link"><use xlink:href="#shape-link"></use></svg>'

// based on https://github.com/gohugoio/hugo/blame/master/docs/themes/gohugoioTheme/src/js/anchorforid.js
const createAnchorForID = id => {
  const anchor = document.createElement('a')
  anchor.className = 'c-article__link'
  anchor.href = `#${id}`
  anchor.innerHTML = svg
  return anchor
}

const createLinksWithinContainer = (container, level) => {
  Array.from(container.getElementsByTagName(`h${level}`)).forEach(header => {
    header.classList.add('c-article__heading')
    header.appendChild(createAnchorForID(header.id))
  })
}

export default function() {
  const article = document.querySelector('.c-article__content')
  if (article) {
    // h2-h6
    for (let i = 1; i <= 6; i++) {
      createLinksWithinContainer(article, i)
    }
  }
}
