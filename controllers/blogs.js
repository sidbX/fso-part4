const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('', async (request, response) => {
  const blogs = await Blog.find({}).populate('user')
  response.json(blogs)
})

blogsRouter.post('', async (request, response, next) => {
  try {
    // if (!request.token) {
    //   return response.status(401).send({ error: 'invalid token' })
    // }
    // const decodedToken = jwt.verify(request.token, process.env.SECRET)
    if (!request.user) {
      return response.status(401).send({ error: 'invalid token' })
    }
    const user = await User.findById(request.user)
    if (
      !Object.prototype.hasOwnProperty.call(request.body, 'title')
      || !Object.prototype.hasOwnProperty.call(request.body, 'url')
    ) {
      return response.status(400).end()
    }
    const blog = new Blog({
      title: request.body.title,
      author: request.body.author,
      url: request.body.url,
      likes: request.body.likes,
      user: user.id,
    })
    const result = await blog.save()
    user.blogs = user.blogs.concat(result.id)
    await user.save()
    return response.status(201).json(result)
  } catch (err) {
    return next(err)
  }
})

blogsRouter.delete('/:id', async (req, res, next) => {
  try {
    // if (!req.token) {
    //   return res.status(401).send({ error: 'invalid token' })
    // }
    // const decodedToken = jwt.verify(req.token, process.env.SECRET)
    if (!req.user) {
      return res.status(401).send({ error: 'invalid token' })
    }
    const blog = await Blog.findById(req.params.id)
    if (blog.user.toString() === req.user.toString()) {
      await Blog.findByIdAndRemove(req.params.id)
      return res.status(204).end()
    }
    return res.status(400).send({ error: 'Not the owner of the blog' })
  } catch (err) {
    return next(err)
  }
})

blogsRouter.put('/:id', async (req, res, next) => {
  try {
    const resBlog = await Blog.findOneAndUpdate(
      { _id: req.params.id },
      { likes: req.body.likes },
      { new: true },
    )
    res.json(resBlog)
  } catch (err) {
    next(err)
  }
})

module.exports = blogsRouter
