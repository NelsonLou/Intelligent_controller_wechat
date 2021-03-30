const AppData = getApp().globalData;
const DeviceFunction = require('../../utils/BLE/deviceFuntion')
const Utils = require('../../utils/util');
import BleReconnect from '../../utils/BLE/bleReconnect'
const GetDeviceInfo = require('../../utils/BLE/getDeviceInfo');


Page({
	data: {
		bodyHeight: 0,
		// 滚动相关
		scrollArrTiming: {
			'10': 310,
			'20': 240,
			'30': 178,
			'40': 120,
			'50': 60,
			'60': 0
		},
		scrollArrDegree: {
			'1': 138,
			'2': 70,
			'3': 0
		},
		prop: 0,
		// 设备属性相关
		power: false,
		temperature: 0,
		kneadModel: 0,
		kneadDegree: 0, // 按摩等级
		tempList: [10, 20, 30, 40, 50, 60], // 温度列表
		tempTiming: 0, // 温度定时
		tempPower: false, // 加热开关
		showDialog: false, // 展示弹窗
	},

	onLoad: function (options) {
		AppData.rateScreen = false;
		let objD = Object.assign({}, this.data.scrollArrDegree),
			objTi = Object.assign({}, this.data.scrollArrTiming)
		for (let i in objD) {
			objD[i] = objD[i] / AppData.widthProp;
		}
		for (let i in objTi) {
			objTi[i] = objTi[i] / AppData.widthProp;
		}
		this.setData({
			bodyHeight: AppData.windowHeight - AppData.menuButtonTop - AppData.menuBtnHeight - 12,
			// bodyHeight: AppData.windowHeight,
			scrollArrTiming: objTi,
			scrollArrDegree: objD,
		})
	},

	onShow: function () {
		let that = this;
		if (!AppData.rateScreen) { // 息屏返回
			this.handleGetValue();
			this.handleDealBleBroke()
		} else {
			GetDeviceInfo.getDeviceInfo(AppData.connectingDeviceId, function (res) {
				if (res) {
					that.handleGetValue();
					that.handleDealBleBroke()
				}
			})
		}
	},
	onUnload: function (params) {
		AppData.bleWatchingFun = () => {
			console.log('连接状态修改')
		};
	},

	handleGetValue() {
		this.setData({
			temperature: AppData.temperature,
			tempTiming: AppData.tempTiming.toString(),
			tempPower: AppData.tempTiming === 0 ? false : true,
			kneadModel: AppData.kneadDirection,
			kneadDegree: AppData.kneadDegree,
			power: (AppData.kneadDirection > 0 || AppData.tempTiming > 0) ? true : false
		}, () => {
			this.handleNotify()
		})
	},

	// 拖拽揉捏控件
	handleTouchEndKnead: function (e) {
		let degree = e.detail == 0 ? 1 :
			e.detail == 50 ? 2 : 3;
		this.handleKneadDegree(degree)
	},

	// 点击力度
	handleTouchKnead: function (e) {
		let degree = Number(e.currentTarget.dataset.degree)
		this.handleKneadDegree(degree)
	},

	// ———————————— 设备控制-其他 ————————————

	// 揉捏方向
	handleKneadModel: function () {
		let value = this.data.kneadModel == 1 ? 2 : this.data.kneadModel == 2 ? 3 : this.data.kneadModel == 3 ? 0 : 1;
		if (value == 0) {
			this.handleKnead(0, 0)
		} else {
			let degree = this.data.kneadDegree;
			if (degree == 0) {
				degree = 1
			}
			this.handleKnead(value, degree)
		}
	},

	// 揉捏力度
	handleKneadDegree: function (degree) {
		let value = this.data.kneadDegree;
		if (this.data.kneadModel == 0) {
			this.setData({
				kneadDegree: 0
			}, () => {
				this.setData({
					kneadDegree: value
				})
				wx.showToast({
					title: '揉捏未开启',
					icon: 'none'
				})
			})
		} else if (degree == value) {
			this.setData({
				kneadDegree: 0
			}, () => {
				this.setData({
					kneadDegree: value
				})
			})
		} else {
			this.handleKnead(this.data.kneadModel, degree)
		}
	},

	// 揉捏
	handleKnead: function (kneadModel, kneadDegree) {
		if (this.data.power) {
			let that = this;
			wx.showLoading({
				title: '控制中',
			})
			DeviceFunction.handleKnead(AppData.connectingDeviceId, kneadModel, kneadDegree, 15).then(() => {
				that.setData({
					kneadModel: kneadModel,
					kneadDegree: kneadDegree
				}, () => {
					wx.hideLoading();
					wx.showToast({
						title: '控制成功',
						mask: false
					})
				})
			})
		} else {
			this.setData({
				kneadDegree: this.data.kneadDegree
			}, () => {
				wx.showToast({
					title: '设备未开启',
					icon: 'none'
				})
			})
		}
	},

	// 开关机
	handleSwichPower: function (e) {
		wx.showLoading({
			title: '控制中',
		})
		let that = this;
		if (this.data.power) {
			DeviceFunction.handleKnead(AppData.connectingDeviceId, 0, 0).then(() => {
				DeviceFunction.handleTemperature(AppData.connectingDeviceId, 0, 0).then(() => {
					that.setData({
						power: false,
						temperature: 0,
						tempTiming: 0,
						tempPower: false,
						kneadModel: 0,
						kneadDegree: 0,
					}, () => {
						wx.hideLoading();
						wx.showToast({
							title: '控制成功',
							mask: false
						})
					})
				})
			})
		} else {
			DeviceFunction.handleKnead(AppData.connectingDeviceId, 3, 1, 15).then(() => {
				that.setData({
					power: true,
					kneadModel: 3,
					kneadDegree: 1,
				}, () => {
					wx.hideLoading();
					wx.showToast({
						title: '控制成功',
						mask: false
					})
				})
			})
		}
	},

	// ———————————— 设备控制-加热 ————————————

	handleSliderTiming: function (e) {
		let num = e.detail == 0 ? 10 : e.detail == 20 ? 20 : e.detail == 40 ? 30 : e.detail == 60 ? 40 : e.detail == 80 ? 50 : 60,
			that = this;
		let temp = that.data.temperature,
			value = temp == 40 ? 40 : temp == 45 ? 50 : temp == 50 ? 60 : temp == 55 ? 80 : 100;
		DeviceFunction.handleTemperature(AppData.connectingDeviceId, value, num).then(() => {
			that.setData({
				tempTiming: num
			}, () => {
				wx.hideLoading();
				wx.showToast({
					title: '控制成功',
					mask: false
				})
			})
		})
	},

	// 点击加热定时控件
	handleTouchEndTime: function (e) {
		if (this.data.tempPower) {
			let num = e.currentTarget.dataset.time,
				that = this;
			let temp = that.data.temperature,
				value = temp == 40 ? 40 : temp == 45 ? 50 : temp == 50 ? 60 : temp == 55 ? 80 : 100;
			DeviceFunction.handleTemperature(AppData.connectingDeviceId, value, num).then(() => {
				that.setData({
					tempTiming: num
				}, () => {
					wx.hideLoading();
					wx.showToast({
						title: '控制成功'
					})
				})
			})
		} else {
			wx.showToast({
				icon: 'none',
				title: '温控未开启',
			})
		}
	},

	// 开启加热
	handleStartTemp: function () {
		let that = this;
		if (!this.data.power) {
			wx.showToast({
				title: '设备未开启',
				icon: 'none'
			})
		} else {
			if (!this.data.tempPower) {
				DeviceFunction.handleTemperature(AppData.connectingDeviceId, 60, 30).then(res => {
					wx.hideLoading()
					that.setData({
						tempPower: true,
						tempTiming: 30,
						temperature: 50
					}, () => {
						wx.showToast({
							title: '开启成功',
						})
					})
				});
			} else {
				DeviceFunction.handleTemperature(AppData.connectingDeviceId, 0, 0).then(res => {
					wx.hideLoading()
					that.setData({
						tempPower: false,
						tempTiming: 0,
						temperature: 0
					}, () => {
						wx.showToast({
							title: '关闭成功',
						})
					})
				});
			}
		}
	},

	// 控制温度
	handleTemp: function (e) {
		if (this.data.tempPower) {
			let temp = Number(this.data.temperature),
				flag = Number(e.currentTarget.dataset.flag),
				that = this;
			if ((temp > 40 && flag != 1) || (temp < 60 && flag == 1)) {
				wx.showLoading({
					title: '控制中',
				})
				temp = flag == 1 ? (temp + 5) : (temp - 5)
				let value = temp == 40 ? 40 : temp == 45 ? 50 : temp == 50 ? 60 : temp == 55 ? 80 : 100;
				DeviceFunction.handleTemperature(AppData.connectingDeviceId, value, that.data.tempTiming).then(() => {
					that.setData({
						temperature: temp,
						tempTiming: that.data.tempTiming
					}, () => {
						wx.hideLoading();
						wx.showToast({
							title: '控制成功',
							mask: false
						})
					})
				})
			}
		} else {
			wx.showToast({
				title: '加热未开启',
				icon: 'none'
			})
		}
	},

	// ———————————— 监听数据 ————————————

	handleNotify: function () {
		let that = this;
		wx.onBLECharacteristicValueChange((result) => {
			that.handleDealNotify(result);
		})
		wx.notifyBLECharacteristicValueChange({ // 监听温控
			deviceId: AppData.connectingDeviceId,
			serviceId: AppData.services.temp[0],
			characteristicId: AppData.services.temp[1],
			state: true,
			success: () => {
				wx.notifyBLECharacteristicValueChange({ // 监听揉捏
					deviceId: AppData.connectingDeviceId,
					serviceId: AppData.services.knead[0],
					characteristicId: AppData.services.knead[1],
					state: true,
				})
			},
		})
	},

	handleDealNotify: function (result) {
		let value = Utils.ab2hex(result.value);
		if (result.characteristicId == AppData.services.temp[1]) {
			let timeA = value.substring(4, 6),
				timeB = value.substring(2, 4),
				temp = value.substring(0, 2);
			let tempFlagList = {
				'0': 0,
				'40': 40,
				'50': 45,
				'60': 50,
				'80': 55,
				'100': 60,
			}
			console.log('收到设备温度变化', parseInt('0x' + temp), parseInt('0x' + timeA + timeB))
			this.setData({
				temperature: tempFlagList[parseInt('0x' + temp).toString()],
				tempTiming: parseInt('0x' + timeA + timeB).toString(),
				tempPower: parseInt('0x' + timeA + timeB) > 0 ? true : false,
				power: this.data.kneadModel > 0 || parseInt('0x' + timeA + timeB) > 0 ? true : false
			});
		}
		if (result.characteristicId == AppData.services.knead[1]) {
			let direction = Number(value.substring(0, 2)),
				degree = Number(value.substring(2, 4));
			console.log('收到设备揉捏变化', direction, degree)
			this.setData({
				kneadModel: direction,
				kneadDegree: degree,
				power: direction > 0 || this.data.tempTiming > 0 ? true : false
			})
		}
	},

	// —————————————— 其他 ———————————————

	// 断开连接处理
	handleDealBleBroke: function () {
		let that = this;
		AppData.bleWatchingFun = () => {
			wx.showModal({
				content: '与蓝牙设备连接异常',
				cancelText: '返回首页',
				confirmText: '重新连接',
				success: res => {
					if (res.confirm) {
						BleReconnect.reConnect(AppData.connectingDeviceId, () => {
							that.handleGetValue()
						})
					} else {
						wx.reLaunch({
							url: '../index/index',
						})
					}
				}
			})
		};
	},

	// 前往介绍
	goInroduce: function () {
		wx.navigateTo({
			url: '../Introduce/Introduce',
		})
	},
})