const AppData = getApp().globalData;
const DeviceFunction = require('../../utils/BLE/deviceFuntion');

Page({
	data: {
		bodyHeight: 0,
		temperature: 0,
		firstLoadTemp: true,
		firstLoadTime: true,
		firstLoadDegree: true,
		timing: 0,
		power: false,
		degree: 0,
		model: 0
	},

	onLoad: function (options) {
		this.setData({
			bodyHeight: AppData.windowHeight - AppData.menuButtonTop - AppData.menuBtnHeight - 12,
			deviceId: AppData.connectingDeviceId,
		})
	},

	onShow: function () {
		this.handleGetValue()
	},

	// ——————————————拖拽——————————————
	handleTouchEndDegree: function (e) {
		let num = e.changedTouches[0].clientY,
			degree = 0;
		if (num <= 259) {
			degree = 3
		} else if (num > 259 && num <= 327) {
			degree = 2
		} else {
			degree = 1
		}
		// 224 295 359
		this.handleDegree(degree)
	},

	// 温度
	handleTouchEndTemp: function (e) {
		let num = null,
			temp = 0;
		// 38 96 157 217 277 337
		num = e.changedTouches[0].clientX;
		if (num <= 67) {
			temp = 40
		} else if (num <= 127 && num > 67) {
			temp = 45
		} else if (num <= 187 && num > 127) {
			temp = 50
		} else if (num <= 247 && num > 187) {
			temp = 55
		} else if (num <= 307 && num > 247) {
			temp = 60
		} else if (num > 307) {
			temp = 65
		}
		this.handleSetTemp(temp)
	},

	// 定时
	handleTouchEndTime: function (e) {
		let num = e.changedTouches[0].clientX,
			time = 0;
		if (num <= 67) {
			time = 10
		} else if (num <= 127 && num > 67) {
			time = 20
		} else if (num <= 187 && num > 127) {
			time = 30
		} else if (num <= 247 && num > 187) {
			time = 40
		} else if (num <= 307 && num > 247) {
			time = 50
		} else if (num > 307) {
			time = 60
		}
		// 38 96 157 217 277 337
		this.handleSwitchTimer(time)
	},

	// ——————————————数据控制——————————————
	handleGetValue() {
		this.setData({
			temperature: AppData.temperature,
			timing: AppData.timing,
			degree: AppData.massageDegree,
			model: AppData.massageModel,
			power: AppData.timing == 0 ? false : true
		})
	},

	goInroduce: function () {
		wx.navigateTo({
			url: '../Introduce/Introduce',
		})
	},

	// ——————————设备交互————————————

	// 切换模式
	handleModel: function (e) {
		if (this.data.power) {
			wx.showLoading({
				title: '设置中',
			})
			let model = e.currentTarget.dataset.model;
			if (model == this.data.model) {
				this.handleMassage(0, 0)
			} else {
				let degree = this.data.degree;
				if (degree == 0) {
					degree = 1
				}
				this.handleMassage(model, degree)
			}
		} else {
			wx.showToast({
				title: '设备未开机',
				icon: 'none',
			})
		}
	},

	// 设置力度
	handleDegree: function (degree) {
		if (this.data.power) {
			wx.showLoading({
				title: '设置中',
			})
			if (this.data.model == 0) {
				this.setData({
					degree: this.data.degree
				}, () => {
					wx.showToast({
						title: '按摩未开启',
						icon: 'none'
					})
				})
			} else {
				this.handleMassage(this.data.model, degree)
			}
		} else {
			this.setData({
				degree: this.data.degree
			}, () => {
				wx.showToast({
					title: '设备未开机',
					icon: 'none'
				})
			})
		}
	},

	// 设置模式
	handleMassage: function (model, degree) {
		let that = this
		DeviceFunction.handleMassage(that.data.deviceId, model, degree).then(res => {
			that.setData({
				degree: degree,
				model: model
			}, () => {
				wx.hideLoading({
					success: (res) => {
						wx.showToast({
							title: '设置成功',
						})
					},
				})
			})
		})
	},

	// 设置温度
	handleSetTemp: function (temp) {
		if (this.data.power) {
			wx.showLoading({
				title: '设置中',
			})
			let deviceId = this.data.deviceId,
				that = this,
				value = temp == 40 ? 40 : temp == 45 ? 50 : temp == 50 ? 60 : temp == 55 ? 70 : temp == 60 ? 80 : 100;
			DeviceFunction.handleTemperature(deviceId, value).then(res => {
				that.setData({
					temperature: temp
				}, () => {
					wx.hideLoading({
						success: (res) => {
							wx.showToast({
								title: '设置完成',
							})
						},
					})
				})
			})
		} else {
			this.setData({
				temperature: this.data.temperature
			}, () => {
				wx.showToast({
					title: '设备未开机',
					icon: 'none',
				})
			})
		}
	},

	// 设置定时
	handleSwitchTimer: function (time) {
		if (this.data.power) {
			wx.showLoading({
				title: '设置中',
			})
			let deviceId = this.data.deviceId;
			DeviceFunction.handleTimer(deviceId, time).then(res => {
				this.setData({
					timing: time
				}, () => {
					wx.hideLoading({
						success: (res) => {
							wx.showToast({
								title: '设置完成',
							})
						},
					})
				})
			})
		} else {
			this.setData({
				timing: this.data.timing
			}, () => {
				wx.showToast({
					title: '设备未开机',
					icon: 'none',
				})
			})
		}
	},

	// 开/关 机初始化
	handleSwichPower: function (act) {
		wx.showLoading({
			title: '控制中',
		})
		let that = this;
		if (this.data.power) {
			DeviceFunction.handleTimer(AppData.connectingDeviceId, 0).then(() => {
				that.setData({
					temperature: 0,
					timing: 0,
					model: 0,
					degree: 0,
					power: false,
				}, () => {
					wx.hideLoading({
						success: (res) => {
							wx.showToast({
								title: '控制成功',
								mask: false
							})
						},
					})
				})
			})
		} else {
			DeviceFunction.handleTimer(AppData.connectingDeviceId, 30).then(() => {
				DeviceFunction.handleTemperature(AppData.connectingDeviceId, 60).then(() => {
					DeviceFunction.handleMassage(that.data.deviceId, 1, 1).then(res => {
						that.setData({
							timing: 30,
							power: true,
							temperature: 50,
							model: 1,
							degree: 1
						}, () => {
							wx.hideLoading({
								success: (res) => {
									wx.showToast({
										title: '控制成功',
										mask: false
									})
								},
							})
						})
					})
				})
			})
		}
	},
})