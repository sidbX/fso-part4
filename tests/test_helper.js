const jwt = require('jsonwebtoken')
const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
  {
    title: '3qnkn',
    author: 'mfomr',
    url: 'b8a5i.com',
    likes: 500,
    id: '65276a24ff23eb05b0ca3a85',
  },
  {
    title: '1vzqr',
    author: '922j7',
    url: '65x52.com',
    likes: 68,
    id: '65276a927da6943f4c24b027',
  },
  {
    title: 'fh2ro',
    author: 'nu0zc',
    url: 'c8sct.com',
    likes: 92,
    id: '652a4d76d9d2989d3c717630',
  },
]

const getValidId = async () => {
  const blogs = await Blog.find({})
  return blogs[Math.floor(Math.random() * blogs.length)].id.toString()
}

const getValidUserToken = async (blogId) => {
  let user = null
  if (!blogId) {
    const users = await User.find({})
    user = users[users.length - 1]
  } else {
    const blog = await Blog.findById(blogId)
    user = await User.findById(blog.user)
  }
  const userForToken = {
    username: user.username,
    id: user._id,
  }
  return jwt.sign(userForToken, process.env.SECRET)
}

module.exports = {
  initialBlogs,
  getValidId,
  getValidUserToken,
}
