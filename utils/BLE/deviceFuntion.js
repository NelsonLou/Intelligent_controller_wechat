const Utils = require('../util');
const heatService = ['AE00', 'AE01'];
const timerService = ['AE00', 'AE02'];
const massageService = ['AE00', 'AE03'];
const ventilationService = ['AE00', 'AE04'];
const kneadService = ['AE00', 'AE05'];

import BleTools from '../bleTools';

// 温控
// 初始化长度 1 个字节，可读可写，当前可写最大值 100
const handleTemperature = function (deviceId, temp) {
	return new Promise(function (resolve, reject) {
		BleTools.getCharacteristicsValue(deviceId, heatService[0], heatService[1]).then(resService => {
			let value = Utils.hex2ab(Utils.int2hex(temp))
			BleTools.handleWrite(deviceId, resService.serviceId, resService.characteristicId, value).then(() => {
				resolve()
			}).catch(err => {
				reject(err)
			})
		}).catch(err => {
			reject(err)
		})
	})
}

// 定时
// 初始化长度 2 个字节，可读可写，定时范围 10-720
const handleTimer = function (deviceId, time) {
	return new Promise(function (resolve, reject) {
		BleTools.getCharacteristicsValue(deviceId, timerService[0], timerService[1]).then(resService => {
			let value = Utils.hex2ab(Utils.int2hex(time))
			BleTools.handleWrite(deviceId, resService.serviceId, resService.characteristicId, value).then(() => {
				resolve()
			}).catch(err => {
				reject(err)
			})
		}).catch(err => {
			reject(err)
		})
	})
}

// 按摩
// 第 1 个字节:按摩模式，'01/'02/'03/'04/'05 代表模式 1-4 及默认模式 
// 第 2 个字节:按摩力度，'01/'02/'03 代表按摩力度高、中、低
const handleMassage = function (deviceId, model, degree) {
	return new Promise(function (resolve, reject) {
		BleTools.getCharacteristicsValue(deviceId, ventilationService[0], ventilationService[1]).then(resService => {
			let value = Utils.hex2ab(Utils.string2hex(model + degree))
			BleTools.handleWrite(deviceId, resService.serviceId, resService.characteristicId, value).then(() => {
				resolve()
			}).catch(err => {
				reject(err)
			})
		}).catch(err => {
			reject(err)
		})
	})
}

// 通风
// 初始化长度 1 个字节，可读可写，'01/'02/'03 代表通风高、中、低
const handleVentilation = function (deviceId, degree) {
	return new Promise(function (resolve, reject) {
		BleTools.getCharacteristicsValue(deviceId, massageService[0], massageService[1]).then(resService => {
			let value = Utils.hex2ab(Utils.string2hex(degree))
			BleTools.handleWrite(deviceId, resService.serviceId, resService.characteristicId, value).then(() => {
				resolve()
			}).catch(err => {
				reject(err)
			})
		}).catch(err => {
			reject(err)
		})
	})
}

// 揉捏
// 第 1 个字节:揉捏方向，'01/'02/'03 代表正、反转、自动切换 
// 第 2 个字节:揉捏力度，'01/'02/'03 代表高、中、低
const handleKnead = function (deviceId, direction, degree) {
	return new Promise(function (resolve, reject) {
		BleTools.getCharacteristicsValue(deviceId, kneadService[0], kneadService[1]).then(resService => {
			let value = Utils.hex2ab(Utils.string2hex(direction + degree))
			BleTools.handleWrite(deviceId, resService.serviceId, resService.characteristicId, value).then(() => {
				resolve()
			}).catch(err => {
				reject(err)
			})
		}).catch(err => {
			reject(err)
		})
	})
}

// 充放气
// 初始化长度 1 个字节，可读可写，'01/'02/'03 代表充气、放气、自动充放气
const handleGas = function (deviceId, model) {
	return new Promise(function (resolve, reject) {
		BleTools.getCharacteristicsValue(deviceId, kneadService[0], kneadService[1]).then(resService => {
			let value = Utils.hex2ab(Utils.string2hex(model))
			BleTools.handleWrite(deviceId, resService.serviceId, resService.characteristicId, value).then(() => {
				resolve()
			}).catch(err => {
				reject(err)
			})
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