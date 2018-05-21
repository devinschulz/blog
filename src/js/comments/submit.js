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
  }).then(response => {
    return response.json().then(data => {
      return response.ok && data.success
        ? handleSuccess(form, data)
        : handleError(form, data)
    })
  })
}

const handleError = form => {
  showElement(form.querySelector('.js-form-error'))
}

const handleSuccess = form => {
  showElement(form.querySelector('.js-form-success'))
  form.reset()
}

const showElement = element => (element.style.display = 'block')
