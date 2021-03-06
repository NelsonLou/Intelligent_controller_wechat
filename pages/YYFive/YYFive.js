const AppData = getApp().globalData;
const DeviceFunction = require('../../utils/BLE/deviceFuntion')
import BleReconnect from '../../utils/BLE/bleReconnect'

Page({
    data: {
        scrollArrTiming: {
            '10': 310,
            '20': 240,
            '30': 180,
            '40': 120,
            '50': 60,
            '60': 0
        },
        scrollArrDegree: {
            '1': 138,
            '2': 65,
            '3': 0
        },
        bodyHeight: 0,
        temperature: 55, // 温度
        degree: 1, // 按摩力度
        effortsDegree: 1,
        timing: 30, // 定时
        model: 1, // 模式
        power: false,
    },

    onLoad: function (options) {
        let objD = Object.assign({}, this.data.scrollArrDegree),
            objTi = Object.assign({}, this.data.scrollArrTiming)
        for (let i in objD) {
            objD[i] = objD[i] / AppData.widthProp;
        }
        for (let i in objTi) {
            objTi[i] = objTi[i] / AppData.widthProp;
        }
        this.setData({
            // bodyHeight: AppData.windowHeight - AppData.menuButtonTop - AppData.menuBtnHeight - 12,
            bodyHeight: AppData.windowHeight,
            scrollArrTiming: objTi,
            scrollArrDegree: objD,
        })
    },

    onShow: function () {
        this.handleGetValue()
        this.handleDealBleBroke()
    },

    // ————————————拖拽————————————

    handleTouchEndTime: function (e) {
        let num = e.changedTouches[0].clientX,
            time = 0;
        // 37 97 157 217 277 337
        if (num > 307) {
            time = 60
        } else if (num <= 307 && num > 247) {
            time = 50
        } else if (num <= 247 && num > 187) {
            time = 40
        } else if (num <= 187 && num > 127) {
            time = 30
        } else if (num <= 127 && num > 67) {
            time = 20
        } else if (num <= 67) {
            time = 10
        }
        this.handleTiming(time)
    },

    handleTouchEndDegree: function (e) {
        let num = e.changedTouches[0].clientX,
            degree = 0;
        // 28 104 169
        if (num <= 66) {
            degree = 1
        } else if (num > 66 && num <= 137) {
            degree = 2
        } else if (num > 137) {
            degree = 3
        }
        this.handleDegree(degree)
    },

    handleGetValue() {
        this.setData({
            temperature: AppData.temperature,
            timing: AppData.timing,
            effortsDegree: AppData.ventilation,
            model: AppData.massageModel,
            degree: AppData.massageDegree,
            power: AppData.timing == 0 ? false : true
        })
    },

    // 前往功能介绍页面
    goInroduce: function () {
        wx.navigateTo({
            url: '../Introduce/Introduce',
        })
    },

    // ——————————设备交互——————————

    // 控制温度
    handleTemp: function (e) {
        if (this.data.power) {
            let temp = Number(this.data.temperature),
                flag = Number(e.currentTarget.dataset.flag),
                that = this;
            if ((temp > 40 && flag != 1) || (temp < 65 && flag == 1)) {
                wx.showLoading({
                    title: '控制中',
                })
                temp = flag == 1 ? (temp + 5) : (temp - 5)
                let value = temp == 40 ? 40 : temp == 45 ? 50 : temp == 50 ? 60 : temp == 55 ? 70 : temp == 60 ? 80 : 100;
                DeviceFunction.handleTemperature(AppData.connectingDeviceId, value).then(() => {
                    that.setData({
                        temperature: temp
                    }, () => {
                        wx.hideLoading()
                        wx.showToast({
                            title: '控制成功',
                            mask: false
                        })
                    })
                })
            }
        } else {
            wx.showToast({
                title: '设备未开启',
                icon: 'none'
            })
        }
    },

    // 控制按摩力度
    handleDegree: function (degree) {
        let value = this.data.degree;
        if (this.data.power) {
            if (this.data.model == 0) {
                this.setData({
                    degree: 0
                }, () => {
                    this.setData({
                        degree: value
                    })
                    wx.showToast({
                        title: '按摩未开启',
                        icon: 'none'
                    })
                })
            } else if (degree == this.data.degree) {
                this.setData({
                    degree: 0
                }, () => {
                    this.setData({
                        degree: value
                    })
                })
            } else {
                this.handleMassage(this.data.model, degree)
            }
        } else {
            this.setData({
                degree: 0
            }, () => {
                this.setData({
                    degree: value
                })
                wx.showToast({
                    title: '设备未开启',
                    icon: 'none'
                })
            })
        }
    },

    // 控制模式
    handleModel: function (e) {
        if (this.data.power) {
            let model = Number(e.currentTarget.dataset.flag);
            if (model == this.data.model) {
                this.handleMassage(0, 0)
            } else {
                let degree = this.data.degree;
                if (degree == 0) {
                    degree = 1
                }
                this.handleMassage(model, degree)
            }
        } else {
            wx.showToast({
                title: '设备未开启',
                icon: 'none'
            })
        }
    },

    // 按摩
    handleMassage: function (model, degree) {
        wx.showLoading({
            title: '控制中',
        })
        let that = this;
        DeviceFunction.handleMassage(AppData.connectingDeviceId, model, degree).then(() => {
            that.setData({
                degree: degree,
                model: model
            }, () => {
                wx.hideLoading()
                wx.showToast({
                    title: '控制成功',
                    mask: false
                })
            })
        })
    },

    // 通风
    handleEfforts: function (e) {
        if (this.data.power) {
            let degree = Number(e.currentTarget.dataset.flag),
                that = this;
            if (degree == this.data.effortsDegree) {
                degree = 0
            }
            wx.showLoading({
                title: '控制中',
            })
            DeviceFunction.handleVentilation(AppData.connectingDeviceId, degree).then(() => {
                that.setData({
                    effortsDegree: degree,
                }, () => {
                    wx.hideLoading()
                    wx.showToast({
                        title: '控制成功',
                        mask: false
                    })
                })
            })
        } else {
            wx.showToast({
                title: '设备未开启',
                icon: 'none'
            })
        }
    },

    // 定时
    handleTiming: function (timing) {
        let value = this.data.timing;
        if (!this.data.power) {
            this.setData({
                timing: 0
            }, () => {
                this.setData({
                    timing: value
                })
                wx.showToast({
                    title: '设备未开启',
                    icon: 'none'
                })
            });
        } else if (timing == value) {
            this.setData({
                timing: 0
            }, () => {
                this.setData({
                    timing: value
                })
            });
        } else {
            let that = this
            wx.showLoading({
                title: '控制中',
            })
            DeviceFunction.handleTimer(AppData.connectingDeviceId, timing).then(res => {
                that.setData({
                    timing: timing,
                }, () => {
                    wx.hideLoading()
                    wx.showToast({
                        title: '控制成功',
                        mask: false
                    })
                })
            })
        }
    },

    handleSwichPower: function (e) {
        wx.showLoading({
            title: '控制中',
        })
        let that = this;
        if (this.data.power) {
            DeviceFunction.handleTimer(AppData.connectingDeviceId, 0).then(() => {
                that.setData({
                    timing: 0,
                    power: false,
                    degree: 0,
                    effortsDegree: 0,
                    model: 0,
                    temperature: 0,
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
                    DeviceFunction.handleMassage(AppData.connectingDeviceId, 1, 1).then(() => {
                        DeviceFunction.handleVentilation(AppData.connectingDeviceId, 1).then(() => {
                            that.setData({
                                timing: 30,
                                power: true,
                                degree: 1,
                                effortsDegree: 1,
                                model: 1,
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
                })
            })
        }
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