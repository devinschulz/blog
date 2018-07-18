// https://github.com/google/web-starter-kit/
const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    window.location.hostname === '[::1]' ||
    window.location.hostname.match(
      /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
)

export default () => {
  if (
    'serviceWorker' in navigator &&
    (window.location.protocol === 'https:' || !isLocalhost)
  ) {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then(registration => {
        registration.onupdatefound = () => {
          if (navigator.serviceWorker.controller) {
            const installingWorker = registration.installing

            installingWorker.onstatechange = () => {
              switch (installingWorker.state) {
                case 'installed':
                  break

                case 'redundant':
                  throw new Error('The service worker became redundant.')

                default:
                // Ignore
              }
            }
          }
        }
      })
      .catch(e => {
        console.error('Error during service worker registration:', e) // eslint-disable-line no-console
      })
  }
}
