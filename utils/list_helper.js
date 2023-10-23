const _ = require('lodash')

const totalLikes = (blogs) => blogs.map((blog) => blog.likes).reduce((sum, curr) => sum + curr, 0)

const favoriteBlog = (blogs) => {
  const maxLikes = Math.max(...blogs.map((blog) => blog.likes))
  const mostLikedBlog = blogs.filter((blog) => blog.likes === maxLikes)[0]
  // console.log(mostLikedBlog)

  return (({ title, author, likes }) => ({ title, author, likes }))(
    mostLikedBlog,
  )
}

const mostBlogs = (blogs) => {
  const authorsCountObj = _.countBy(blogs, 'author')
  const maxBlogsCount = Math.max(...Object.values(authorsCountObj))
  let objToBeReturned = null
  _.forOwn(authorsCountObj, (value, key) => {
    if (value === maxBlogsCount) {
      objToBeReturned = {
        author: key,
        blogs: value,
      }
      return false
    }
    return true
  })
  return objToBeReturned
}

const mostLikes = (blogs) => {
  const authors = _.uniq(blogs.map((blog) => blog.author))
  const authorLikesObj = {}
  authors.forEach((author) => {
    let likesCount = 0
    blogs.forEach((blog) => {
      if (blog.author === author) {
        likesCount += blog.likes
      }
    })
    authorLikesObj[author] = likesCount
  })
  return {
    author: _.findKey(
      authorLikesObj,
      (val) => val === Math.max(...Object.values(authorLikesObj)),
    ),
    likes: Math.max(...Object.values(authorLikesObj)),
  }
}
module.exports = {
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
}
