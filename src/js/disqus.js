export default () => {
  const disqusThread = document.getElementById('disqus_thread')
  if (disqusThread) {
    if (window.DISQUS) {
      const { identifier, title } = document.querySelector(
        '.js-article'
      ).dataset
      window.DISQUS.reset({
        reload: true,
        config: function() {
          this.page.identifier = identifier
          this.page.url = window.location.href
          this.page.title = title
        },
      })
    } else {
      loadDisqus()
    }
  }
}

const loadDisqus = () => {
  const disqus = document.createElement('script')
  disqus.src = 'http://devinschulz.disqus.com/embed.js'
  ;(
    document.getElementsByTagName('head')[0] ||
    document.getElementsByTagName('body')[0]
  ).appendChild(disqus)
}
