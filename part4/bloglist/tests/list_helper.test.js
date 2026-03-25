const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')

test('dummy returns one', () => {
  const blogs = []

  const result = listHelper.dummy(blogs)
  assert.strictEqual(result, 1)
})

describe('total likes', () => {
  test('when list is empty, equals zero', () => {
    const result = listHelper.totalLikes([])
    assert.strictEqual(result, 0)
  })

  test('when list has only one blog, equals the likes of that', () => {
    const listWithOneBlog = [
      {
        _id: '5a422aa71b54a676234d17f8',
        title: 'Go To Statement Considered Harmful',
        author: 'Edsger W. Dijkstra',
        url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
        likes: 5,
        __v: 0,
      },
    ]
    const result = listHelper.totalLikes(listWithOneBlog)
    assert.strictEqual(result, 5)
  })

  test('when list has multiple blogs, equals the sum of all likes', () => {
    const blogs = [
      { title: 'Blog A', author: 'Author A', url: 'http://a.com', likes: 7 },
      { title: 'Blog B', author: 'Author B', url: 'http://b.com', likes: 3 },
      { title: 'Blog C', author: 'Author C', url: 'http://c.com', likes: 10 },
    ]
    const result = listHelper.totalLikes(blogs)
    assert.strictEqual(result, 20)
  })
})

describe('favorite blog', () => {
  test('when list is empty, returns null', () => {
    const result = listHelper.favoriteBlog([])
    assert.strictEqual(result, null)
  })

  test('when list has only one blog, returns it', () => {
    const blogs = [
      { title: 'Only Blog', author: 'Author', url: 'http://a.com', likes: 4 },
    ]
    const result = listHelper.favoriteBlog(blogs)
    assert.deepStrictEqual(result, blogs[0])
  })

  test('returns the blog with most likes', () => {
    const blogs = [
      { title: 'Blog A', author: 'Author A', url: 'http://a.com', likes: 7 },
      { title: 'Blog B', author: 'Author B', url: 'http://b.com', likes: 15 },
      { title: 'Blog C', author: 'Author C', url: 'http://c.com', likes: 10 },
    ]
    const result = listHelper.favoriteBlog(blogs)
    assert.deepStrictEqual(result, blogs[1])
  })
})

describe('most blogs', () => {
  test('when list is empty, returns null', () => {
    const result = listHelper.mostBlogs([])
    assert.strictEqual(result, null)
  })

  test('when list has only one blog, returns that author', () => {
    const blogs = [
      { title: 'Blog A', author: 'Robert C. Martin', url: 'http://a.com', likes: 3 },
    ]
    const result = listHelper.mostBlogs(blogs)
    assert.deepStrictEqual(result, { author: 'Robert C. Martin', blogs: 1 })
  })

  test('returns the author with most blogs', () => {
    const blogs = [
      { title: 'Blog A', author: 'Robert C. Martin', url: 'http://a.com', likes: 3 },
      { title: 'Blog B', author: 'Robert C. Martin', url: 'http://b.com', likes: 5 },
      { title: 'Blog C', author: 'Robert C. Martin', url: 'http://c.com', likes: 1 },
      { title: 'Blog D', author: 'Edsger W. Dijkstra', url: 'http://d.com', likes: 7 },
      { title: 'Blog E', author: 'Edsger W. Dijkstra', url: 'http://e.com', likes: 2 },
    ]
    const result = listHelper.mostBlogs(blogs)
    assert.deepStrictEqual(result, { author: 'Robert C. Martin', blogs: 3 })
  })
})

describe('most likes', () => {
  test('when list is empty, returns null', () => {
    const result = listHelper.mostLikes([])
    assert.strictEqual(result, null)
  })

  test('when list has only one blog, returns that author', () => {
    const blogs = [
      { title: 'Blog A', author: 'Edsger W. Dijkstra', url: 'http://a.com', likes: 17 },
    ]
    const result = listHelper.mostLikes(blogs)
    assert.deepStrictEqual(result, { author: 'Edsger W. Dijkstra', likes: 17 })
  })

  test('returns the author with most total likes', () => {
    const blogs = [
      { title: 'Blog A', author: 'Robert C. Martin', url: 'http://a.com', likes: 3 },
      { title: 'Blog B', author: 'Robert C. Martin', url: 'http://b.com', likes: 5 },
      { title: 'Blog C', author: 'Edsger W. Dijkstra', url: 'http://c.com', likes: 10 },
      { title: 'Blog D', author: 'Edsger W. Dijkstra', url: 'http://d.com', likes: 7 },
    ]
    const result = listHelper.mostLikes(blogs)
    assert.deepStrictEqual(result, { author: 'Edsger W. Dijkstra', likes: 17 })
  })
})
