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
  const headers = container.getElementsByTagName(`h${level}`)
  for (let header of headers) {
    if (header.id) {
      header.classList.add('c-article__heading')
      header.appendChild(createAnchorForID(header.id))
    }
  }
}

export default function() {
  const article = document.querySelector('.c-article__content')
  if (article) {
    // h2-h6
    for (let i = 1; i <= 6; i++) {
      createLinksWithinContainer(article, i)
    }

    const toc = document.querySelectorAll('.c-toc a')
    if (toc) {
      for (let link of toc) {
        console.log(link)
        const icon = document.createElement('span')
        icon.className = 'c-toc__icon'
        icon.innerHTML = svg
        link.appendChild(icon)
      }
    }
  }
}
