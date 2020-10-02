const getLoadTime = () =>
  (window.performance.timing.domContentLoadedEventEnd -
    window.performance.timing.navigationStart) /
  1e3
window.addEventListener('load', () => {
  document.querySelector(
    '.js-loaded-in',
  ).innerText = `- loaded in ${getLoadTime()}s`
})
