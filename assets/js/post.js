const viewAllButton = document.querySelector('.js-view-all')
if (viewAllButton) {
  viewAllButton.addEventListener('click', (event) => {
    event.preventDefault()
    document.querySelector('.js-all').classList.remove('hidden')
    viewAllButton.parentNode.removeChild(viewAllButton)
  })
}
