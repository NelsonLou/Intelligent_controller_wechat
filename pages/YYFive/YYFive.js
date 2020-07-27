const AppData = getApp().globalData;
const DeviceFunction = require('../../utils/BLE/deviceFuntion')

Page({
	data: {
		bodyHeight: 0,
		temperature: 55, // 温度
		degree: 1, // 按摩力度
		effortsDegree: 1,
		timing: 30, // 定时
		model: 1, // 模式
		power: false,
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
			effortsDegree: AppData.ventilation,
			model: AppData.massageModel,
			degree: AppData.massageDegree,
			power: AppData.timing == 0 ? false : true
		})
	},

	// 前往功能介绍页面
	goInroduce: function () {
		wx.navigateTo({
			url: '../Introduce/Introduce',
		})
	},
	// ——————————设备交互——————————

	// 控制温度
	handleTemp: function (e) {
		if (this.data.power) {
			let temp = Number(this.data.temperature),
				flag = Number(e.currentTarget.dataset.flag),
				that = this;
			if ((temp > 40 && flag != 1) || (temp < 65 && flag == 1)) {
				wx.showLoading({
					title: '控制中',
				})
				temp = flag == 1 ? (temp + 5) : (temp - 5)
				let value = temp == 40 ? 40 : temp == 45 ? 50 : temp == 50 ? 60 : temp == 55 ? 70 : temp == 60 ? 80 : 100;
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

	// 控制按摩力度
	handleDegree: function (e) {
		if (this.data.power) {
			let degree = Number(e.currentTarget.dataset.flag);
			if(this.data.model == 0){
				wx.showToast({
					title: '按摩未开启',
					icon: 'none'
				})
			}else{
				this.handleMassage(this.data.model, degree)
			}
		} else {
			wx.showToast({
				title: '设备未开启',
				icon: 'none'
			})
		}
	},

	// 控制模式
	handleModel: function (e) {
		if (this.data.power) {
			let model = Number(e.currentTarget.dataset.flag);
			if (model == this.data.model) {
				this.handleMassage(0, 0)
			} else {
				let degree = this.data.degree;
				if(degree == 0){
					degree = 1
				}
				this.handleMassage(model, degree)
			}
		} else {
			wx.showToast({
				title: '设备未开启',
				icon: 'none'
			})
		}
	},

	// 按摩
	handleMassage: function (model, degree) {
		wx.showLoading({
			title: '控制中',
		})
		let that = this;
		DeviceFunction.handleMassage(AppData.connectingDeviceId, model, degree).then(() => {
			that.setData({
				degree: degree,
				model: model
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

	// 通风
	handleEfforts: function (e) {
		if (this.data.power) {
			let degree = Number(e.currentTarget.dataset.flag),
				that = this;
			if (degree == this.data.effortsDegree) {
				degree = 0
			}
			wx.showLoading({
				title: '控制中',
			})
			DeviceFunction.handleVentilation(AppData.connectingDeviceId, degree).then(() => {
				that.setData({
					effortsDegree: degree,
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

	// 定时
	handleTiming: function (e) {
		if (this.data.power) {
			let that = this,
				timing = Number(e.currentTarget.dataset.time);
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
			wx.showToast({
				title: '设备未开启',
				icon: 'none'
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
					effortsDegree: 0,
					model: 0,
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
						DeviceFunction.handleVentilation(AppData.connectingDeviceId, 1).then(() => {
							that.setData({
								timing: 30,
								power: true,
								degree: 1,
								effortsDegree: 1,
								model: 1,
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