function relatedPosts() {
  const viewAllButton = document.querySelector('.js-view-all')
  if (viewAllButton) {
    viewAllButton.addEventListener('click', event => {
      event.preventDefault()
      document.querySelector('.js-all').classList.remove('hidden')
      viewAllButton.parentNode.removeChild(viewAllButton)
    })
  }
}

function init() {
  relatedPosts()
}

const swup = new Swup({
  animateHistoryBrowsing: true,
  animationSelector: '[class*="o-transition-"]',
  containers: ['#main-nav', '#content'],
  plugins: [
    new SwupPreloadPlugin(),
    new SwupHeadPlugin(),
    new SwupScrollPlugin(),
  ],
})

init()

swup.on('contentReplaced', init)
