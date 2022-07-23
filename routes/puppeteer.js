const express = require('express')
const router = express.Router()
const puppeteer = require('puppeteer')

//  * 控制頁面自動滾動
async function autoScroll(page, timeInterval) {
  await page.evaluate(async (timeInterval) => {
    await new Promise((resolve) => {
      let totalHeight = 0
      // 每X毫秒讓頁面下滑Y畫素的距離
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight
        const distance = 1500
        window.scrollBy(0, distance)
        totalHeight += distance
        if (totalHeight >= scrollHeight) {
          clearInterval(timer)
          resolve()
        }
      }, timeInterval)
    })
  }, timeInterval)
}

router.post('/', async (req, res) => {
  let { pathname, startDate, endDate, hotKeyId, opLeaderId, mainTnq, user, drawerId } = req.body
  async function printPDF() {
    try {
      const browser = await puppeteer.launch({
        headless: true, //true才能印PDF，false為除錯模式
      })
      const page = await browser.newPage()
      await page.setViewport({ width: 2000, height: 900, deviceScaleFactor: 1, isMobile: false })
      await page.goto(`http://localhost:3000/`)
      await page.evaluate((user) => {
        // 對瀏覽器設定使用者登入info，可避開登入、reCaptcha
        sessionStorage.setItem('user', JSON.stringify(JSON.parse(user)))
      }, user)
      await page.evaluate((mainTnq) => {
        // 對瀏覽器設定使用者登入info，可避開登入、reCaptcha
        sessionStorage.setItem('mainTnq', JSON.stringify(JSON.parse(mainTnq)))
      }, mainTnq)
      await page.goto(`http://localhost:3000${pathname}?min=${startDate}&max=${endDate}`)
      await autoScroll(page, 200) // 將頁面拉到最底，避免圖片lazy loading，或是無法抓取到某些btn id造成無法點擊
      if (drawerId !== '') {
        await Promise.all([page.click(`#${drawerId}`)]) // 開闔hotel-board側邊欄
      }
      if (pathname === '/compare') {
        await Promise.all([page.click(`#${opLeaderId}`)]) // 點擊競爭品牌關鍵領袖
        await Promise.all([page.click(`#${hotKeyId}`)]) // 點擊競爭品牌熱門關鍵字
      }
      await page.waitForTimeout(4000) //等待文字雲渲染
      const scrollDimension = await page.evaluate(() => {
        return {
          width: document.scrollingElement.scrollWidth,
          height: document.documentElement.offsetHeight, //避免印空白的第二頁
        }
      })
      const buffer = await page.pdf({
        printBackground: true,
        width: scrollDimension.width,
        height: scrollDimension.height + 5, //避免印空白的第二頁，視情況調整+X距離
      })
      await browser.close()
      return buffer
    } catch (error) {
      console.log('error', error)
    }
  }

  printPDF().then((pdf) => {
    res.send(pdf)
  })
})

module.exports = router
