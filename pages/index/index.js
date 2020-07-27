const AppData = getApp().globalData;
const Utils = require('../../utils/util');
const AesTools = require('../../utils/aesTools');
const GetDeviceInfo = require('../../utils/BLE/getDeviceInfo');
import BleTools from '../../utils/BLE/bleTools'

Page({
	data: {
		bodyHeight: 0,
		popup: false,
		act: '',
		deviceMac: '', // 设备Mac
		productModel: '', // 产品类型
		timer: null,
		historyList: null, // 历史连接记录
		productType: '', // 设备类型
		path: '',
		deviceName: '',
		deviceList: [],
		columns: ['yy01', 'yy02', 'yy03', 'yy04', 'yy05', 'yy06', 'yy07', 'yy08', 'yy09'],
	},

	// 初试流程:  设置高度=>获取code=>获取openId=>获取云备份数据=>查看是否有未完成复位
	onLoad: function () {
		this.setData({
			bodyHeight: AppData.windowHeight - AppData.menuButtonTop - AppData.menuBtnHeight,
			historyList: AppData.historyList || []
		}, () => {
			AppData.services = BleTools.serviceList;
		})
	},

	onShow: function(){
		wx.hideLoading();
		this.handleCloseBle(false)
	},

	// 扫描二维码
	handleGoScan: function () {
		let that = this;
		wx.scanCode({
			success: res => {
				let result = res.result
				if (result.split('productType=')[1]) {
					that.setData({
						productType: result.split('productType=')[1]
					}, () => {
						that.handleCloseBle(true); // 开始搜索蓝牙
					})
				} else {
					wx.showModal({
						content: '请扫描正确的二维码',
						showCancel: false
					})
				}
			},
			fail: err => {
				console.log(err)
			},
		})
	},

	// 关闭蓝牙连接
	handleCloseBle: function (flag) {
		let that = this
		wx.closeBluetoothAdapter({
			fail(err) {
				console.log('关闭蓝牙适配器异常', err)
			},
			complete() {
				wx.openBluetoothAdapter({ // 检测当前是否已经处于蓝牙匹配
					success: function (res) {
						wx.getBluetoothAdapterState({
							success: function (res) {
								if (res.available) {
									if(flag){
										that.handleFoundDevice()
									}
								} else {
									that.BleError()
								}
							},
							fail(err) {
								that.BleError()
							}
						})
					},
					fail: function (err) {
						that.BleError()
					}
				})
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
			allowDuplicatesKey: false,
			success: function (res) {
				that.handleOnDeviceFound();
				that.data.timer = setTimeout(function () {
					that.handleStopScan().then(res => {
						that.handleCheckDeviceList(1)
					});
				}, 3000)
			},
			fail: function (err) { }
		})
	},

	// 当搜索到新设备
	handleOnDeviceFound: function () {
		let that = this,
			list = Object.assign([], this.data.deviceList);
		wx.onBluetoothDeviceFound(function (res) {
			var devices = res.devices
			for (let i in devices) {
				if (devices[i].name && (devices[i].name == 'YouYuan' || devices[i].name == that.data.productType)) {
					list.push(devices[i])
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

	// 检查已经搜索到的设备
	handleCheckDeviceList: function (flag) {
		let reference = flag == 1 ? this.data.productType : 'YouYuan',
			list = Object.assign([], this.data.deviceList),
			count = true;
		console.log('已经搜索到的符合的设备', list);
		for (let item in list) {
			if (list[item].name == reference) {
				count = false
				this.handleConnect(list[item]);
				break;
			}
		}
		if (count) {
			if (flag == 1) {
				this.handleCheckDeviceList(2)
			} else {
				wx.hideLoading({
					complete: (res) => {
						wx.showModal({
							title: '未搜索到设备',
							content: '未搜索到相关设备，请检查设备。',
							showCancel: false
						})
					},
				})
			}
		}
	},

	// 连接设备
	handleConnect: function (device) {
		let that = this
		wx.showLoading({
			title: '连接设备中',
		});
		BleTools.handleConnect(device.deviceId).then(res => {
			AppData.productType = that.data.productType;
			that.data.deviceId = device.deviceId;
			that.handleSaveHistory(device);
		}).catch(err => {
			console.log(err);
			wx.hideLoading({
				complete: () => {
					wx.showModal({
						content: '设备连接失败，请稍后再试',
						showCancel: false
					})
				}
			})
		})
	},

	// 存储连接记录
	handleSaveHistory: function (device) {
		let obj = Object.assign({}, device),
			list = Object.assign([], this.data.historyList) || [];
		if (!obj.productType) {
			obj.productType = this.data.productType
		}
		obj.connectDate = this.getDateNow()
		let newList = [obj];
		for (let i in list) {
			if (list[i].deviceId != obj.deviceId) {
				newList.push(list[i])
			}
		}
		this.setData({
			historyList: newList
		}, () => {
			AppData.historyList = newList;
			wx.setStorageSync('historyList', newList);
			this.handleWatchValue();
		})
	},

	// 获取特征值变化值
	handleWatchValue: function () {
		let that = this
		wx.onBLECharacteristicValueChange(function (res) {
			BleTools.handleUnNotify(that.data.deviceId, res.serviceId, res.characteristicId);
			that.handleDealReadResult(res);
		});
		this.handleAuth()
	},

	// 设备校验
	handleAuth: function () {
		let that = this,
			originPwd = Utils.randomString(),
			pwd = AesTools.handleEncryptCBC(originPwd)
		AppData.originPwd = originPwd
		AppData.pwd = pwd
		console.log('生成随机密钥', originPwd);
		console.log('生成随机密钥hex', Utils.string2hex(originPwd));
		console.log('生成加密密钥', pwd);
		BleTools.handleWrite(that.data.deviceId, AppData.services.access[0], AppData.services.access[1], Utils.hex2ab(pwd)).then(() => {
			BleTools.handleRead(that.data.deviceId, AppData.services.access[0], AppData.services.access[1])
		})
	},

	// 处理读取结果
	handleDealReadResult: function (data) {
		console.log('读取', Utils.ab2hex(data.value));
		let path = '';
		switch (this.data.productType) {
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
			case 'yy09':
				path = 'YYNight';
				break;
			default:
				wx.showToast({
					title: '二维码异常',
					icon: 'none'
				})
				return false;
				break;
		}
		GetDeviceInfo.getDeviceInfo(AppData.connectingDeviceId, function (res) {
			if (res) {
				// if(that.data.deviceName != 'YouYuan'){
				wx.navigateTo({
					url: '../' + path + '/' + path,
				})
				// }else{
				// 	that.handleRename()
				// }
			} else {
				BleTools.handleDisConnect(AppData.connectingDeviceId);
				wx.showModal({
					content: '设备连接异常请尝试重连',
					showCancel: false
				})
			}
		})

	},

	// 设备改名
	handleRename: function () {
		BleTools.handleWrite(AppData.connectingDeviceId, AppData.services)
	},

	// 蓝牙异常处理
	BleError: function () {
		wx.showModal({
			content: '蓝牙功能异常，请检查蓝牙开关或微信蓝牙权限是否开启',
			showCancel: false,
			confirmText: '确定',
		})
	},

	// 连接历史记录中的设备
	handleConnectHistory: function (e) {
		let device = this.data.historyList[e.currentTarget.dataset.idx],
			list = [device];
		this.handleConnect(device)
	},

	getDateNow: function () {
		let date = new Date(),
			year = date.getFullYear(),
			month = date.getMonth(),
			day = date.getDate(),
			hour = date.getHours(),
			mintes = date.getMinutes()
		return year + '/' + month + '/' + day + ' ' + hour + ':' + mintes
	},

	handleMoreWay: function () {
		this.setData({
			popup: true
		})

	},

	handleChosePt: function (e) {
		AppData.productType = e.detail.value;
		wx.navigateTo({
			url: '../BleList/BleList',
		})
	},

	onClose: function () {
		this.setData({
			popup: false
		})
	},
})