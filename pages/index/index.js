const AppData = getApp().globalData;
const Utils = require('../../utils/util');
const AesTools = require('../../utils/aesTools')
import BleTools from '../../utils/bleTools'

Page({
	data: {
		bodyHeight: 0,
		act: '',
		deviceMac: '', // 设备Mac
		productModel: '', // 产品类型
		timer: null,
		path: '',
	},

	// 初试流程:  设置高度=>获取code=>获取openId=>获取云备份数据=>查看是否有未完成复位
	onLoad: function () {
		this.setData({
			bodyHeight: AppData.windowHeight - AppData.menuButtonTop - AppData.menuBtnHeight
		})
	},

	// 扫描滤芯二维码
	handleGoScan: function () {
		let that = this
		wx.showActionSheet({
			itemList: ['YY01', 'YY03', 'YY04'],
			success(res) {
				that.setData({
					path: res.tapIndex == 0 ? 'YYOne' : res.tapIndex == 1 ? 'YYThree' : 'YYFour'
				}, () => {
					that.handleCloseBle()
				})
			},
			fail(res) {
				console.log(res.errMsg)
			}
		})
		// wx.scanCode({
		// 	success: res => {
		// 		let result = res.result
		// 		if (result.split('mac=') && result.split('productModel=')) {
		// 			let mac = result.split('mac=')[1].split('&')[0],
		// 				productModel = result.split('productModel=')[1]
		// 			that.data.deviceMac = mac
		// 			that.data.productModel = productModel
		// that.handleCloseBle()
		// 		} else {
		// 			wx.showModal({
		// 				content: '请扫描正确的二维码',
		// 				showCancel: false
		// 			})
		// 		}
		// 	},
		// 	fail: err => {
		// 		console.log(err)
		// 	},
		// })
	},

	// 关闭蓝牙连接
	handleCloseBle: function () {
		let that = this
		wx.closeBluetoothAdapter({
			fail(err) {
				console.log('关闭蓝牙适配器异常', err)
			},
			complete() {
				that.handleTestBlueTooth()
			}
		})
	},

	// 检测本机蓝牙状态
	handleTestBlueTooth: function () {
		let that = this
		wx.openBluetoothAdapter({ // 检测当前是否已经处于蓝牙匹配
			success: function (res) {
				that.getBluetoothAdapterState()
			},
			fail: function (err) {
				that.BleError()
			}
		})
	},

	// 检测本机蓝牙是否可用
	getBluetoothAdapterState: function () {
		var that = this;
		wx.getBluetoothAdapterState({
			success: function (res) {
				if (res.available) {
					that.handleFoundDevice()
				} else {
					that.BleError()
				}
			},
			fail(err) {
				that.BleError()
			}
		})
	},

	// 开始搜索蓝牙
	handleFoundDevice: function () {
		let that = this
		wx.showLoading({
			title: '搜索设备中',
		})
		wx.startBluetoothDevicesDiscovery({
			success: function (res) {
				that.handleOnDeviceFound()
				that.data.timer = setTimeout(function () {
					that.handleStopScan().then(res => {
						wx.hideLoading()
						wx.showModal({
							content: '未发现设备',
							cancelText: '确认',
							confirmText: '重新搜索',
							success: res => {
								if (res.confirm) {
									that.handleFoundDevice()
								}
							}
						})
					})
				}, 15000)
			},
			fail: function (err) { }
		})
	},

	// 当搜索到新设备
	handleOnDeviceFound: function () {
		let that = this,
			name = ''
		wx.onBluetoothDeviceFound(function (res) {
			var devices = res.devices
			for (let i in devices) {
				if (devices[i].name && devices[i].name == 'YouYuan') {
					that.handleConnect(devices[i]);
					break;
				}
			}
		})
	},

	// 停止扫描设备
	handleStopScan: function () {
		let that = this
		return new Promise(function (resolve, reject) {
			wx.stopBluetoothDevicesDiscovery({
				success: function (res) {
					clearTimeout(that.data.timer)
					that.setData({
						timer: null
					})
				},
				fail: function (err) {
					wx.hideLoading()
				},
				complete: function () {
					resolve()
				}
			})
		})
	},

	// 连接设备
	handleConnect: function (device) {
		let that = this
		wx.showLoading({
			title: '连接设备中',
		})
		that.handleStopScan().then(res => {
			BleTools.handleConnect(device.deviceId).then(res => {
				that.data.deviceId = device.deviceId
				AppData.connectingDeviceId = device.deviceId
				that.handleWatchValue()
				// wx.navigateTo({
				// 	url: '../YYOne/YYOne',
				// })
			}).catch(err => {
				console.log(err);
				wx.hideLoading()
				wx.showModal({
					content: '设备连接失败，请稍后再试',
					showCancel: false
				})
			})
		})
	},

	// 获取特征值变化值
	handleWatchValue: function () {
		let that = this
		wx.onBLECharacteristicValueChange(function (res) {
			that.handleDealReadResult(res)
		})
		this.handleAuth()
	},

	// 设备校验
	handleAuth: function () {
		// this.handleDealReadResult()
		let that = this,
			originPwd = Utils.randomString(),
			pwd = AesTools.handleEncryptCBC(originPwd)
		AppData.originPwd = originPwd
		AppData.pwd = pwd
		console.log('生成随机密钥', originPwd);
		console.log('生成随机密钥hex', Utils.string2hex(originPwd));
		console.log('生成加密密钥', pwd);
		BleTools.getCharacteristicsValue(that.data.deviceId, 'AE00', 'AE07').then(res => {
			BleTools.handleWrite(that.data.deviceId, res.serviceId, res.characteristicId, Utils.hex2ab(pwd)).then(() => {
				wx.navigateTo({
					url: '../' + that.data.path + '/' + that.data.path,
				})
				// BleTools.handleRead(that.data.deviceId, res.serviceId, res.characteristicId)
			})
		}).catch(err => {
			console.log('鉴权异常', err)
		})
	},

	// 处理读取结果
	handleDealReadResult: function (data) {
		console.log('读取', data)
		console.log('读取', Utils.ab2hex(data.value));
		wx.navigateTo({
			url: '../' + this.data.path + '/' + this.data.path,
		})
	},

	// 蓝牙异常处理
	BleError: function () {
		wx.showModal({
			content: '蓝牙功能异常，请检查蓝牙开关或微信蓝牙权限是否开启',
			showCancel: false,
			confirmText: '确定',
		})
	}

})