//app.js
App({
    onLaunch: function() {
        // 获取系统信息
        wx.getSystemInfo({
            success: (res) => {
                if (res.system.indexOf('ios') != -1) {
                    this.globalData.isIos = true
                } else {
                    this.globalData.isIos = false
                }
                this.globalData.systemType = res.platform
                let proportion = 750 / res.windowWidth,
                    menuButtonObject = wx.getMenuButtonBoundingClientRect() // 获取胶囊按钮信息
                this.globalData.menuBtnHeight = menuButtonObject.height * proportion // 胶囊按钮高度
                this.globalData.menuButtonTop = menuButtonObject.top * proportion // 胶囊按钮距离顶部高度
                this.globalData.windowHeight = res.windowHeight * proportion // 窗口高度
                this.globalData.hasConnectList = wx.getStorageSync('hasConnectList') || []
                this.globalData.scanFilters = wx.getStorageSync('scanFilters') || {}
            }
        })
    },

    globalData: {
        // 系统相关
		menuBtnHeight: 0,
		menuButtonTop: 0,
		windowHeight: 0,
        systemType: null,

        // 全局
        originPwd: null,
        pwd: null,
        
        // 设备类
        deviceMac:'', // 设备MAC
        hasConnectList:[], // 已连接设备列表
        connectingDeviceId:'',  // 当前已连接设备
        deviceInfo:{}, // 当前已连接设备详情

        // 设备类
        writeService:[],
        readService:[],
    }
})