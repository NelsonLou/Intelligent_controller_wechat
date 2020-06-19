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
        // 用户信息
        openId:'',
        unionId:'',
        
        // 系统相关
		menuBtnHeight: 0,
		menuButtonTop: 0,
		windowHeight: 0,
        systemType: null,
        netStatus: true, // 网络情况
        
        // 设备类
        deviceMac:'', // 设备MAC
        productKey:'', // 产品PK
        hasConnectList:[], // 已连接设备列表
        connectingDeviceId:'',  // 当前已连接设备
        wifiInfo:{}, // wifi配置详情
        deviceInfo:{}, // 当前已连接设备详情

        // 滤芯复位
        scanFilters:[], // 已扫码滤芯
        deviceFilters: [], // 设备滤芯列表

        // 用户
        activePhone:'', // 激活手机号
    }
})