//app.js
App({
    onLaunch: function () {
        // 获取系统信息
        wx.getSystemInfo({
            success: (res) => {
                this.globalData.systemType = res.platform
                let proportion = 750 / res.windowWidth,
                    menuButtonObject = wx.getMenuButtonBoundingClientRect() // 获取胶囊按钮信息
                this.globalData.menuBtnHeight = menuButtonObject.height * proportion // 胶囊按钮高度
                this.globalData.menuButtonTop = menuButtonObject.top * proportion // 胶囊按钮距离顶部高度
                this.globalData.windowHeight = res.windowHeight * proportion // 窗口高度
                this.globalData.hasConnectList = wx.getStorageSync('hasConnectList') || [];
                if (wx.getStorageSync('historyList')) {
                    this.globalData.historyList = JSON.parse(wx.getStorageSync('historyList'))
                }
            }
        })
    },

    globalData: {
        // 系统相关
        menuBtnHeight: 0,
        menuButtonTop: 0,
        windowHeight: 0,
        systemType: null,
        widthProp: 1,

        // 全局
        originPwd: null,
        pwd: null,
        historyList: null,
        services: null,

        // 设备类
        productType: null, // 产品属性
        deviceMac: '', // 设备MAC
        hasConnectList: [], // 已连接设备列表
        connectingDeviceId: '',  // 当前已连接设备
        deviceInfo: {}, // 当前已连接设备详情

        // 定时类
        timing: 0, // 定时
        tempTiming: 0, // 加热定时
        massageTiming: 0, // 按摩定时
        ventilationTiming: 0, // 通风定时
        kneadTiming: 0, // 揉捏定时
        gasTiming: 0, // 充放气定时
        // 属性类
        temperature: 0, // 温度
        massageModel: 0, // 按摩模式
        massageDegree: 0, // 按摩力度
        kneadDirection: 0, // 揉捏方向
        kneadDegree: 0, // 揉捏力度
        ventilation: 0, // 通风
        gas: 0, // 充放气

        // 设备类
        writeService: [],
        readService: [],
    }
})