const AppData = getApp().globalData;
const Utils = require('../util');
import BleTools from './bleTools';

// 温控
// 初始化长度 1 个字节，可读可写，当前可写最大值 100
const handleTemperature = function (deviceId, temp) {
	return new Promise(function (resolve, reject) {
		console.log('写入温度', temp);
		let value = Utils.hex2ab(Utils.int2hex(temp));
		BleTools.handleWrite(deviceId, AppData.services.temp[0], AppData.services.temp[1], value).then(() => {
			resolve()
		}).catch(err => {
			wx.hideLoading()
			wx.showToast({
				title: '设置失败',
				icon: 'none',
			})
		})
	})
}

// 定时
// 初始化长度 2 个字节，可读可写，定时范围 10-720
const handleTimer = function (deviceId, time) {
	return new Promise(function (resolve, reject) {
		time = Number(time)
		console.log(time);
		let num = time.toString(16);
		if (num.length == 1) {
			num = '000' + num
		} else if (num.length == 2) {
			num = '00' + num
		} else if (num.length == 3) {
			num = '0' + num
		}
		console.log('写入时间', time, '写入数值', num);
		let value = Utils.hex2ab(num);
		BleTools.handleWrite(deviceId, AppData.services.timing[0], AppData.services.timing[1], value).then(() => {
			resolve()
		}).catch(err => {
			wx.hideLoading()
			wx.showToast({
				title: '设置失败',
				icon: 'none',
			})
		})
	})
}

// 按摩
// 第 1 个字节:按摩模式，'01/'02/'03/'04/'05 代表模式 1-4 及默认模式 
// 第 2 个字节:按摩力度，'01/'02/'03 代表按摩力度高、中、低
const handleMassage = function (deviceId, model, degree) {
	let fir = '0' + model,
		sec = '0' + degree;
	console.log('写入按摩', fir, sec);
	return new Promise(function (resolve, reject) {
		let value = Utils.hex2ab(fir + sec)
		BleTools.handleWrite(deviceId, AppData.services.massage[0], AppData.services.massage[1], value).then(() => {
			resolve()
		}).catch(err => {
			wx.hideLoading()
			wx.showToast({
				title: '设置失败',
				icon: 'none',
			})
		})
	})
}

// 通风
// 初始化长度 1 个字节，可读可写，'01/'02/'03 代表通风高、中、低
const handleVentilation = function (deviceId, degree) {
	degree = '0' + degree;
	console.log('写入通风', degree)
	return new Promise(function (resolve, reject) {
		let value = Utils.hex2ab(degree)
		BleTools.handleWrite(deviceId, AppData.services.ventilation[0], AppData.services.ventilation[1], value).then(() => {
			resolve()
		}).catch(err => {
			wx.hideLoading()
			wx.showToast({
				title: '设置失败',
				icon: 'none',
			})
		})
	})
}

// 揉捏
// 第 1 个字节:揉捏方向，'01/'02/'03 代表正、反转、自动切换 
// 第 2 个字节:揉捏力度，'01/'02/'03 代表高、中、低
const handleKnead = function (deviceId, direction, degree) {
	direction = '0' + direction
	degree = '0' + degree
	console.log('写入揉捏', direction, degree)
	return new Promise(function (resolve, reject) {
		let value = Utils.hex2ab(direction + degree)
		BleTools.handleWrite(deviceId, AppData.services.knead[0], AppData.services.knead[1], value).then(() => {
			resolve();
		}).catch(err => {
			console.log(err)
			wx.hideLoading();
			wx.showToast({
				title: '设置失败',
				icon: 'none',
			})
		})
	})
}

// 充放气
// 初始化长度 1 个字节，可读可写，'01/'02/'03 代表充气、放气、自动充放气
const handleGas = function (deviceId, model) {
	model = '0' + model;
	console.log('写入充放气', model)
	console.log('服务', AppData.services.gas[0], AppData.services.gas[1])
	return new Promise(function (resolve, reject) {
		let value = Utils.hex2ab(model);
		BleTools.handleWrite(deviceId, AppData.services.gas[0], AppData.services.gas[1], value).then(() => {
			resolve()
		}).catch(err => {
			reject(err)
		})
	})
}

module.exports = {
	handleTemperature: handleTemperature,
	handleTimer: handleTimer,
	handleMassage: handleMassage,
	handleVentilation: handleVentilation,
	handleKnead: handleKnead,
	handleGas: handleGas
}