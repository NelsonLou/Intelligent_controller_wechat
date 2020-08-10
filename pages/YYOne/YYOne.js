const AppData = getApp().globalData;
const DeviceFunction = require('../../utils/BLE/deviceFuntion');

Page({
	data: {
		power: false, // 控制开关
		bodyHeight: 0, // 屏幕高度
		temperature: 0, // 当前温度
		timing: 0, // 定时器
		act: '', // 当前读取值
		deviceId: '',
	},

	onLoad: function (options) {
		this.setData({
			bodyHeight: AppData.windowHeight - AppData.menuButtonTop - AppData.menuBtnHeight - 12,
			deviceId: AppData.connectingDeviceId,
		})
	},

	onShow: function () {
		this.handleGetValue();
	},

	handleGetValue() {
		this.setData({
			temperature: AppData.temperature,
			timing: AppData.timing,
			power: AppData.timing == 0 ? false : true,
		})
	},

	handleTouchEndTime: function (e) {
		let num = e.changedTouches[0].clientX,
			time = 0;
		if (num <= 67) {
			time = 10
		} else if (num > 67 && num <= 126) {
			time = 20
		} else if (num > 126 && num <= 186) {
			time = 30
		} else if (num > 186 && num <= 245) {
			time = 40
		} else if (num > 245 && num <= 306) {
			time = 50
		} else if (num > 306) {
			time = 60
		}
		this.handleSwitchTimer(time)
	},

	// 增加温度
	handleAdd: function () {
		let temperature = this.data.temperature
		if (!this.data.power) {
			wx.showToast({
				title: '设备未开机',
				icon: 'none',
			})
		} else if (temperature < 50) {
			wx.showLoading({
				title: '设置中'
			})
			this.handleSetTemp(temperature + 5)
		}
	},

	// 减少温度
	handleSub: function () {
		let temperature = this.data.temperature
		if (!this.data.power) {
			wx.showToast({
				title: '设备未开机',
				icon: 'none',
			})
		} else if (temperature > 30) {
			wx.showLoading({
				title: '设置中'
			})
			this.handleSetTemp(temperature - 5)
		}
	},

	// 切换定时
	handleSwitchTimer: function (time) {
		if (!this.data.power) {
			this.setData({
				timing: this.data.timing,
			})
			wx.showToast({
				title: '设备未开机',
				icon: 'none',
			})
		} else {
			wx.showLoading({
				title: '设置中'
			})
			this.handleSetTiming(time);
		}
	},

	// 前往说明页面
	goInroduce: function () {
		wx.navigateTo({
			url: '../Introduce/Introduce',
		})
	},

	// ————————————————————设备交互————————————————————

	// 开/关 机初始化
	handleSwichPower: function (act) {
		wx.showLoading({
			title: '控制中',
		})
		let that = this;
		if (this.data.power) {
			console.log('控制关机');
			DeviceFunction.handleTimer(AppData.connectingDeviceId, 0).then(() => {
				that.setData({
					temperature: 0,
					timing: 0,
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
			console.log('控制开机');
			DeviceFunction.handleTimer(AppData.connectingDeviceId, 30).then(() => {
				DeviceFunction.handleTemperature(AppData.connectingDeviceId, 60).then(() => {
					that.setData({
						timing: 30,
						power: true,
						temperature: 40,
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
		}
	},

	// 设置温度
	handleSetTemp: function (temp) {
		let deviceId = this.data.deviceId,
			that = this,
			value = temp == 30 ? 30 : temp == 35 ? 40 : temp == 40 ? 60 : temp == 45 ? 80 : 100
		DeviceFunction.handleTemperature(deviceId, value).then(res => {
			wx.hideLoading({
				success: (res) => {
					that.setData({
						temperature: temp
					}, () => {
						wx.showToast({
							title: '设置完成',
						})
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
	},

	// 设置定时
	handleSetTiming: function (timing) {
		let that = this,
			deviceId = this.data.deviceId;
		DeviceFunction.handleTimer(deviceId, timing).then(res => {
			wx.hideLoading({
				success: (res) => {
					that.setData({
						timing: timing,
					}, () => {
						wx.showToast({
							title: '设置完成',
						})
					})
				},
			})
		}).catch(err => {
			console.log('异常', err)
			wx.hideLoading({
				success: (res) => {
					that.setData({
						timing: that.data.timing,
					}, () => {
						wx.showToast({
							title: '设置失败',
							icon: 'none',
						})
					})
				},
			})
		});
	},
})