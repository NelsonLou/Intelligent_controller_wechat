const AppData = getApp().globalData;
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
	}
})