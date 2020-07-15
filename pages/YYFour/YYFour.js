const AppData = getApp().globalData;
const DeviceFunction = require('../../utils/BLE/deviceFuntion');

Page({
	data: {
		bodyHeight: 0,
		temperature: 0,
		timing: 0,
		power: false,
		degree: 1,
		model: 0
	},

	onLoad: function (options) {
		this.setData({
			bodyHeight: AppData.windowHeight - AppData.menuButtonTop - AppData.menuBtnHeight - 12,
			deviceId: AppData.connectingDeviceId,
		})
	},

	onShow: function () {
	},

	// 页面隐藏时关闭定时器以及设备搜索
	onHide: function () {
	},

	// 页面隐藏时关闭定时器以及设备搜索
	onUnload: function () {
	},

	goInroduce: function () {
		wx.navigateTo({
			url: '../Introduce/Introduce',
		})
	},

	// 开关机
	handleSwichPower: function () {
		let flag = this.data.power;
		this.setData({
			power: !flag
		}, () => {
			this.handleInit(!flag);
		});
	},

	// ——————————设备交互————————————

	// 切换模式
	handleModel: function (e) {
		if (this.data.power) {
			wx.showLoading({
				title: '设置中',
			})
			let model = e.currentTarget.dataset.model
			this.setData({
				model: model
			}, () => {
				this.handleMassage()
			})
		} else {
			wx.showToast({
				title: '设备未开机',
				icon: 'none',
			})
		}
	},

	// 设置力度
	handleDegree: function (e) {
		if (this.data.power) {
			wx.showLoading({
				title: '设置中',
			})
			let degree = e.currentTarget.dataset.degree
			this.setData({
				degree: degree
			}, () => {
				this.handleMassage()
			})
		} else {
			wx.showToast({
				title: '设备未开机',
				icon: 'none',
			})
		}
	},

	// 设置模式
	handleMassage: function () {
		let that = this
		DeviceFunction.handleMassage(that.data.deviceId, that.data.model, that.data.degree).then(res => {
			wx.hideLoading({
				success: (res) => {
					wx.showToast({
						title: '设置成功',
					})
				},
			})
		})
	},

	// 设置温度
	handleSetTemp: function (e) {
		if (this.data.power) {
			wx.showLoading({
				title: '设置中',
			})
			let that = this,
				temp = e.currentTarget.dataset.temp
			this.setData({
				temperature: temp
			}, () => {
				DeviceFunction.handleTemperature(that.data.deviceId, temp).then(res => {
					wx.hideLoading({
						success: (res) => {
							wx.showToast({
								title: '设置完成',
							})
						},
					})
				}).catch(err => {
					console.log('异常', err)
					wx.hideLoading({
						success: (res) => {
							wx.showToast({
								title: '设置失败',
								icon: 'none',
							})
						},
					})
				});
			})
		} else {
			wx.showToast({
				title: '设备未开机',
				icon: 'none',
			})
		}
	},

	// 设置定时
	handleSwitchTimer: function (e) {
		if (this.data.power) {
			wx.showLoading({
				title: '设置中',
			})
			let deviceId = this.data.deviceId,
				time = e.currentTarget.dataset.time
			DeviceFunction.handleTimer(deviceId, time).then(res => {
				this.setData({
					timing: e.currentTarget.dataset.time
				}, () => {
					wx.hideLoading({
						success: (res) => {
							wx.showToast({
								title: '设置完成',
							})
						},
					})
				})
			}).catch(err => {
				console.log('异常', err)
				wx.hideLoading({
					success: (res) => {
						wx.showToast({
							title: '设置失败',
							icon: 'none',
						})
					},
				})
			});
		} else {
			wx.showToast({
				title: '设备未开机',
				icon: 'none',
			})
		}
	},

	// 开/关 机初始化
	handleInit: function (act) {
		wx.showLoading({
			title: '设备初始化中',
		})
		let that = this,
			deviceId = this.data.deviceId,
			timing = act ? 30 : 0,
			temp = act ? 30 : 0,
			degree = 1,
			model = act ? 1 : 0
		DeviceFunction.handleTimer(deviceId, timing).then(() => { // 写入30分钟定时
			DeviceFunction.handleTemperature(deviceId, temp).then(() => {
				that.setData({
					degree: degree,
					model: model,
					temperature: temp,
					timing: timing
				}, () => {
					that.handleMassage()
				})
			}).then(() => {
				wx.hideLoading({
					success: (res) => {
						wx.showToast({
							title: (act ? '开启' : '关机') + '完成',
						})
					},
				})
				// if (act) {
				// 	that.handleReadTimer();
				// }
			}).catch(err => {
				console.log(err)
			})
		})
	},
})