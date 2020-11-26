const AppData = getApp().globalData;
const DeviceFunction = require('../../utils/BLE/deviceFuntion');
import BleReconnect from '../../utils/BLE/bleReconnect'

Page({
    data: {
        power: false, // 控制开关
        bodyHeight: 0, // 屏幕高度
        temperature: 0, // 当前温度
        timing: 0, // 定时器
        act: '', // 当前读取值
        timers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        deviceId: '',
    },

    onLoad: function (options) {
        this.setData({
            // bodyHeight: AppData.windowHeight - AppData.menuButtonTop - AppData.menuBtnHeight - 12,
            bodyHeight: AppData.windowHeight,
            deviceId: AppData.connectingDeviceId,
        })
    },

    onShow: function () {
        this.handleGetValue()
        this.handleDealBleBroke();
    },

    handleGetValue() {
        this.setData({
            temperature: AppData.temperature,
            timing: (AppData.timing / 60).toFixed(0),
            power: AppData.timing == 0 ? false : true
        })
    },

    // 切换定时
    handleSwitchTimer: function (e) {
        if (!this.data.power) {
            wx.showToast({
                title: '设备未开机',
                icon: 'none',
            })
        } else {
            wx.showLoading({
                title: '设置中'
            })
            this.handleSetTiming(Number(e.currentTarget.dataset.time))
        }
    },

    // 前往说明页面
    goInroduce: function () {
        wx.navigateTo({
            url: '../Introduce/Introduce',
        })
    },

    // 加热
    handleGear: function (e) {
        if (this.data.power) {
            wx.showLoading({
                title: '设置中'
            })
            if (e.currentTarget.dataset.flag == 0 && this.data.temperature < 100) {
                this.handleSetTemp(Number(this.data.temperature) + 20)
            } else if (e.currentTarget.dataset.flag == 0 && this.data.temperature == 100) {
                this.handleSetTemp(20)
            } else {
                this.handleSetTemp(Number(e.currentTarget.dataset.flag))
            }
        } else {
            wx.showToast({
                title: '设备未开机',
                icon: 'none'
            })
        }
    },

    // ————————————————————设备交互————————————————————

    // 开/关 机初始化
    handleSwichPower: function (act) {
        wx.showLoading({
            title: '控制中',
        })
        let that = this;
        if (this.data.power) {
            console.log('控制关机');
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
            console.log('控制开机');
            DeviceFunction.handleTimer(AppData.connectingDeviceId, 60).then(() => {
                DeviceFunction.handleTemperature(AppData.connectingDeviceId, 60).then(() => {
                    that.setData({
                        timing: 1,
                        power: true,
                        temperature: 60,
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
            that = this;
        DeviceFunction.handleTemperature(deviceId, Number(temp)).then(res => {
            wx.hideLoading()
            that.setData({
                temperature: temp
            }, () => {
                wx.showToast({
                    title: '设置完成',
                })
            })
        }).catch(err => {
            console.log('异常', err)
            wx.showToast({
                title: '设置失败',
                icon: 'none',
            })
        });
    },

    // 设置定时
    handleSetTiming: function (num) {
        let that = this,
            timing = num * 60,
            deviceId = this.data.deviceId;
        console.log(timing)
        DeviceFunction.handleTimer(deviceId, timing).then(res => {
            wx.hideLoading()
            that.setData({
                timing: num
            }, () => {
                wx.showToast({
                    title: '设置完成',
                })
            })
        }).catch(err => {
            console.log('异常', err)
            wx.hideLoading()
            wx.showToast({
                title: '设置失败',
                icon: 'none',
            })
        });
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