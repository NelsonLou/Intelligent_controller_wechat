const AppData = getApp().globalData;
const DeviceFunction = require('../../utils/BLE/deviceFuntion');
import BleReconnect from '../../utils/BLE/bleReconnect'

Page({
    data: {
        scrollArr: {
            '10': 277,
            '20': 222,
            '30': 164,
            '40': 109,
            '50': 56,
            '60': 0
        },
        power: false, // 控制开关
        bodyHeight: 0, // 屏幕高度
        temperature: 0, // 当前温度
        timing: 0, // 定时器
        act: '', // 当前读取值
        deviceId: '',
    },

    onLoad: function (options) {
        let obj = Object.assign({}, this.data.scrollArr);
        for (let i in obj) {
            obj[i] = obj[i] / AppData.widthProp;
        }
        this.setData({
            // bodyHeight: AppData.windowHeight - AppData.menuButtonTop - AppData.menuBtnHeight - 12,
            bodyHeight: AppData.windowHeight,
            deviceId: AppData.connectingDeviceId,
            scrollArr: obj
        })
    },

    onShow: function () {
        this.handleGetValue()
        this.handleDealBleBroke();
    },

    // ——————————————滚动条相关——————————————

    handleTouchEnd: function (e) {
        let num = e.changedTouches[0].clientX,
            timing = 0;
        if (num <= 73) {
            timing = 10
        } else if (num > 73 && num <= 128) {
            timing = 20
        } else if (num > 128 && num <= 185) {
            timing = 30
        } else if (num > 185 && num <= 241) {
            timing = 40
        } else if (num > 241 && num <= 298) {
            timing = 50
        } else if (num > 298) {
            timing = 60
        }
        this.handleSwitchTimer(timing)
    },

    // ——————————————控制——————————————

    // 同步实时数据
    handleGetValue() {
        this.setData({
            temperature: AppData.temperature,
            timing: AppData.timing,
            power: AppData.timing == 0 ? false : true,
        })
    },

    // 增加温度
    handleAdd: function () {
        let temperature = this.data.temperature
        if (!this.data.power) {
            wx.showToast({
                title: '设备未开机',
                icon: 'none',
            })
        } else if (temperature < 65) {
            wx.showLoading({
                title: '设置中'
            })
            this.handleSetTemp(temperature + 5)
        }
    },

    // 减少温度
    handleSub: function () {
        let temperature = this.data.temperature
        if (!this.data.power) {
            wx.showToast({
                title: '设备未开机',
                icon: 'none',
            })
        } else if (temperature > 40) {
            wx.showLoading({
                title: '设置中'
            })
            this.handleSetTemp(temperature - 5)
        }
    },

    // 切换定时
    handleSwitchTimer: function (timing) {
        if (!this.data.power) {
            this.setData({
                timing: this.data.timing
            }, () => {
                wx.showToast({
                    title: '设备未开机',
                    icon: 'none',
                })
            })
        } else if (timing == this.data.timing) {
            let value = this.data.timing;
            this.setData({
                timing: 0
            }, () => {
                this.setData({
                    timing: value
                })
            })
        } else {
            wx.showLoading({
                title: '设置中'
            })
            this.handleSetTiming(Number(timing))
        }
    },

    // 前往说明页面
    goInroduce: function () {
        wx.navigateTo({
            url: '../Introduce/Introduce',
        })
    },

    // ————————————————————设备交互————————————————————

    // 开/关 机初始化
    handleSwichPower: function (act) {
        wx.showLoading({
            title: '控制中',
        })
        let that = this;
        if (this.data.power) {
            DeviceFunction.handleTimer(AppData.connectingDeviceId, 0).then(() => {
                that.setData({
                    temperature: 0,
                    timing: 0,
                    power: false,
                }, () => {
                    wx.hideLoading()
                    wx.showToast({
                        title: '控制成功',
                        mask: false
                    })
                })
            })
        } else {
            DeviceFunction.handleTimer(AppData.connectingDeviceId, 30).then(() => {
                DeviceFunction.handleTemperature(AppData.connectingDeviceId, 60).then(() => {
                    that.setData({
                        timing: 30,
                        power: true,
                        temperature: 50,
                    }, () => {
                        wx.hideLoading()
                        wx.showToast({
                            title: '控制成功',
                            mask: false
                        })
                    })
                })
            })
        }
    },

    // 设置温度
    handleSetTemp: function (temp) {
        let deviceId = this.data.deviceId,
            that = this,
            value = temp == 40 ? 40 : temp == 45 ? 50 : temp == 50 ? 60 : temp == 55 ? 70 : temp == 60 ? 80 : 100;
        DeviceFunction.handleTemperature(deviceId, value).then(res => {
            wx.hideLoading()
            that.setData({
                temperature: temp
            }, () => {
                wx.showToast({
                    title: '设置完成',
                })
            })
        })
    },

    // 设置定时
    handleSetTiming: function (timing) {
        let that = this,
            deviceId = this.data.deviceId;
        DeviceFunction.handleTimer(deviceId, timing).then(res => {
            wx.hideLoading()
            that.setData({
                timing: timing
            }, () => {
                wx.showToast({
                    title: '设置完成',
                })
            })
        })
    },
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
                        BleReconnect.reConnect(AppData.connectingDeviceId, () => {})
                    } else {
                        wx.reLaunch({
                            url: '../index/index',
                        })
                    }
                }
            })
        };
    },
})