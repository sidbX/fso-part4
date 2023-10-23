const loginRouter = require('express').Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/user')

loginRouter.post('/', async (req, res, next) => {
  try {
    const { username, password } = req.body
    const user = await User.findOne({ username })
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).send({ error: 'invalid username or password' })
    }

    const userForToken = {
      username,
      id: user._id,
    }
    const token = jwt.sign(userForToken, process.env.SECRET)
    res.json({ token, username, name: user.name })
  } catch (err) {
    next(err)
  }
})

module.exports = loginRouter
