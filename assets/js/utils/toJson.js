export default function(response) {
  return response.text().then(text => {
    const result = Promise.resolve(text ? JSON.parse(text) : {})
    return response.ok ? result : result.then(Promise.reject.bind(Promise))
  })
}
