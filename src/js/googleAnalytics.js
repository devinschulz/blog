// Based on http://reed.github.io/turbolinks-compatibility/google_analytics.html
const analyticsId = 'UA-48758540-1'

export const init = () => {
  load()
  ga('create', analyticsId, 'auto')

  if (typeof Turbolinks !== 'undefined' && Turbolinks.supported) {
    return document.addEventListener('page:change', trackPageview, true)
  }
  trackPageview()
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

const trackPageview = () => {
  if (!isLocalRequest()) {
    ga('send', 'pageview')
  }
}

const isLocalRequest = () => document.domain.includes('local')
