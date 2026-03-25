const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')

const api = supertest(app)

beforeEach(async () => {
  await User.deleteMany({})
  await api.post('/api/users').send({
    username: 'root',
    name: 'Root User',
    password: 'sekret',
  })
})

describe('POST /api/users', () => {
  test('creation succeeds with valid data', async () => {
    const newUser = { username: 'hellas', name: 'Arto Hellas', password: 'salainen' }

    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.username, newUser.username)

    const users = await api.get('/api/users')
    assert.strictEqual(users.body.length, 2)
  })

  test('fails with 400 if username is missing', async () => {
    const response = await api
      .post('/api/users')
      .send({ name: 'No Username', password: 'sekret' })
      .expect(400)

    assert.ok(response.body.error)
  })

  test('fails with 400 if username is too short', async () => {
    const response = await api
      .post('/api/users')
      .send({ username: 'ab', name: 'Short', password: 'sekret' })
      .expect(400)

    assert.ok(response.body.error)
  })

  test('fails with 400 if password is missing', async () => {
    const response = await api
      .post('/api/users')
      .send({ username: 'validuser', name: 'No Pass' })
      .expect(400)

    assert.ok(response.body.error)
  })

  test('fails with 400 if password is too short', async () => {
    const response = await api
      .post('/api/users')
      .send({ username: 'validuser', name: 'Short Pass', password: 'ab' })
      .expect(400)

    assert.ok(response.body.error)
  })

  test('fails with 400 if username is already taken', async () => {
    const response = await api
      .post('/api/users')
      .send({ username: 'root', name: 'Duplicate', password: 'sekret' })
      .expect(400)

    assert.ok(response.body.error.includes('unique'))
  })
})

after(async () => {
  await mongoose.connection.close()
})
