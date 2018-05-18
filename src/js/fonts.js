import FontFaceObserver from 'fontfaceobserver'

const sharedFontStyles = [
  { weight: 400 },
  { weight: 400, style: 'italic' },
  { weight: 'bold' },
  { weight: 'bold', style: 'italic' },
]

const fontFamilies = {
  'HK Grotesk': sharedFontStyles,
  'PT Serif': sharedFontStyles,
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
