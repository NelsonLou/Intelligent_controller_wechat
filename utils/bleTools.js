const AppData = getApp().globalData;


// 蓝牙特征值列表  [serviceId,characteristicId]
const serviceList = {
	mac: ['A001', 'B002'], // 读取 MAC地址
	productKey: ['A001', 'B005'], // 读取 productKey
	filerGrade: ['A001', 'B004'], // 读取 滤芯级数
	accessR: ['A002', 'B101'], // 写入 鉴权码
	accessW: ['A002', 'B102'], // 读取 鉴权结果
	setWifiPwd: ['A003', 'B202'], // 写入 wifi密码
	setWifiSSID: ['A003', 'B201'], // 写入 SSID
	setWifiBSSID: ['A003', 'B203'], // 写入 BSSID
	activeCode: ['A004', 'B301'], // 写入 激活/反激活 码
	activeState: ['A004', 'B302'], // 读取 激活状态
	activeAction: ['A004', 'B303'], // 写入 激活/反激活 操作码
	activeResult: ['A004', 'B304'], // 读取 激活结果

	filterInfo: ['A100', '1'], // 读取 滤芯详情
	filterCode: ['A100', '2'], // 写入复位码 激活结果
	filterAction: ['A100', '3'], // 写入操作类型 0：复位，1：撤销
	returnCode: ['A100', '4'], // 读取 复位操作结果 0：成功 1：码校验错误 2：频繁操作 3：异常
	verifyCode: ['A100', '5'], // 读取 复位成功后的校验码
	timeStamp: ['A100', '6'], // 写入 复位时间戳
	// 第N级滤芯(FilterN)的service UUID为0xA100+N
	// 第N级滤芯(FilterN)的第i个特征值UUID为0xB400+6*(N-1)+i
}

// BleTools.serviceList.activeResult[0], BleTools.serviceList.activeResult[1]


// 连接设备
const handleConnect = function (deviceId) {
	wx.showLoading({
		title: '设备连接中',
		mask: true
	})
	return new Promise(function (resolve, reject) {
		wx.createBLEConnection({
			deviceId,
			time: 1500,
			success: function (res) {
				wx.hideLoading()
				resolve(deviceId)
			},
			fail: function (err) {
				console.log(err)
				wx.hideLoading()
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
								console.log(referenceSer, referenceChar);
								console.log(errChar)
							}
						})
					}
				}
			},
			fail: errService => {
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
						console.log(err)
					}
				})
			},
			fail: errNotify => {
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
	serviceList: serviceList,
}