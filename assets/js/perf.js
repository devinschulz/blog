;(function() {
  const getLoadTime = () =>
    (window.performance.timing.domContentLoadedEventEnd -
      window.performance.timing.navigationStart) /
    1000
  window.addEventListener('load', () => {
    document.querySelector(
      '.js-loaded-in'
    ).innerText = `- loaded in ${getLoadTime()}s`
  })
})()
