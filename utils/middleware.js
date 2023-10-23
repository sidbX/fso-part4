const jwt = require('jsonwebtoken')
const logger = require('./logger')

const requestLogger = (req, res, next) => {
  logger.info(req)
  next()
}

const errorHandler = (err, req, res, next) => {
  if (err.name === 'ValidationError') {
    return res.status(400).send({ error: err.message })
  }
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).send({ error: err.message })
  }
  next(err)
}

const tokenExtractor = (req, res, next) => {
  const auth = req.get('authorization')
  if (auth && auth.startsWith('Bearer ')) {
    req.token = auth.split(' ').pop()
  } else {
    req.token = null
  }
  next()
}

const userExtractor = (req, res, next) => {
  if (!req.token) {
    req.user = null
  } else {
    const decodedToken = jwt.verify(req.token, process.env.SECRET)
    req.user = decodedToken.id
  }
  next()
}
module.exports = {
  requestLogger,
  errorHandler,
  tokenExtractor,
  userExtractor,
}
