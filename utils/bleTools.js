
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
				resolve(deviceId)
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

// 连接异常处理
const handleOnConnectStateChange = function () {

}

// 获取设备特征值
const getCharacteristicsValue = function (deviceId, referenceSer, referenceChar) {
	return new Promise(function (resolve, reject) {
		// 获取serviceId
		wx.getBLEDeviceServices({
			deviceId: deviceId,
			success: resService => {
				for (let i in resService.services) {
					if (resService.services[i].uuid.indexOf(referenceSer) != -1) {
						// 获取特征值
						wx.getBLEDeviceCharacteristics({
							deviceId: deviceId,
							serviceId: resService.services[i].uuid,
							success: resChar => {
								for (let x in resChar.characteristics) {
									if (resChar.characteristics[x].uuid.indexOf(referenceChar) != -1) {
										resolve({
											serviceId: resService.services[i].uuid,
											characteristicId: resChar.characteristics[x].uuid
										})
									}
								}
							},
							fail: errChar => {
								reject()
								console.log(referenceSer, referenceChar);
								console.log(errChar)
							}
						})
					}
				}
			},
			fail: errService => {
				reject()
				console.log(referenceSer, referenceChar);
				console.log(errService)
			},
		})
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
	getCharacteristicsValue, // 获取特征值UUID
	handleRead, // 执行读操作
	handleUnNotify, // 取消监听特征值
	handleWrite, // 执行写操作
	handleOnConnectStateChange, // 当连接异常
	handleDisConnect, // 断开连接
}