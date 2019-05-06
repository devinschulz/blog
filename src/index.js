import turbolinks from 'turbolinks'
import { Application } from 'stimulus'
import { definitionsFromContext } from 'stimulus/webpack-helpers'

import './css/main.css'

const application = Application.start()
const context = require.context('./js', true, /\.js$/)
application.load(definitionsFromContext(context))

turbolinks.start()
