export const bindSubmitEventListeners = () => {
  const forms = document.querySelectorAll('.js-comment-form')
  for (let form of forms) {
    form.addEventListener('submit', handleSubmit, false)
  }
}

export const unbindSubmitEventListerners = () => {
  const forms = document.querySelectorAll('.js-comment-form')
  for (let form of forms) {
    form.removeEventListener('submit', handleSubmit)
  }
}

export const handleSubmit = event => {
  event.preventDefault()
  const form = event.target
  const url = form.getAttribute('action')
  submitForm(url, new FormData(form))
    .then(handleSuccess)
    .catch(handleError)
}

const submitForm = (url, body) => {
  return fetch(url, {
    method: 'POST',
    body,
  }).then(response => {
    return response.json().then(data => {
      return response.ok
        ? Promise.resolve(data)
        : Promise.reject({ status: response.status, data })
    })
  })
}

const handleError = error => {
  console.error(error)
}

const handleSuccess = data => {
  console.log(data)
}
