const express = require('express')
const router = express.Router()
const puppeteer = require('puppeteer')

router.post('/', async (req, res) => {
  const htmlBody = req.body.data
  async function printPDF() {
    try {
      const browser = await puppeteer.launch({
        headless: true, //true才能印PDF，false為除錯模式
      })
      const page = await browser.newPage()
      await page.setViewport({ width: 2000, height: 900, deviceScaleFactor: 1, isMobile: false })

      await page.setContent(htmlBody)

      const scrollDimension = await page.evaluate(() => {
        return {
          width: document.scrollingElement.scrollWidth,
          height: document.documentElement.offsetHeight, //避免印空白的第二頁
        }
      })

      const buffer = await page.pdf({
        printBackground: true,
        width: scrollDimension.width,
        height: scrollDimension.height + 5, //避免印空白的第二頁
      })
      await browser.close()
      return buffer
    } catch (error) {
      return error
    }
  }
  printPDF().then((pdf) => {
    res.send(pdf)
  })
})

module.exports = router
