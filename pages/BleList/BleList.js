const AppData = getApp().globalData;
import BleTools from '../../utils/BLE/bleTools.js';
const GetDeviceInfo = require('../../utils/BLE/getDeviceInfo');

Page({
	data: {
		timer: null, // 定时器
		bodyHeight: 0,
		netStatus: true,
		searching: false, // 搜索标识
		deviceList: [], // 连接记录 设备列表
	},

	onLoad: function (options) {
		this.setData({
			bodyHeight: AppData.windowHeight - AppData.menuButtonTop - AppData.menuBtnHeight - 360
		})
	},

	onShow: function () {
		this.setData({
			deviceList: []
		}, () => {
			this.handleCloseBle()
		})
	},

	// 页面隐藏时关闭定时器以及设备搜索
	onHide: function () {
		wx.hideLoading()
		this.handleStopScan()
	},

	handleCloseBle: function () {
		let that = this
		wx.closeBluetoothAdapter({
			success(res) {
				console.log('关闭蓝牙适配器', res)
			},
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
				wx.showModal({
					content: '蓝牙调用失败，未知错误',
					cancelText: '确定',
					confirmText: '重试',
					success: function (res) {
						if (res.confirm) {
							that.handleTestBlueTooth()
						} else {
							wx.navigateBack({
								delta: 1,
							})
						}
					}
				})
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
				}
			},
			fail(err) { }
		})
	},

	// 开始搜索蓝牙
	handleFoundDevice: function () {
		let that = this
		this.setData({
			searching: true
		})
		wx.startBluetoothDevicesDiscovery({
			success: function (res) {
				that.handleOnDeviceFound()
				that.data.timer = setTimeout(function () {
					that.handleStopScan()
				}, 15000)
			},
			fail: function (err) { }
		})
	},

	// 当搜索到新设备
	handleOnDeviceFound: function () {
		let list = this.data.deviceList,
			flag = false,
			that = this;
		wx.onBluetoothDeviceFound(function (res) {
			var devices = res.devices
			for (let i in devices) {
				// 筛选是否为已连接过设备
				if (devices[i].name && (devices[i].name.indexOf('YouYuan') >= 0 || devices[i].name.indexOf('YY') >= 0)) {
					for (let x in list) {
						if (list[x].deviceId == devices[i].deviceId) {
							flag = true
						}
					}
					if (!flag) {
						list.push(devices[i])
					}
					flag = false
				}
			}
			that.setData({
				deviceList: list,
			})
		})
	},

	// 停止扫描设备
	handleStopScan: function () {
		let that = this
		wx.stopBluetoothDevicesDiscovery({
			success: function (res) {
				clearTimeout(that.data.timer)
				that.setData({
					searching: false,
					timer: null
				})
			},
			fail: function (err) { },
		})
	},

	// 创建设备连接
	handleConnect: function (e) {
		let deviceId = e.currentTarget.dataset.deviceid,
			that = this,
			list = AppData.historyList,
			productType = AppData.productType,
			flag = false,
			arr = []
		// for (let i in list) {
		// 	if (list[i].deviceId == deviceId) {
		// 		device = list[i]
		// 	}
		// }
		BleTools.handleConnect(deviceId).then(res => {
			that.goResult()
		}).catch(err => {
			console.log(err)
			that.goResult(0)
		})
	},

	// 前往设备连接结果页面
	goResult: function () {
		let path = '';
		switch (AppData.productType) {
			case 'yy01':
				path = 'YYOne';
				break;
			case 'yy02':
				path = 'YYTwo';
				break;
			case 'yy03':
				path = 'YYThree'
				break;
			case 'yy04':
				path = 'YYFour';
				break;
			case 'yy05':
				path = 'YYFive';
				break;
			case 'yy06':
				path = 'YYSix';
				break;
			case 'yy07':
				path = 'YYSeven';
				break;
			case 'yy08':
				path = 'YYEight';
				break;
			default:
				path = 'YYNight';
				break;
		}
		GetDeviceInfo.getDeviceInfo(AppData.connectingDeviceId, function (res) {
			if (res) {
				wx.navigateTo({
					url: '../' + path + '/' + path,
				})
			} else {
				BleTools.handleDisConnect(AppData.connectingDeviceId);
				wx.showModal({
					content: '设备连接异常请尝试重连',
					showCancel: false
				})
			}
		})
	},

	// 保存连接记录
	handleSaveConnection: function () {
		wx.setStorageSync('hasConnectList', AppData.hasConnectList)
		let that = this,
			api = ApiList.userConnectList,
			para = {
				value: JSON.stringify(AppData.hasConnectList),
				key: AppData.openId
			}
		if (AppData.netStatus) {
			Ajax('POST', api, para, res => {
				that.goResult(1)
			}, err => {
				console.log('保存连接记录异常')
				that.goResult(1)
			})
		} else { // 断网情况
			that.goResult(1)
		}
	},
})