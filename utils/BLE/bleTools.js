const AppData = getApp().globalData;
const GetServices = require('./getService');
const serviceList = {
	temp: ['AE00', 'AE01'], // 加热
	timing: ['AE00', 'AE02'], // 定时
	massage: ['AE00', 'AE03'], // 按摩
	ventilation: ['AE00', 'AE04'], // 通风
	knead: ['AE00', 'AE05'], // 揉捏
	gas: ['AE00', 'AE06'], // 充放气
	access: ['AE00', 'AE07'], // 鉴权
}

// 连接设备
const handleConnect = function (deviceId) {
	wx.showLoading({
		// mask: true,
		title: '设备连接中',
	})
	return new Promise(function (resolve, reject) {
		wx.createBLEConnection({
			deviceId,
			time: 1500,
			success: function (res) {
				AppData.connectingDeviceId = deviceId;
				GetServices.getServices(function(){
					resolve(deviceId)
				})
			},
			fail: function (err) {
				reject()
				console.log(err)
			},
		})
	})
}

// 断开连接
const handleDisConnect = function (deviceId) {
	wx.closeBLEConnection({
		deviceId,
		success: res => {
			console.log('断开连接成功', res)
		},
		fail: err => {
			console.log('断开连接失败', err)
		}
	})
}

// 执行读操作
const handleRead = function (deviceId, serviceId, characteristicId) {
	return new Promise(function (resolve, reject) {
		wx.notifyBLECharacteristicValueChange({
			deviceId: deviceId,
			serviceId: serviceId,
			characteristicId: characteristicId,
			state: true,
			success: resNotify => {
				wx.readBLECharacteristicValue({
					deviceId: deviceId,
					serviceId: serviceId,
					characteristicId: characteristicId,
					success: (res) => {
						resolve({
							serviceId: serviceId,
							characteristicId: characteristicId,
						})
					},
					fail: err => {
						reject()
						console.log(err)
					}
				})
			},
			fail: errNotify => {
				reject()
				console.log(errNotify)
			}
		})
	})
}

// 取消监听
const handleUnNotify = function (deviceId, serviceId, characteristicId) {
	wx.notifyBLECharacteristicValueChange({
		deviceId: deviceId,
		serviceId: serviceId,
		characteristicId: characteristicId,
		state: false,
		success: (res) => {
			// console.log('取消监听成功',res)
		},
		fail: err => {
			console.log('取消监听失败', err)
		}
	})
}

// 执行写操作
const handleWrite = function (deviceId, serviceId, characteristicId, value) {
	return new Promise(function (resolve, reject) {
		wx.writeBLECharacteristicValue({
			deviceId: deviceId,
			serviceId: serviceId,
			characteristicId: characteristicId,
			value: value,
			success: (res) => {
				resolve(res)
			},
			fail: err => {
				reject()
				console.log(err)
			}
		})
	})
}

export default {
	handleConnect, // 连接设备
	handleRead, // 执行读操作
	handleUnNotify, // 取消监听特征值
	handleWrite, // 执行写操作
	handleDisConnect, // 断开连接
	serviceList: serviceList,
}