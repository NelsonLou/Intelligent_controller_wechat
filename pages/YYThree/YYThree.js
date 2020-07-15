const AppData = getApp().globalData;
const DeviceFunction = require('../../utils/BLE/deviceFuntion');
const Utils = require('../../utils/util');
import BleTools from '../../utils/bleTools.js';
Page({
	data: {
		bodyHeight: 0,
		temperature: 0,
		timing: 0,
		power: false,
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
	// 增加温度
	handleAdd: function () {
		let temperature = this.data.temperature
		if (!this.data.power) {
			wx.showToast({
				title: '设备未开机',
				icon: 'none',
			})
		} else if (temperature < 65) {
			wx.showLoading({
				title: '设置中'
			})
			this.setData({
				temperature: temperature + 5
			}, () => {
				this.handleSetTemp(temperature + 5)
			})
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
		} else if (temperature > 40) {
			wx.showLoading({
				title: '设置中'
			})
			this.setData({
				temperature: temperature - 5
			}, () => {
				this.handleSetTemp(temperature - 5)
			})
		}
	},

	// 切换定时
	handleSwitchTimer: function (e) {
		if (!this.data.power) {
			wx.showToast({
				title: '设备未开机',
				icon: 'none',
			})
		} else if (this.data.timing != e.currentTarget.dataset.time) {
			wx.showLoading({
				title: '设置中'
			})
			this.setData({
				timing: e.currentTarget.dataset.time
			}, () => {
				this.handleSetTiming(Number(e.currentTarget.dataset.time))
			})
		}
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

	// 前往说明页面
	goInroduce: function () {
		wx.navigateTo({
			url: '../Introduce/Introduce',
		})
	},

	// ————————————————————设备交互————————————————————

	// 读取设备值处理
	// 获取特征值变化值
	handleWatchValue: function () {
		let that = this;
		wx.onBLECharacteristicValueChange(function (res) {
			// BleTools.handleUnNotify(that.data.deviceId, that.data.lastReadValue[0], that.data.lastReadValue[1])
			that.handleDealReadResult(res);
		})
	},

	// 开/关 机初始化
	handleInit: function (act) {
		wx.showLoading({
			title: '设备初始化中',
		})
		let that = this,
			deviceId = this.data.deviceId,
			timing = act ? 30 : 0,
			temp = act ? 50 : 0;
		DeviceFunction.handleTimer(deviceId, timing).then(() => { // 写入30分钟定时
			DeviceFunction.handleTemperature(deviceId, temp); // 写入温度控制为30度
		}).then(() => {
			that.setData({
				temperature: temp,
				timing: timing
			}, () => {
				wx.hideLoading({
					success: (res) => {
						wx.showToast({
							title: (act ? '开启' : '关机') + '完成',
						})
					},
				})
			})
			// if (act) {
			// 	that.handleReadTimer();
			// }
		}).catch(err => {
			console.log(err)
		})
	},

	// 设置温度
	handleSetTemp: function (temp) {
		let deviceId = this.data.deviceId;
		DeviceFunction.handleTemperature(deviceId, temp).then(res => {
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
	},

	// 设置定时
	handleSetTiming: function (timing) {
		let deviceId = this.data.deviceId;
		DeviceFunction.handleTimer(deviceId, timing).then(res => {
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
	},

	// 读取当前定时
	handleReadTimer: function () {
		let that = this,
			deviceId = this.data.deviceId;
		console.log('读取定时器');
		BleTools.getCharacteristicsValue(deviceId, 'AE00', 'AE02').then(resService => {
			that.setData({
				act: 'iniTtimer',
				lastReadValue: [resService.serviceId, resService.characteristicId]
			}, () => {
				BleTools.handleRead(deviceId, resService.serviceId, resService.characteristicId);
			})
		}).catch(err => {
			console.log('读取异常', err)
		});
	},

	// 读取当前温度
	handleReadTamp: function () {
		let that = this,
			deviceId = this.data.deviceId;
		console.log('读取温度');
		BleTools.getCharacteristicsValue(deviceId, 'AE00', 'AE01').then(resService => {
			that.setData({
				act: 'initTemp',
				lastReadValue: [resService.serviceId, resService.characteristicId]
			}, () => {
				BleTools.handleRead(deviceId, resService.serviceId, resService.characteristicId);
			})
		}).catch(err => {
			console.log('读取异常', err)
		})
	},

	// 处理读取到的值
	handleDealReadResult: function (data) {
		let act = this.data.act,
			value = Utils.ab2hex(data.value);
		switch (act) {
			case 'iniTtimer':
				console.log('定时', value)
				this.handleReadTamp()
				break;
			case 'initTemp':
				console.log('温度', value)
				break;
			default:
				break;
		}
	}
})