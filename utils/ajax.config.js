
// 数据请求配置
const Ajax = (method, url, data, success, fail, type) => {
	wx.request({
		url: ApiList.domain + url,
		timeout:10000,
		header: {
			'content-type': type || 'application/x-www-form-urlencoded',
			'token': wx.getStorageSync('token')
		},
		method: method,
		data: data,
		success(res) {
			wx.hideLoading()
			if (res.statusCode != 200) {
				console.log('请求数据',data)
				console.log('返回',res)
				wx.showToast({
					title: '数据请求异常,请稍后再试',
					duration: 1500,
					icon: 'none'
				})
			} else {
				if (!res.data.success){
					console.log('请求数据',data)
					console.log('返回',res)
					fail(res.data)
				}else{
					success(res.data)
				}
			}
		},
		fail(res) {
			fail(res)
			// wx.showModal({
			// 	title: '提示',
			// 	showCancel: false,
			// 	content: '网络异常，请检查网络',
			// 	success: function () {
			// 		wx.reLaunch({
			// 		  	url: '../pages/Home/Home',
			// 		})
			// 	}
			// })
		},
	})
}

module.exports = {
	Ajax
}