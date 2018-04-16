import validate from 'validate'

export const init = () => {
  validate.init({
    fieldClass: 'c-form__error',
    errorClass: 'c-form__error-message',
    disableSubmit: true,
    onSubmit: handleSubmit,
  })
}

export const deinit = () => {
  validate.destroy()
}

const handleSubmit = (form, fields) => {
  event.preventDefault()
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
