import 'core-js/fn/array/includes'

// Based on http://reed.github.io/turbolinks-compatibility/google_analytics.html
const ANALYTICS_ID = 'UA-48758540-1'
const SEND = 'send'

export const init = () => {
  load()
  ga('create', ANALYTICS_ID, 'auto')

  if (typeof Turbolinks !== 'undefined' && Turbolinks.supported) {
    return document.addEventListener('turbolinks:visit', trackPageview, true)
  }
  trackPageview()
}

export const trackPageview = () => {
  if (!isLocalRequest() && allowTracking()) {
    ga(SEND, 'pageview')
  }
}

export const trackEvent = (eventAction, eventCategory, eventLabel) => {
  if (!isLocalRequest() && allowTracking()) {
    ga(SEND, 'event', eventCategory, eventAction, eventLabel)
  }
}

export const trackSocialEvent = (socialNetwork, socialAction, socialTarget) => {
  if (!isLocalRequest() && allowTracking()) {
    ga(SEND, 'social', socialNetwork, socialAction, socialTarget)
  }
}

const load = () => {
  ;(function(i, s, o, g, r, a, m) {
    i['GoogleAnalyticsObject'] = r
    ;(i[r] =
      i[r] ||
      function() {
        ;(i[r].q = i[r].q || []).push(arguments)
      }),
      (i[r].l = 1 * new Date())
    ;(a = s.createElement(o)), (m = s.getElementsByTagName(o)[0])
    a.async = 1
    a.src = g
    m.parentNode.insertBefore(a, m)
  })(
    window,
    document,
    'script',
    'https://www.google-analytics.com/analytics.js',
    'ga'
  )
}
const isLocalRequest = () => document.domain.includes('local')

const doNotTrack = () => !!window.navigator.doNotTrack

const allowTracking = () => !doNotTrack()
