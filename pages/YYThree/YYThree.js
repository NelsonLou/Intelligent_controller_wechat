const AppData = getApp().globalData;
import BleTools from '../../utils/bleTools.js';

Page({
	data: {
		bodyHeight: 0,
		temperature: 45,
		timing: 60,
		power: true,
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

	goInroduce: function(){
		wx.navigateTo({
		  	url: '../Introduce/Introduce',
		})
	}
})