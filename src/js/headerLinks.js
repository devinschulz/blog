// based on https://github.com/gohugoio/hugo/blame/master/docs/themes/gohugoioTheme/src/js/anchorforid.js
const createAnchorForID = id => {
  const anchor = document.createElement('a')
  anchor.className = 'c-article__link'
  anchor.href = `#${id}`
  anchor.innerHTML =
    '<svg class="c-article__link__icon" width="18" height="18" viewBox="0 0 24 24"><path d="M6.188 8.72c.44-.44.926-.802 1.444-1.088 2.887-1.59 6.59-.745 8.445 2.07l-2.246 2.244c-.643-1.47-2.242-2.305-3.833-1.95-.6.135-1.168.434-1.633.9L4.06 15.2c-1.307 1.308-1.307 3.434 0 4.74 1.307 1.308 3.433 1.308 4.74 0l1.327-1.326c1.207.48 2.5.67 3.78.575l-2.93 2.928c-2.51 2.51-6.582 2.51-9.093 0s-2.51-6.582 0-9.093L6.188 8.72zm6.836-6.837l-2.93 2.93c1.278-.097 2.573.095 3.78.573L15.2 4.06c1.307-1.307 3.433-1.307 4.74 0 1.307 1.307 1.307 3.433 0 4.74l-4.305 4.305c-1.31 1.31-3.44 1.3-4.74 0-.303-.303-.564-.68-.727-1.05l-2.246 2.244c.236.357.48.666.796.98.812.813 1.846 1.418 3.036 1.705 1.542.37 3.194.166 4.613-.617.518-.286 1.005-.648 1.444-1.087l4.305-4.304c2.512-2.51 2.512-6.582 0-9.093-2.51-2.51-6.58-2.51-9.09 0z"/><svg>'
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
