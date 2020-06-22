const AppData = getApp().globalData;
const Utils = require('../../utils/util');
import BleTools from '../../utils/bleTools.js';

Page({
	data: {
		bodyHeight: 0,
		temperature: 30,
		timing: 10,
		power: false,
	},

	onLoad: function (options) {
		this.setData({
			bodyHeight: AppData.windowHeight - AppData.menuButtonTop - AppData.menuBtnHeight - 12,
		})
		that.getBLEDeviceServices()
	},

	onShow: function () {
	},

	// 页面隐藏时关闭定时器以及设备搜索
	onHide: function () {
	},

	// 页面隐藏时关闭定时器以及设备搜索
	onUnload: function () {
	},

	handleAdd: function () {
		let temperature = this.data.temperature
		if (temperature < 50) {
			this.setData({
				temperature: temperature + 5
			})
		}
	},

	handleSub: function () {
		let temperature = this.data.temperature
		if (temperature > 30) {
			this.setData({
				temperature: temperature - 5
			})
		}
	},

	handleSwitchTimer: function (e) {
		if (this.data.timing != e.currentTarget.dataset.time) {
			this.setData({
				timing: e.currentTarget.dataset.time
			})
		}
	},

	handleSwichPower: function () {
		let flag = this.data.power;
		this.setData({
			power: !flag
		});
	},

	goInroduce: function () {
		wx.navigateTo({
			url: '../Introduce/Introduce',
		})
	},

	//  测试主板
	getBLEDeviceServices: function () {
		wx.showLoading({
		  	title: '正在写入数据',
		})
		BleTools.getCharacteristicsValue(AppData.connectingDeviceId, 'AE00', 'AE01').then(res => {
			let value = Utils.hex2ab('A00100000702011E0302000A6EE8EF')
			BleTools.handleWrite(AppData.connectingDeviceId, res.serviceId, res.characteristicId, value).then(res=>{
				wx.hideLoading()
				wx.showToast({
				  	title: '写入成功',
				})
			}).catch(err=>{
				wx.hideLoading()
				wx.showModal({
					content: '写入失败',
				  	showCancel: false,
				})
			})
		}).catch(err=>{
			wx.hideLoading()
			wx.showModal({
				content: '读取特征值失败',
				  showCancel: false,
			})
		})
	}
})