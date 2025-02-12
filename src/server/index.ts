import compression from 'compression'
import cookiePaser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import mongoSanitize from 'express-mongo-sanitize'
import helmet from 'helmet'
import http from 'http'

import './services/tatum'

import env from './configs/env'
import morgan from './configs/morgan'
import xss from './configs/xss'
import appRoutes from './routes'
import errorHandler from './utils/error'

const app = express()
const server = http.createServer(app)

// use morgan to log request
app.use(morgan.successHandler)
app.use(morgan.errorHandler)

// set security http header
app.use(helmet())

// set cors
app.use(
  cors({
    origin: '*',
    credentials: true,
    exposedHeaders: ['set-cookie'],
  }),
)

app.use(express.json())

// santitize request data
app.use((req, _res, next) => {
  if (req.body) {
    req.body = xss.clean(req.body)
  }
  if (req.params) {
    req.params = xss.clean(req.params)
  }
  if (req.query) {
    req.query = xss.clean(req.query)
  }

  next()
})
app.use(mongoSanitize())

// gzip compression
app.use(compression())

app.use(cookiePaser())

// routes here
app.use('/multichain-parser/v1', appRoutes)

// error handler
app.use(errorHandler)

const PORT = env.port == 8888 ? 8888 : env.env == 'production' && env.port == 8000 ? 8000 : 9000

// listen app
server.listen(PORT, async () => {
  console.log('Node is running on port: ', PORT)
})
