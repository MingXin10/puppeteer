savePDF = async () => {
  let component = this
  const response = await this.getPDF()
  if (response.ok) {
    const arrayBuffer = await response.arrayBuffer()
    const blob = new Blob([new Uint8Array(arrayBuffer).buffer], { type: 'application/pdf' })
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.click()
  }
}

getPDF = async () => {
  //防止產出PDF等待時間過長，中止fetch
  const controller = new AbortController()
  setTimeout(() => {
    controller.abort()
  }, 60000)
  try {
    const mainTnq = sessionStorage.getItem('mainTnq')
    const user = sessionStorage.getItem('user')
    const { ranges, hotKeyId, opLeaderId, drawerId } = this.state
    const startDate = moment(ranges.startDate).format('YYYYMMDD')
    const endDate = moment(ranges.endDate).format('YYYYMMDD')
    const pathname = this.props.location.pathname
    const response = await fetch('http://localhost:3005/puppeteer', {
      responseType: 'arraybuffer',
      headers: {
        Authorization: `Bearer ${this.state.token}`,
        'Content-Type': 'application/json',
        // Accept: 'application/pdf',
      },
      method: 'post',
      body: JSON.stringify({
        startDate,
        endDate,
        pathname,
        hotKeyId,
        opLeaderId,
        mainTnq,
        user,
        drawerId,
      }),
      signal: controller.signal,
    })
    return response
  } catch (err) {
    this.msgController('warning', '伺服器忙碌中，請稍後下載')
    return err
  }
}
