const AppData = getApp().globalData;
const DeviceFunction = require('../../utils/BLE/deviceFuntion')

Page({
	data: {
		kneadScrollNum: 0,
		bodyHeight: 0,
		temperature: 0,
		timing: 0,
		degree: 0,
		power: false,
		kneadModel: 0,
		kneadDegree: 0,
	},

	onLoad: function (options) {
		this.setData({
			bodyHeight: AppData.windowHeight - AppData.menuButtonTop - AppData.menuBtnHeight - 12,
		})
	},

	onShow: function () {
		this.handleGetValue()
	},

	handleGetValue() {
		this.setData({
			temperature: AppData.temperature,
			timing: AppData.timing,
			kneadModel: AppData.kneadDirection,
			kneadDegree: AppData.kneadDegree,
			power: AppData.timing == 0 ? false : true
		})
	},

	// 拖拽控件

	handleScrollTime: function (e) {
		this.data.timeScrollNum = e.detail.scrollLeft;
	},

	handleTouchEndTime: function (e) {
		let num = this.data.timeScrollNum,
			time = 0;
		if (num > 259) {
			time = 10
		} else if (num <= 259 && num > 203) {
			time = 20
		} else if (num <= 203 && num > 144) {
			time = 30
		} else if (num <= 144 && num > 83) {
			time = 40
		} else if (num <= 83 && num > 27) {
			time = 50
		} else if (num <= 27) {
			time = 60
		}
		this.handleSwitchTimer(time)
	},

	handleScrollKnead: function (e) {
		this.data.kneadScrollNum = e.detail.scrollLeft
	},

	handleTouchEndKnead: function () {
		let num = this.data.degreeScrollNum,
			degree = 0;
		if (num <= 35) {
			degree = 3
		} else if (num > 35 && num <= 103) {
			degree = 2
		} else if (num > 103) {
			degree = 1
		}
		this.handleKneadDegree(degree)
	},

	// 控制温度
	handleTemp: function (e) {
		if (this.data.power) {
			let temp = Number(this.data.temperature),
				flag = Number(e.currentTarget.dataset.flag),
				that = this;
			if ((temp > 40 && flag != 1) || (temp < 60 && flag == 1)) {
				wx.showLoading({
					title: '控制中',
				})
				temp = flag == 1 ? (temp + 5) : (temp - 5)
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
			}
		} else {
			wx.showToast({
				title: '设备未开启',
				icon: 'none'
			})
		}
	},

	// 揉捏方向
	handleKneadModel: function () {
		let value = this.data.kneadModel == 1 ? 2 : this.data.kneadModel == 2 ? 3 : this.data.kneadModel == 3 ? 0 : 1;
		console.log()
		if (value == 0) {
			this.handleKnead(0, 0)
		} else {
			let degree = this.data.kneadDegree;
			if (degree == 0) {
				degree = 1
			}
			this.handleKnead(value, degree)
		}
	},

	// 揉捏力度
	handleKneadDegree: function (degree) {
		if (this.data.kneadModel == 0) {
			this.setData({
				handleKnead: this.data.handleKnead
			}, () => {
				wx.showToast({
					title: '揉捏未开启',
					icon: 'none'
				})
			})
		} else {
			this.handleKnead(this.data.kneadModel, degree)
		}
	},

	// 揉捏
	handleKnead: function (kneadModel, kneadDegree) {
		if (this.data.power) {
			let that = this;
			wx.showLoading({
				title: '控制中',
			})
			DeviceFunction.handleKnead(AppData.connectingDeviceId, kneadModel, kneadDegree).then(() => {
				that.setData({
					kneadModel: kneadModel,
					kneadDegree: kneadDegree
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
				kneadDegree: this.data.kneadDegree
			}, () => {
				wx.showToast({
					title: '设备未开启',
					icon: 'none'
				})
			})
		}
	},

	// 定时
	handleSwitchTimer: function (timing) {
		if (this.data.power) {
			let that = this;
			wx.showLoading({
				title: '控制中',
			})
			DeviceFunction.handleTimer(AppData.connectingDeviceId, timing).then(res => {
				that.setData({
					timing: timing,
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
				timing: this.data.timing
			}, () => {
				wx.showToast({
					title: '设备未开启',
					icon: 'none'
				})
			})
		}
	},

	// 开关机
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
					kneadModel: 0,
					kneadDegree: 0,
					temperature: 0,
				}, () => {
					wx.hideLoading({
						success: (res) => {
							wx.showToast({
								title: '控制成功',
								icon: 'none'
							})
						},
					})
				})
			})
		} else {
			DeviceFunction.handleTimer(AppData.connectingDeviceId, 30).then(() => {
				DeviceFunction.handleTemperature(AppData.connectingDeviceId, 60).then(() => {
					DeviceFunction.handleKnead(AppData.connectingDeviceId, 3, 1).then(() => {
						that.setData({
							timing: 30,
							power: true,
							kneadModel: 3,
							kneadDegree: 1,
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
		}
	},

	// 前往介绍
	goInroduce: function () {
		wx.navigateTo({
			url: '../Introduce/Introduce',
		})
	}
})