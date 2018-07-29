const ANALYTICS_ID = 'UA-48758540-1'

export const trackPageView = () =>
  !isLocalRequest() &&
  gtag('config', ANALYTICS_ID, { page_path: window.location.pathname })

export const trackEvent = (type, payload) =>
  !isLocalRequest() && gtag('event', type, payload)

export const trackPageLoad = () => {
  if (window.performance) {
    const timeSincePageLoad = Math.round(performance.now())
    trackEvent('timing_complete', {
      name: 'load',
      value: timeSincePageLoad,
      event_category: 'JS Dependencies',
    })
  }
}

const isLocalRequest = () => document.domain.includes('local')
