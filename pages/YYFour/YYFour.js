const AppData = getApp().globalData;
const DeviceFunction = require('../../utils/BLE/deviceFuntion');

Page({
	data: {
		bodyHeight: 0,
		temperature: 0,
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

	// 页面隐藏时关闭定时器以及设备搜索
	onHide: function () {
	},

	// 页面隐藏时关闭定时器以及设备搜索
	onUnload: function () {
	},

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
	handleDegree: function (e) {
		if (this.data.power) {
			wx.showLoading({
				title: '设置中',
			})
			let degree = e.currentTarget.dataset.degree;
			if (this.data.model == 0) {
				wx.showToast({
					title: '按摩未开启',
					icon: 'none'
				})
			} else {
				this.handleMassage(this.data.model, degree)
			}
		} else {
			wx.showToast({
				title: '设备未开机',
				icon: 'none',
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
	handleSetTemp: function (e) {
		if (this.data.power) {
			wx.showLoading({
				title: '设置中',
			})
			let deviceId = this.data.deviceId,
				that = this,
				temp = e.currentTarget.dataset.temp,
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
				time = e.currentTarget.dataset.time;
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
			})
		} else {
			wx.showToast({
				title: '设备未开机',
				icon: 'none',
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