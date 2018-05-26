import validate from 'validate'
import serialize from 'form-serialize'

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
  try {
    event.preventDefault()
    const url = form.getAttribute('action')
    const formData = serialize(form, { hash: true })
    delete formData.options.redirect

    setSubmitButtonLoading(form)
    submitForm(url, formData, form)
  } catch (e) {
    form.submit()
  }
}

const submitForm = (url, body, form) => {
  return fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
    mode: 'cors',
  }).then(response =>
    response.json().then(data =>
      response.ok && data.success
        ? handleSuccess(form, data)
        : handleError(form, data)
    )
  )
}

const handleError = form => {
  setSubmitButtonFinished(form)
  showElement(form.querySelector('.js-form-error'))
}

const handleSuccess = form => {
  setSubmitButtonFinished(form)
  showElement(form.querySelector('.js-form-success'))
  form.reset()
}

export const hideAlerts = form => {
  hideElement(form.querySelector('.js-form-error'))
  hideElement(form.querySelector('.js-form-success'))
}

const showElement = element => (element.style.display = 'block')
const hideElement = element => (element.style.display = 'none')

const setSubmitButtonLoading = form => {
  const button = form.querySelector('.js-submit')
  button.setAttribute('disabled', 'disabled')
  button.classList.add('is-loading')
}

const setSubmitButtonFinished = form => {
  const button = form.querySelector('.js-submit')
  button.removeAttribute('disabled')
  button.classList.remove('is-loading')
}
