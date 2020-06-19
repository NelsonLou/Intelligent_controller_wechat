const AppData = getApp().globalData;
import BleTools from '../../utils/bleTools.js';

Page({
	data: {
		timer: null, // 定时器
		bodyHeight: 0,
		netStatus: true,
		searching: false, // 搜索标识
		deviceList: [{
			showDeviceName:'附近设备A',
			localName:'xxxx',
		},{
			showDeviceName:'附近设备B',
			localName:'xxxx',
		}], // 搜索到设备列表
		hasConnectList: [{
			showDeviceName:'我的设备A（正在附近，可匹配）',
			localName:'xxxx',
			found: true
		},{
			showDeviceName:'我的设备B（未搜索到）',
			localName:'xxxx',
		}], // 连接记录 设备列表
	},

	onLoad: function (options) {
		this.setData({
			bodyHeight: AppData.windowHeight - AppData.menuButtonTop - AppData.menuBtnHeight - 360,
			from: options.from
		})
	},

	onShow: function () {
		// 防止息屏返回后重复显示
		let list = []
		for (let i in AppData.hasConnectList) {
			list.push({
				found: false,
				...AppData.hasConnectList[i]
			})
		}
		this.setData({
			netStatus: AppData.netStatus,
			// hasConnectList: list,
			// deviceList: []
		},()=>{
			// this.handleCloseBle()
		})
		
	},

	// 页面隐藏时关闭定时器以及设备搜索
	onHide: function () {
		wx.hideLoading()
		this.handleStopScan()
	},

	// 页面隐藏时关闭定时器以及设备搜索
	onUnload: function () {
		this.handleStopScan()
	},

	handleCloseBle: function(){
		let that = this
		wx.closeBluetoothAdapter({
			success(res) {
				console.log('关闭蓝牙适配器', res)
			},
			fail(err) {
				console.log('关闭蓝牙适配器异常',err)
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
				if (err.errCode) {
					that.goBleError(err.errCode)
				} else {
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
			fail(err) {}
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
				}, 30000)
			},
			fail: function (err) {}
		})
	},

	// 当搜索到新设备
	handleOnDeviceFound: function () {
		let arr = [],
			list = this.data.deviceList,
			hasList = JSON.parse(JSON.stringify(this.data.hasConnectList)),
			that = this,
			flag = false
		wx.onBluetoothDeviceFound(function (res) {
			var devices = res.devices
			for (let i in devices) {
				// 筛选是否为已连接过设备
				if (devices[i].localName && devices[i].localName.indexOf('#QY#') >= 0) {
					flag = false
					devices[i].showDeviceName = devices[i].localName.split('#QY#')[1]
					for (let t in hasList) {
						if (hasList[t].showDeviceName == devices[i].showDeviceName) {
							hasList[t].found = true;
							hasList[t].deviceId = devices[i].deviceId; // 防止不同幸好设备同一设备DeviceID不同
							flag = true
						}
					}
					if (!flag && devices[i].localName.indexOf('r#QY#') < 0) {
						arr.push({
							...devices[i]
						})
					}
				}
			}
			that.setData({
				deviceList: list.concat(arr),
				hasConnectList: hasList
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
			fail: function (err) {},
		})
	},

	// 创建新设备连接
	handleConnectNotyet: function (e) {
		let deviceId = e.currentTarget.dataset.deviceid,
			that = this,
			list = this.data.deviceList,
			hasList = JSON.parse(JSON.stringify(AppData.hasConnectList)),
			device = {}
		for (let i in list) {
			if (list[i].deviceId == deviceId) {
				device = list[i]
			}
		}
		BleTools.handleConnect(deviceId).then(res => {
			AppData.connectingDeviceId = deviceId
			hasList.push(device)
			that.setData({
				hasConnectList: hasList
			}, () => {
				AppData.hasConnectList = hasList;
				that.handleSaveConnection()
			})
		}).catch(err => {
			console.log(err)
			that.goResult(0)
		})
	},

	// 连接历史连接设备
	handleConnectAlready: function (e) {
		let name = e.currentTarget.dataset.name,
			that = this,
			flag = false,
			deviceId = ''
		for (let i in this.data.hasConnectList) {
			if (this.data.hasConnectList[i].showDeviceName == name) {
				flag = this.data.hasConnectList[i].found
				deviceId = this.data.hasConnectList[i].deviceId
			}
		}
		if (flag) {
			BleTools.handleConnect(deviceId).then(res => {
				AppData.connectingDeviceId = deviceId
				that.handleSaveConnection()
			}).catch(err => {
				console.log(err)
				that.goResult(0)
			})
		}
	},

	// 前往设备连接结果页面
	goResult: function (result) {
		wx.navigateTo({
			url: '../ConnectionResult/ConnectionResult?result=' + result + '&from=' + this.data.from,
		})
	},

	// 跳转至蓝牙异常页面
	goBleError: function (code) {
		wx.navigateTo({
			url: '../BleError/BleError?code=' + code,
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
		if(AppData.netStatus){
			Ajax('POST', api, para, res => {
				that.goResult(1)
			}, err => {
				console.log('保存连接记录异常')
				that.goResult(1)
			})
		}else{ // 断网情况
			that.goResult(1)
		}
	},

	// 选择产品页面
	goChoseProduct: function () {
		if(AppData.netStatus){
			wx.navigateTo({
				url: '../ChoseProduct/ChoseProduct',
			})
		}else{ // 断网情况
			wx.showToast({
			  	title: '网络异常，暂时无法使用该功能',
			})
		}
	},

	// 扫描设备PK
	handleScanPK: function () {
		wx.scanCode({
			success: res => {
				if (res.result.split('productKey=')[1]) {
					wx.navigateTo({
						url: '../ConnectCourse/ConnectCourse?productKey=' + res.result.split('pk=')[1],
					})
				} else {
					wx.showModal({
						content: '请扫描正确的设备二维码'
					})
				}
			},
			fail: err => {
				console.log(err)
			},
		})
	},

	handleConnect: function(){
		this.goResult(1)
	}
})