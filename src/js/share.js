import { trackSocialEvent } from './googleAnalytics'

const MAILTO_RE = /^mailto/i

export default function() {
  const shareLinks = document.querySelectorAll('.js-share')
  for (let link of shareLinks) {
    link.addEventListener('click', onClick, false)
  }
}

const onClick = event => {
  const { target } = event

  trackSocialEvent(target.dataset.share, 'share', window.location.href)

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
