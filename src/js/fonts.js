import FontFaceObserver from 'fontfaceobserver'

const sharedFontStyles = [
  { weight: 400 },
  { weight: 400, style: 'italic' },
  { weight: 'bold' },
  { weight: 'bold', style: 'italic' },
]

const fontFamilies = {
  Karla: sharedFontStyles,
  Hack: sharedFontStyles,
}

const fontObservers = Object.keys(fontFamilies).reduce(
  (accumulator, key) =>
    accumulator.concat(
      fontFamilies[key].map(config => new FontFaceObserver(key, config).load())
    ),
  []
)

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
