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

function loadFonts() {
  WebFont.load({
    google: {
      families: ['Lora:400,400i,700,700i', 'Poppins:500,700&display=swap'],
    },
  })
}

function init() {
  relatedPosts()
}

init()
loadFonts()

const swup = new Swup({
  animateHistoryBrowsing: true,
  animationSelector: '[class*="o-transition-"]',
  containers: ['#main-nav', '#content', '#secondary-nav'],
  plugins: [
    new SwupPreloadPlugin(),
    new SwupHeadPlugin(),
    new SwupScrollPlugin(),
  ],
})

swup.on('contentReplaced', init)
