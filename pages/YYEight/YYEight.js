const AppData = getApp().globalData;
const DeviceFunction = require('../../utils/BLE/deviceFuntion');

Page({
	data: {
		timeScrollNum: 0,
		tempScrollNum: 0,
		degreeScrollNum: 0,
		bodyHeight: 0,
		temperature: 50,
		timing: 0,
		power: false,
		degree: 1,
		gas: 1,
		model: 1
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
	// 拖拽
	handleScrollTemp: function (e) {
		this.data.tempScrollNum = e.detail.scrollLeft
	},

	handleTouchEndTemp: function () {
		let num = this.data.tempScrollNum,
			temp = 0;
		console.log(num)
		if (num >= 263) {
			temp = 10;
		} else if (num < 263 && num >= 189) {
			temp = 20;
		} else if (num < 189 && num >= 103) {
			temp = 30;
		} else if (num < 103 && num >= 27) {
			temp = 40;
		} else if (num < 27) {
			temp = 50;
		}
		this.handleSetTemp(temp);
	},

	handleScrollTime: function (e) {
		this.data.timeScrollNum = e.detail.scrollLeft
	},

	handleTouchEndTime: function () {
		let num = this.data.timeScrollNum,
			time = 0;
		console.log(num)
		if (num >= 270) {
			time = 10;
		} else if (num < 270 && num >= 210) {
			time = 20;
		} else if (num < 210 && num >= 150) {
			time = 30;
		} else if (num < 150 && num >= 90) {
			time = 40;
		} else if (num < 90 && num >= 30) {
			time = 50;
		} else if (num < 30) {
			time = 60;
		}
		this.handleSwitchTimer(time)
	},

	handleScrollDegree: function (e) {
		this.data.degreeScrollNum = e.detail.scrollLeft
	},

	handleTouchEndDegree: function () {
		let num = this.data.degreeScrollNum,
			degree = 0;
		if (num >= 99) {
			degree = 1;
		} else if (num < 99 && num >= 34) {
			degree = 2
		} else if (num < 34) {
			degree = 3;
		}
		this.handleDegree(degree)
	},

	handleGetValue: function () {
		this.setData({
			temperature: AppData.temperature,
			timing: AppData.timing,
			model: AppData.massageModel,
			degree: AppData.massageDegree,
			gas: AppData.gas,
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
			if (e.currentTarget.dataset.flag == this.data.model) {
				this.handleMassage(0, 0)
			} else {
				let degree = this.data.degree;
				if (degree == 0) {
					degree = 1
				}
				this.handleMassage(e.currentTarget.dataset.flag, degree)
			}
		} else {
			wx.showToast({
				title: '设备未开机',
				icon: 'none'
			})
		}
	},

	// 设置力度
	handleDegree: function (degree) {
		if (this.data.power) {
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
		wx.showLoading({
			title: '控制中',
		})
		DeviceFunction.handleMassage(that.data.deviceId, model, degree).then(res => {
			that.setData({
				model: model,
				degree: degree,
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
	},

	// 充放气
	handleGas: function (e) {
		if (this.data.power) {
			let that = this,
				value = Number(e.currentTarget.dataset.flag);
			wx.showLoading({
				title: '控制中',
			})
			if (value == this.data.gas) {
				value = 0
			}
			DeviceFunction.handleGas(AppData.connectingDeviceId, value).then(res => {
				that.setData({
					gas: value,
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
			wx.showToast({
				title: '设备未开启',
				icon: 'none'
			})
		}
	},

	// 设置温度
	handleSetTemp: function (temp) {
		if (this.data.power) {
			let that = this;
			wx.showLoading({
				title: '控制中',
			})
			let value = temp == 40 ? 40 : temp == 45 ? 50 : temp == 50 ? 60 : temp == 55 ? 80 : 100;
			DeviceFunction.handleTemperature(AppData.connectingDeviceId, value).then(() => {
				that.setData({
					temperature: temp
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
			this.setData({
				temperature: this.data.temperature
			}, () => {
				wx.showToast({
					title: '设备未开启',
					icon: 'none'
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

	handleSwichPower: function (e) {
		wx.showLoading({
			title: '控制中',
		})
		let that = this;
		if (this.data.power) {
			DeviceFunction.handleTimer(AppData.connectingDeviceId, 0).then(() => {
				that.setData({
					timing: 0,
					power: false,
					degree: 0,
					model: 0,
					gas: 0,
					temperature: 0,
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
					DeviceFunction.handleMassage(AppData.connectingDeviceId, 1, 1).then(() => {
						DeviceFunction.handleGas(AppData.connectingDeviceId, 1).then(() => {
							that.setData({
								timing: 30,
								power: true,
								degree: 1,
								model: 1,
								gas: 1,
								temperature: 50,
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
			})
		}
	}
})