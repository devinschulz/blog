const createAnchor = (id, text) => {
  const anchor = document.createElement('a')
  anchor.href = `#${id}`
  anchor.innerHTML = text
  return anchor
}

const linkify = header => {
  const child = createAnchor(header.id, header.textContent)
  header.innerHTML = ''
  header.appendChild(child)
}

const createLinksWithinArticle = article => level =>
  Array.from(article.getElementsByTagName(`h${level}`)).forEach(linkify)

const HEADER_LEVELS = [2, 3, 4, 5, 6]

const linkifyHeadings = article =>
  HEADER_LEVELS.forEach(createLinksWithinArticle(article))

export default () =>
  Array.from(document.querySelectorAll('.markdown')).forEach(linkifyHeadings)
