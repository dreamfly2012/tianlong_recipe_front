const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const request = (options) => {
  return new Promise((resolve, reject) => {
    const { data, method } = options
    if(data && method !== 'get') {
      options.data = JSON.stringify(data)
    }
    wx.request({
      header: { 'Content-Type': 'application/json' },
      ...options,
      success: function(res) {
        resolve(res.data)
      },
      fail: function(res) {
        reject(res.data)
      }
    })
  })
}


module.exports = {
  formatTime: formatTime,
  request:request
}
