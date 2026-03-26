const { test, expect, beforeEach, describe } = require('@playwright/test')

const loginWith = async (page, username, password) => {
  await page.getByRole('textbox', { name: /username/i }).fill(username)
  await page.getByRole('textbox', { name: /password/i }).fill(password)
  await page.getByRole('button', { name: 'login' }).click()
}

const createBlog = async (page, title, author, url) => {
  await page.getByRole('button', { name: 'create new blog' }).click()
  await page.getByRole('textbox', { name: /title/i }).fill(title)
  await page.getByRole('textbox', { name: /author/i }).fill(author)
  await page.getByRole('textbox', { name: /url/i }).fill(url)
  await page.getByRole('button', { name: 'create' }).click()
  await expect(page.getByText(`${title} ${author}`)).toBeVisible()
}

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('http://localhost:3003/api/testing/reset')
    await request.post('http://localhost:3003/api/users', {
      data: { username: 'testuser', name: 'Test User', password: 'testpassword' }
    })
    await request.post('http://localhost:3003/api/users', {
      data: { username: 'otheruser', name: 'Other User', password: 'otherpassword' }
    })
    await page.goto('http://localhost:5173')
  })

  test('Login form is shown', async ({ page }) => {
    await expect(page.getByText('Log in to application')).toBeVisible()
    await expect(page.getByRole('textbox', { name: /username/i })).toBeVisible()
    await expect(page.getByRole('textbox', { name: /password/i })).toBeVisible()
    await expect(page.getByRole('button', { name: 'login' })).toBeVisible()
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await loginWith(page, 'testuser', 'testpassword')
      await expect(page.getByText('Test User logged in')).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await loginWith(page, 'testuser', 'wrongpassword')
      await expect(page.getByText('Wrong username or password')).toBeVisible()
      await expect(page.getByText('Test User logged in')).not.toBeVisible()
    })
  })

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, 'testuser', 'testpassword')
    })

    // 5.19
    test('a new blog can be created', async ({ page }) => {
      await createBlog(page, 'My Test Blog', 'Test Author', 'http://testblog.com')
      await expect(page.getByText('My Test Blog Test Author')).toBeVisible()
    })

    // 5.20
    test('a blog can be liked', async ({ page }) => {
      await createBlog(page, 'Blog to Like', 'Author', 'http://url.com')
      await page.getByText('Blog to Like Author').locator('..').getByRole('button', { name: 'view' }).click()
      await expect(page.getByText('likes 0')).toBeVisible()
      await page.getByRole('button', { name: 'like' }).click()
      await expect(page.getByText('likes 1')).toBeVisible()
    })

    // 5.21
    test('the user who added the blog can delete it', async ({ page }) => {
      await createBlog(page, 'Blog to Delete', 'Author', 'http://url.com')
      await page.getByText('Blog to Delete Author').locator('..').getByRole('button', { name: 'view' }).click()

      page.on('dialog', dialog => dialog.accept())
      await page.getByRole('button', { name: 'remove' }).click()

      await expect(page.getByText('Blog to Delete Author')).not.toBeVisible()
    })

    // 5.22
    test('only the creator sees the delete button', async ({ page }) => {
      await createBlog(page, 'Creator Blog', 'Author', 'http://url.com')
      await page.getByRole('button', { name: 'logout' }).click()

      await loginWith(page, 'otheruser', 'otherpassword')
      await page.getByText('Creator Blog Author').locator('..').getByRole('button', { name: 'view' }).click()
      await expect(page.getByRole('button', { name: 'remove' })).not.toBeVisible()
    })

    // 5.23
    test('blogs are ordered by likes, most liked first', async ({ page }) => {
      await createBlog(page, 'Blog One', 'Author', 'http://one.com')
      await createBlog(page, 'Blog Two', 'Author', 'http://two.com')
      await createBlog(page, 'Blog Three', 'Author', 'http://three.com')

      // Give Blog Two 2 likes
      const blogTwo = page.getByText('Blog Two Author').locator('..')
      await blogTwo.getByRole('button', { name: 'view' }).click()
      await blogTwo.getByRole('button', { name: 'like' }).click()
      await expect(blogTwo.getByText('likes 1')).toBeVisible()
      await blogTwo.getByRole('button', { name: 'like' }).click()
      await expect(blogTwo.getByText('likes 2')).toBeVisible()

      // Give Blog Three 1 like
      const blogThree = page.getByText('Blog Three Author').locator('..')
      await blogThree.getByRole('button', { name: 'view' }).click()
      await blogThree.getByRole('button', { name: 'like' }).click()
      await expect(blogThree.getByText('likes 1')).toBeVisible()

      // Check order: Blog Two (2), Blog Three (1), Blog One (0)
      const blogs = page.locator('.blog')
      await expect(blogs.nth(0)).toContainText('Blog Two')
      await expect(blogs.nth(1)).toContainText('Blog Three')
      await expect(blogs.nth(2)).toContainText('Blog One')
    })
  })
})
