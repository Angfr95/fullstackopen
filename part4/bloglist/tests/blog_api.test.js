const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')

const api = supertest(app)

const initialBlogs = [
  {
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
  },
  {
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
  },
]

let token

beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  await api.post('/api/users').send({
    username: 'testuser',
    name: 'Test User',
    password: 'password123',
  })

  const loginResponse = await api.post('/api/login').send({
    username: 'testuser',
    password: 'password123',
  })
  token = loginResponse.body.token

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(initialBlogs[0])

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(initialBlogs[1])
})

describe('GET /api/blogs', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('correct amount of blogs is returned', async () => {
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, initialBlogs.length)
  })

  test('unique identifier is named id, not _id', async () => {
    const response = await api.get('/api/blogs')
    const blog = response.body[0]
    assert.ok(blog.id)
    assert.strictEqual(blog._id, undefined)
  })
})

describe('POST /api/blogs', () => {
  test('a valid blog can be added with token', async () => {
    const newBlog = {
      title: 'async/await simplifies making async calls',
      author: 'Test Author',
      url: 'http://test.com',
      likes: 3,
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, initialBlogs.length + 1)

    const titles = response.body.map(b => b.title)
    assert.ok(titles.includes(newBlog.title))
  })

  test('fails with 401 if token is not provided', async () => {
    const newBlog = {
      title: 'Blog without token',
      author: 'Test Author',
      url: 'http://test.com',
      likes: 3,
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)

    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, initialBlogs.length)
  })

  test('likes defaults to 0 if missing', async () => {
    const newBlog = {
      title: 'Blog without likes',
      author: 'Test Author',
      url: 'http://test.com',
    }

    const response = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)

    assert.strictEqual(response.body.likes, 0)
  })

  test('missing title returns 400', async () => {
    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send({ author: 'Test Author', url: 'http://test.com', likes: 3 })
      .expect(400)
  })

  test('missing url returns 400', async () => {
    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Blog without url', author: 'Test Author', likes: 3 })
      .expect(400)
  })
})

describe('DELETE /api/blogs/:id', () => {
  test('succeeds with status 204 if creator deletes the blog', async () => {
    const blogsAtStart = await api.get('/api/blogs')
    const blogToDelete = blogsAtStart.body[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const blogsAtEnd = await api.get('/api/blogs')
    assert.strictEqual(blogsAtEnd.body.length, initialBlogs.length - 1)

    const titles = blogsAtEnd.body.map(b => b.title)
    assert.ok(!titles.includes(blogToDelete.title))
  })
})

describe('PUT /api/blogs/:id', () => {
  test('succeeds in updating the likes of a blog', async () => {
    const blogsAtStart = await api.get('/api/blogs')
    const blogToUpdate = blogsAtStart.body[0]

    const updatedData = { ...blogToUpdate, likes: blogToUpdate.likes + 10 }

    const response = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedData)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.likes, blogToUpdate.likes + 10)
  })

  test('returns 404 if id does not exist', async () => {
    const nonExistingId = new mongoose.Types.ObjectId()

    await api
      .put(`/api/blogs/${nonExistingId}`)
      .send({ title: 'test', author: 'test', url: 'http://test.com', likes: 0 })
      .expect(404)
  })
})

after(async () => {
  await mongoose.connection.close()
})
