const AppData = getApp().globalData;
import BleTools from '../../utils/bleTools.js';

Page({
	data: {
		bodyHeight: 0,
		temperature: 30,
		timing: 10,
		power: false,
		timers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
		timer: 0,
		gear: 1,
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

	handleGear: function (e) {
		let flag = e.currentTarget.dataset.flag
		if (flag == 0) {
			if (this.data.gear != 5) {
				this.setData({
					gear: Number(this.data.gear) + 1
				})
			}
		} else {
			this.setData({
				gear: flag
			})
		}
	},

	handleSwitchTimer: function (e) {
		this.setData({
			timer: e.currentTarget.dataset.time
		})
	},

	goInroduce: function () {
		wx.navigateTo({
			url: '../Introduce/Introduce',
		})
	}
})