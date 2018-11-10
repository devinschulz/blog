import { trackEvent } from './googleAnalytics'

const MAILTO_RE = /^mailto/i

export default function() {
  Array.from(document.querySelectorAll('.js-share')).forEach(link => {
    link.addEventListener('click', onClick, false)
  })
}

const onClick = event => {
  let { target } = event
  target = target.closest('a')

  trackEvent('share', { method: target.dataset.share })

  const width = 500
  const height = 300
  const left = screen.width / 2 - width / 2
  const top = screen.height / 2 - height / 2

  if (!MAILTO_RE.test(target.href)) {
    event.preventDefault()
    window.open(
      target.href,
      '',
      `menubar=no,toolbar=no,resizable=yes,scrollbars=yes,width=${width},height=${height},top=${top},left=${left}`
    )
  }
}
