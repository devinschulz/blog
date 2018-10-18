const ANALYTICS_ID = 'UA-48758540-1'

export const trackPageView = () =>
  !isLocalRequest() &&
  gtag('config', ANALYTICS_ID, { page_path: window.location.pathname })

export const trackEvent = (action, args = {}) => {
  !isLocalRequest() &&
    gtag('event', action, {
      ...args,
    })
}

export const trackPageLoad = () => {
  if (window.performance) {
    const timeSincePageLoad = Math.round(performance.now())
    trackEvent('page_load', {
      event_category: 'performance',
      value: timeSincePageLoad,
    })
  }
}

const isLocalRequest = () => document.domain.includes('local')
