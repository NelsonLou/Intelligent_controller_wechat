const AppData = getApp().globalData;
import BleReconnect from '../../utils/BLE/bleReconnect'

Page({
	data: {
		bodyHeight: 0,
		act: '',
		filterLevel: 0,
	},

	// 初试流程:  设置高度=>获取code=>获取openId=>获取云备份数据=>查看是否有未完成复位
	onLoad: function () {
		this.setData({
			bodyHeight: AppData.windowHeight - AppData.menuButtonTop - AppData.menuBtnHeight
		})
	},

	// 前往我的
	handleGoMine: function () {
		wx.navigateTo({
			url: '../BleList/BleList?from=my',
		})
	},

	// 获取用户openId
	getOpenId: function (code) {
		let that = this,
			api = ApiList.getOpenIdAndUnionId,
			para = {
				code: code
			};
		Ajax('GET', api, para, res => {
			AppData.openId = res.data.openId;
			AppData.unionId = res.data.unionId;
			that.getHasConnectList(res.data.openId)
		}, err => {
			console.log('获取OPENID异常', err)
		})
	},

	// 获取设备连接记录
	getHasConnectList: function (openId) {
		let api = ApiList.userConnectList,
			para = {
				key: openId
			}
		Ajax('GET', api, para, res => {
			let list = [],
				value = res.data ? JSON.parse(res.data.value) : [],
				flag = true
			for (let i in value) {
				flag = true
				for (let t in list) {
					if (list[t].showDeviceName == value[i].showDeviceName) {
						flag = false
					}
				}
				if (flag) {
					list.push(value[i])
				}
			}
			AppData.hasConnectList = list
			wx.hideLoading({
				complete: (res) => {
					this.handleCheckUnfinish()
				},
			})
		}, err => {
			console.log('获取OpenId异常')
		})
	},

	// 检查是否有未完成操作
	handleCheckUnfinish: function () {
		let form = wx.getStorageSync('unfinishFilterReset'),
			that = this
		if (form) {
			console.log('未完成操作记录', JSON.parse(form))
			wx.showModal({
				title: '提示',
				content: '您有未完成的复位操作，是否继续？',
				success(res) {
					if (res.confirm) {
						form = JSON.parse(form);
						AppData.connectingDeviceId = form.connectingDeviceId
						AppData.deviceMac = form.deviceMac
						AppData.productKey = form.productKey
						AppData.deviceInfo = form.deviceInfo
						AppData.deviceFilters = form.deviceFilters
						AppData.scanFilters = form.scanFilters
						that.handleReConnect()
					} else if (res.cancel) {
						wx.removeStorageSync('unfinishFilterReset')
					}
				}
			})
		}
	},

	// 回到复位操作
	handleReConnect: function () {
		let that = this
		console.log('进入重连机制')
		BleReconnect.reConnect(AppData.connectingDeviceId, function () {
			that.handleGoResetFilter()
		})
	},

	// 前往滤芯复位
	handleGoResetFilter: function () {
		wx.navigateTo({
			url: '../FilterCourse/FilterCourse?from=reback',
		})
	},

	// ================================

	// 前往蓝牙连接
	handleGoActive: function () {
		wx.navigateTo({
			url: '../BleList/BleList?from=active',
		})
	},

	// 扫描滤芯二维码
	handleGoScan: function () {
		wx.scanCode({
			success: res => {
				wx.showLoading({
				  	title: '设备连接中',
				})
				setTimeout(function(){
					wx.navigateTo({
					  	url: '../ConnectionResult/ConnectionResult',
					})
				},1500)
			},
			fail: err => {
				console.log(err)
			},
		})
	},

})