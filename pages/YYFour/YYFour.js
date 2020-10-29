const AppData = getApp().globalData;
const DeviceFunction = require('../../utils/BLE/deviceFuntion');

Page({
	data: {
		scrollArrDegree: {
			'1': 0,
			'2': 63,
			'3': 125
		},
		scrollArrTemp: {
			'40': 310,
			'45': 240,
			'50': 180,
			'55': 120,
			'60': 60,
			'65': 0
		},
		scrollArrTiming: {
			'10': 310,
			'20': 240,
			'30': 180,
			'40': 120,
			'50': 60,
			'60': 0
		},
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
		let objD = Object.assign({}, this.data.scrollArrDegree),
			objTe = Object.assign({}, this.data.scrollArrTemp),
			objTi = Object.assign({}, this.data.scrollArrTiming)
		for (let i in objD) {
			objD[i] = objD[i] / AppData.widthProp;
		}
		for (let i in objTe) {
			objTe[i] = objTe[i] / AppData.widthProp;
		}
		for (let i in objTi) {
			objTi[i] = objTi[i] / AppData.widthProp;
		}
		this.setData({
			bodyHeight: AppData.windowHeight - AppData.menuButtonTop - AppData.menuBtnHeight - 12,
			deviceId: AppData.connectingDeviceId,
			scrollArrDegree: objD,
			scrollArrTemp: objTe,
			scrollArrTiming: objTi,
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
		let value = this.data.degree;
		if (!this.data.power) {
			this.setData({
				degree: 0
			}, () => {
				this.setData({
					degree: value
				})
				wx.showToast({
					title: '设备未开机',
					icon: 'none'
				})
			})
		} else if (degree == this.data.degree) {
			this.setData({
				degree: 0
			}, () => {
				this.setData({
					degree: value
				})
			})
		} else {
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
				wx.hideLoading()
				wx.showToast({
					title: '设置成功',
				})
			})
		})
	},

	// 设置温度
	handleSetTemp: function (temp) {
		let value = this.data.temperature;
		if (!this.data.power) {
			this.setData({
				temperature: 0
			}, () => {
				this.setData({
					temperature: value
				})
				wx.showToast({
					title: '设备未开机',
					icon: 'none',
				})
			})
		} else if (temp == this.data.temperature) {
			this.setData({
				temperature: 0
			}, () => {
				this.setData({
					temperature: value
				})
			})
		} else {
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
					wx.hideLoading()
					wx.showToast({
						title: '设置完成',
					})
				})
			})
		}
	},

	// 设置定时
	handleSwitchTimer: function (time) {
		let value = this.data.timing;
		if (!this.data.power) {
			this.setData({
				timing: 0
			}, () => {
				this.setData({
					timing: value
				})
				wx.showToast({
					title: '设备未开机',
					icon: 'none',
				})
			})
		} else if (time == this.data.timing) {
			this.setData({
				timing: 0
			}, () => {
				this.setData({
					timing: value
				})
			})
		} else {
			wx.showLoading({
				title: '设置中',
			})
			let deviceId = this.data.deviceId;
			DeviceFunction.handleTimer(deviceId, time).then(res => {
				this.setData({
					timing: time
				}, () => {
					wx.hideLoading()
					wx.showToast({
						title: '设置完成',
					})
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
					wx.hideLoading()
					wx.showToast({
						title: '控制成功',
						mask: false
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
							wx.hideLoading()
							wx.showToast({
								title: '控制成功',
								mask: false
							})
						})
					})
				})
			})
		}
	},
})