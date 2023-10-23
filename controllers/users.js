const usersRouter = require('express').Router()
const bcrypt = require('bcrypt')
const User = require('../models/user')

usersRouter.post('/', async (req, res, next) => {
  try {
    const { username, name, password } = req.body

    if (password.length < 3) {
      return res
        .status(400)
        .json({
          error: 'Password length must be greater than three characters',
        })
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = new User({
      username,
      name,
      passwordHash,
    })

    const savedUser = await user.save()
    res.status(201).json(savedUser)
  } catch (err) {
    next(err)
  }
})

usersRouter.get('/', async (req, res, next) => {
  try {
    const users = await User.find({}).populate('blogs')
    res.json(users)
  } catch (err) {
    next(err)
  }
})

module.exports = usersRouter
