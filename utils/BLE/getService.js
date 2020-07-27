const AppData = getApp().globalData;

const getServices = function (callback) {
	wx.getBLEDeviceServices({
		deviceId: AppData.connectingDeviceId,
		success: res => {
			let list = res.services
			console.log('设备服务列表', list);
			getCharacteristics(list, 0, callback)
		},
		fail: err => {
			console.log(err)
		},
	})
}

const getCharacteristics = function (services, index, callback) {
	let list = JSON.parse(JSON.stringify(services))
	wx.getBLEDeviceCharacteristics({
		deviceId: AppData.connectingDeviceId,
		serviceId: list[index].uuid,
		success: res => {
			list[index].characteristics = res.characteristics
			if (index == (list.length - 1)) {
				dealServiceList(list, callback)
			} else {
				getCharacteristics(list, index + 1, callback)
			}
		},
		fail: err => {
			console.log(err)
		}
	})
}

// 处理services
const dealServiceList = function (services, callback) {
	let list = Object.assign({}, AppData.services)
	// 匹配非滤芯service
	for (let i in list) {
		for (let x in services) {
			if (services[x].uuid.indexOf(list[i][0]) != -1) {
				list[i][0] = services[x].uuid
			}
		}
	}
	dealCharacteristics(list, services, callback);
}

// 匹配characteristics
const dealCharacteristics = function (rList, services, callback) {
	let list = Object.assign({}, rList)
	for (let i in list) {
		for (let x in services) {
			if (list[i][0] == services[x].uuid) {
				for (let y in services[x].characteristics) {
					if (services[x].characteristics[y].uuid.indexOf(list[i][1]) != -1) {
						list[i][1] = services[x].characteristics[y].uuid
					}
				}
			}
		}
	}
	console.log('获取到特征值',list);
	AppData.services = list;
	callback();
}



module.exports = {
	getServices: getServices
}