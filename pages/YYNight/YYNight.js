const AppData = getApp().globalData;
const DeviceFunction = require('../../utils/BLE/deviceFuntion')
import BleReconnect from '../../utils/BLE/bleReconnect'

Page({
	data: {
		scrollArrTiming: {
			'10': 298,
			'20': 238,
			'30': 183,
			'40': 118,
			'50': 60,
			'60': 0
		},
		bodyHeight: 0,
		temperature: 0,
		timing: 0,
		gas: 0,
		power: false,
	},

	onLoad: function (options) {
		AppData.rateScreen = false
		let objTi = Object.assign({}, this.data.scrollArrTiming);
		for (let i in objTi) {
			objTi[i] = objTi[i] / AppData.widthProp;
		}
		this.setData({
			// bodyHeight: AppData.windowHeight - AppData.menuButtonTop - AppData.menuBtnHeight - 12,
			bodyHeight: AppData.windowHeight,
			scrollArrTiming: objTi
		})
	},

	onShow: function () {
		let that = this;
		if (!AppData.rateScreen) { // 息屏返回
			this.handleGetValue();
			this.handleDealBleBroke()
		} else {
			GetDeviceInfo.getDeviceInfo(AppData.connectingDeviceId, function (res) {
				if (res) {
					that.handleGetValue();
					that.handleDealBleBroke()
				}
			})
		}
	},


	handleGetValue: function () {
		this.setData({
			temperature: AppData.temperature,
			timing: AppData.timing,
			gas: AppData.gas,
			power: AppData.timing == 0 ? false : true
		}, () => {
			this.handleNotify()
		})
	},

	handleTouchEndTime: function (e) {
		let num = e.changedTouches[0].clientX,
			time = 0;
		// 37 97 157 217 277 337
		if (num > 307) {
			time = 60
		} else if (num <= 307 && num > 247) {
			time = 50
		} else if (num <= 247 && num > 187) {
			time = 40
		} else if (num <= 187 && num > 127) {
			time = 30
		} else if (num <= 127 && num > 67) {
			time = 20
		} else if (num <= 67) {
			time = 10
		}
		this.handleSwitchTimer(time)
	},

	goInroduce: function () {
		wx.navigateTo({
			url: '../Introduce/Introduce',
		})
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
						wx.hideLoading()
						wx.showToast({
							title: '控制成功',
							mask: false
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

	// 定时
	handleSwitchTimer: function (timing) {
		let value = this.data.timing;
		if (!this.data.power) {
			this.setData({
				timing: 0
			}, () => {
				this.setData({
					timing: value
				})
				wx.showToast({
					title: '设备未开启',
					icon: 'none'
				})
			})
		} else if (timing == value) {
			this.setData({
				timing: 0
			}, () => {
				this.setData({
					timing: value
				})
			})
		} else {
			let that = this;
			wx.showLoading({
				title: '控制中',
			})
			DeviceFunction.handleTimer(AppData.connectingDeviceId, timing).then(res => {
				that.setData({
					timing: timing,
				}, () => {
					wx.hideLoading()
					wx.showToast({
						title: '控制成功',
						mask: false
					})
				})
			})
		}
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
					wx.hideLoading()
					wx.showToast({
						title: '控制成功',
						mask: false
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
					gas: 0,
					temperature: 0,
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
					DeviceFunction.handleGas(AppData.connectingDeviceId, 3).then(() => {
						that.setData({
							timing: 30,
							power: true,
							gas: 3,
							temperature: 50,
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

	handleNotify() {
		let that = this;
		wx.onBLECharacteristicValueChange((result) => {
			that.handleDealNotify(result);
		})
		wx.notifyBLECharacteristicValueChange({ // 监听温控
			deviceId: AppData.connectingDeviceId,
			serviceId: AppData.services.temp[0],
			characteristicId: AppData.services.temp[1],
			state: true,
			success: () => {
				wx.notifyBLECharacteristicValueChange({ // 监听充放气
					deviceId: AppData.connectingDeviceId,
					serviceId: AppData.services.gas[0],
					characteristicId: AppData.services.gas[1],
					state: true,
					success: () => {
						wx.notifyBLECharacteristicValueChange({ // 监听充放气
							deviceId: AppData.connectingDeviceId,
							serviceId: AppData.services.power[0],
							characteristicId: AppData.services.power[1],
							state: true,
						})
					},
				})
			},
		})
	},

	handleDealNotify: function (result) {
		let value = Utils.ab2hex(result.value);
		if (result.characteristicId == AppData.services.temp[1]) {
			console.log('收到设备温度变化', value)
		}
		if (result.characteristicId == AppData.services.gas[1]) {
			console.log('充放气', value)
		}
		if (result.characteristicId == AppData.services.power[1]) {
			console.log('收到设备揉捏变化', value)
		}
	},

	// 断开连接处理
	handleDealBleBroke: function () {
		AppData.bleWatchingFun = () => {
			wx.showModal({
				content: '与蓝牙设备连接异常',
				cancelText: '返回首页',
				confirmText: '重新连接',
				success: res => {
					if (res.confirm) {
						BleReconnect.reConnect(AppData.connectingDeviceId, () => {})
					} else {
						wx.reLaunch({
							url: '../index/index',
						})
					}
				}
			})
		};
	},
})