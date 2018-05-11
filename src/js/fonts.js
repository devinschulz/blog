import FontFaceObserver from 'fontfaceobserver'

const fontFamilies = {
  'Anonymous Pro': [
    { weight: 400 },
    { weight: 400, style: 'italic' },
    { weight: 600 },
    { weight: 600, style: 'italic' },
  ],
  Karla: [
    { weight: 400 },
    { weight: 400, style: 'italic' },
    { weight: 600 },
    { weight: 600, style: 'italic' },
  ],
  Poppins: [{ weight: 800 }],
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
