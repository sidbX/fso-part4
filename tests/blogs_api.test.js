const mongoose = require('mongoose')
const supertest = require('supertest')
const _ = require('lodash')
// const Blog = require('../models/blog')
const app = require('../app')
const helper = require('./test_helper')
const Blog = require('../models/blog')

const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})
  await Promise.all(helper.initialBlogs.map((blog) => new Blog(blog).save()))
}, 10000)

test('get all notes', async () => {
  const response = await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
  expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('check if all blogs have an id', async () => {
  const response = await api.get('/api/blogs')
  const blogs = response.body
  blogs.forEach((blog) => expect(blog.id).toBeDefined())
})

test('check if creating a blog without token fails', async () => {
  // post request
  const newBlog = {
    title: Math.random().toString(36).substring(2, 7),
    author: Math.random().toString(36).substring(2, 7),
    url: `${Math.random().toString(36).substring(2, 7)}.com`,
    likes: Math.floor(Math.random() * 100),
  }
  await api.post('/api/blogs').send(newBlog).expect(401)
})

test('create a blog with token', async () => {
  const response = await api.get('/api/blogs')
  const initialBlogsCount = response.body.length

  // post request
  const newBlog = {
    title: Math.random().toString(36).substring(2, 7),
    author: Math.random().toString(36).substring(2, 7),
    url: `${Math.random().toString(36).substring(2, 7)}.com`,
    likes: Math.floor(Math.random() * 100),
  }
  const token = await helper.getValidUserToken()
  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const newResponse = await api.get('/api/blogs')
  expect(newResponse.body.length).toEqual(initialBlogsCount + 1)
  expect(_.find(newResponse.body, newBlog)).not.toEqual(null)
  // expect(newResponse.body[newResponse.body.length - 1].title).toEqual(
  //   newBlog.title,
  // )
  // expect(newResponse.body[newResponse.body.length - 1].title).toEqual(
  //   newBlog.author,
  // )
  // expect(newResponse.body[newResponse.body.length - 1].title).toEqual(
  //   newBlog.url,
  // )
  // expect(newResponse.body[newResponse.body.length - 1].title).toEqual(
  //   newBlog.likes,
  // )
})

test('if likes is missing in the request, check if defaults to 0', async () => {
  const blog = {
    title: Math.random().toString(36).substring(2, 10),
    author: Math.random().toString(36).substring(2, 10),
    url: `${Math.random().toString(36).substring(2, 10)}.com`,
  }

  const token = await helper.getValidUserToken()
  // post req
  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(blog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const response = await api.get('/api/blogs')
  expect(
    response.body.find(
      (resBlog) => resBlog.title === blog.title
        && resBlog.author === blog.author
        && resBlog.url === blog.url,
    ).likes,
  ).toEqual(0)
})

test('if "title" or "url" is missing', async () => {
  const blog = {
    author: Math.random().toString(36).substring(2, 10),
    url: `${Math.random().toString(36).substring(2, 10)}.com`,
  }

  const token = await helper.getValidUserToken()
  // post
  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(blog)
    .expect(400)

  blog.title = Math.random().toString(36).substring(2, 10)
  delete blog.url

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(blog)
    .expect(400)
})

test('deletes the blog if id is valid', async () => {
  const initialBlogsCount = (await api.get('/api/blogs')).body.length
  const id = await helper.getValidId()
  const token = await helper.getValidUserToken(id)
  await api
    .delete(`/api/blogs/${id}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(204)
  expect((await api.get('/api/blogs')).body.length).toEqual(
    initialBlogsCount - 1,
  )
})

test('update a blog', async () => {
  const blog = {
    likes: 500,
  }
  const id = await helper.getValidId()
  await api.put(`/api/blogs/${id}`).send(blog)
  expect((await Blog.findById(id)).likes).toEqual(blog.likes)
})

afterAll(async () => {
  await mongoose.connection.close()
})
