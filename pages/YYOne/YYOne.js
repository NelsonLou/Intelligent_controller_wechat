const AppData = getApp().globalData;
const DeviceFunction = require('../../utils/BLE/deviceFuntion');
const Utils = require('../../utils/util');
import BleTools from '../../utils/bleTools.js';

Page({
	data: {
		power: false, // 控制开关
		bodyHeight: 0, // 屏幕高度
		temperature: 30, // 当前温度
		timing: 10, // 定时器
		act: '', // 当前读取值
		deviceId: '',
		lastReadValue: [], // 最近一次监听的设备服务以及特征值
	},

	onLoad: function (options) {
		this.setData({
			bodyHeight: AppData.windowHeight - AppData.menuButtonTop - AppData.menuBtnHeight - 12,
			deviceId: AppData.connectingDeviceId,
		})
	},

	onShow: function () {
		this.handleWatchValue()
	},

	// 页面隐藏时关闭定时器以及设备搜索
	onHide: function () {
	},

	// 页面隐藏时关闭定时器以及设备搜索
	onUnload: function () {
	},

	// 增加温度
	handleAdd: function () {
		let temperature = this.data.temperature
		if (temperature < 50) {
			this.setData({
				temperature: temperature + 5
			})
		}
	},

	// 减少温度
	handleSub: function () {
		let temperature = this.data.temperature
		if (temperature > 30) {
			this.setData({
				temperature: temperature - 5
			})
		}
	},

	// 切换定时
	handleSwitchTimer: function (e) {
		if (this.data.timing != e.currentTarget.dataset.time) {
			this.setData({
				timing: e.currentTarget.dataset.time
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
			BleTools.handleUnNotify(that.data.deviceId, that.data.lastReadValue[0], that.data.lastReadValue[1])
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
			value = act ? 30 : 0;
		console.log('写入定时器30');
		DeviceFunction.handleTimer(deviceId, value).then(() => { // 写入30分钟定时
			console.log('写入温控30');
			DeviceFunction.handleTemperature(deviceId, value); // 写入温度控制为30度
		}).then(() => {
			if (act) {
				that.handleReadTimer();
			}
		})
	},

	// 读取当前定时
	handleReadTimer: function () {
		let that = this,
			deviceId = this.data.deviceId;
		console.log('读取定时器');
		BleTools.getCharacteristicsValue(deviceId, 'AE00', 'AE02').then(resService => {
			that.setData({
				act: 'timer',
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
				act: 'temp',
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
			case 'timer':
				console.log('定时', value)
				this.handleReadTamp()
				break;
			case 'temp':
				console.log('温度', value)
				break;
			default:
				break;
		}
	}

})