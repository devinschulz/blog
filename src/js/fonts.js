import FontFaceObserver from 'fontfaceobserver'

const fontFamilies = {
  Palanquin: [{ weight: 400 }, { weight: 700 }],
  Montserrat: [{ weight: 700 }],
  Lora: [{ weight: 700 }],
}

const fontObservers = Object.keys(fontFamilies).reduce((accumulator, key) => {
  accumulator.push(
    fontFamilies[key].map(config => new FontFaceObserver(key, config).load())
  )
  return accumulator
}, [])

const fontsLoaded = () => {
  document.documentElement.classList.add('fonts-loaded')
  sessionStorage.foutFontsLoaded = true
}

export default () => {
  if (sessionStorage.foutFontsLoaded) {
    fontsLoaded()
  }

  Promise.all(fontObservers)
    .then(fontsLoaded)
    .catch(fontsLoaded)
}
