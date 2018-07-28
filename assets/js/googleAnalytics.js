const ANALYTICS_ID = 'UA-48758540-1'

export const trackPageview = () =>
  !isLocalRequest() &&
  gtag('config', ANALYTICS_ID, { page_path: window.location.pathname })

export const trackEvent = (type, payload) =>
  !isLocalRequest() && gtag('event', type, payload)

const isLocalRequest = () => document.domain.includes('local')
