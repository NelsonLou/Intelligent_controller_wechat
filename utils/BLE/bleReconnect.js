// 继续设备未完成操作
// 连接设备 =》 鉴权
const AppData = getApp().globalData;
const Utils = require('../util');
const AesTools = require('../aesTools')
import BleTools from '../bleTools'
import Dialog from 'vant-weapp/dialog/dialog';


const reConnect = function (deviceId, callback) {
	wx.showLoading({
		title: '设备重连中',
		mask: true
	});
	handleCloseBle(deviceId,callback)
}

// 关闭小程序蓝牙适配器
const handleCloseBle = function (deviceId,callback) {
	console.log('重连，关闭蓝牙适配器');
	wx.closeBluetoothAdapter({
		success(res) {
			handleOpenBle(deviceId,callback)
		},
		fail(err) {
			console.log('重连，关闭蓝牙适配器失败', err);
			result(false,callback)
		}
	})
}

// 检测蓝牙状态
const handleOpenBle = function (deviceId,callback) {
	console.log('重连，检测蓝牙状态');
	wx.openBluetoothAdapter({
		success: function (res) {
			handleConnect(deviceId,callback)
		},
		fail: function (err) {
			console.log('重连，开启蓝牙适配器失败', err)
			result(false,callback)
		}
	})
}

// 连接设备
const handleConnect = function (deviceId,callback) {
	console.log('重连，开始连接设备');
	wx.createBLEConnection({
		deviceId,
		success: function (res) {
			handleAuthentication(deviceId,callback)
		},
		fail: function (err) {
			console.log('重连，连接蓝牙设备失败');
			result(false,callback)
		},
	})
}

// 鉴权
const handleAuthentication = function (deviceId,callback) {
	console.log('重连，开始鉴权');
	let deviceMac = AppData.deviceMac,
		key = 'qy' + deviceMac + 'qy',
		text = '2013' + deviceMac,
		pwd = AesTools.handleEncryptCBC(key, text)
	// 获取读鉴权信息的特征值
	BleTools.getCharacteristicsValue(deviceId, BleTools.serviceList.accessW[0], BleTools.serviceList.accessW[1]).then(res => {
		console.log('重连，获取鉴权服务号')
		// 获取鉴权的特征值
		BleTools.getCharacteristicsValue(deviceId, BleTools.serviceList.accessR[0], BleTools.serviceList.accessR[1]).then(resWriteChar => {
			console.log('重连，获取鉴权特征值')
			// 进行鉴权
			BleTools.handleWrite(deviceId, resWriteChar.serviceId, resWriteChar.characteristicId, Utils.hex2ab(pwd)).then(() => {
				console.log('重连，鉴权写入成功')
				result(true,callback)
			})
		})
	})
}

// 蓝牙重连结果
const result = function (flag, callback) {
	wx.hideLoading()
	Dialog.alert({
		title: '提醒',
		message: flag ? '蓝牙重连成功' : '蓝牙重连失败，请检查设备',
		showCancelButton: flag ? false : true,
		cancelButtonText: '返回首页',
		confirmButtonText: flag ? '确认' : '重新尝试'
	}).then(() => {
		if (!flag) {
			reConnect()
		} else {
			callback()
		}
	}).catch(() => {
		wx.reLaunch({
			url: '../../pages/Home/Home',
		})
	});
}

module.exports = {
	reConnect: reConnect
}