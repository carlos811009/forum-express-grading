const express = require('express')
const handlebars = require('express-handlebars')
const flash = require('connect-flash')
const helpers = require('./_helpers')
const session = require('express-session')
const passport = require('./config/passport')
const methodOverride = require('method-override')
const app = express()

console.log(process.env.NODE_ENV)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const port = process.env.PORT || 3000
app.use('/upload', express.static(__dirname + '/upload'))
app.use(express.urlencoded({ extended: true }))
app.engine('handlebars', handlebars({
  defaultLayout: 'main',
  helpers: require('./config/handlebars-helpers')
}))
app.set('view engine', 'handlebars')
app.use(methodOverride('_method'))
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }))
app.use(flash())
app.use(passport.initialize())
app.use(passport.session())

app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  res.locals.user = helpers.getUser(req)
  next()
})



require('./routes')(app)

module.exports = app
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})


