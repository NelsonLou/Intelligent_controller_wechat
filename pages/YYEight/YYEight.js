const AppData = getApp().globalData;
const DeviceFunction = require('../../utils/BLE/deviceFuntion');
import BleReconnect from '../../utils/BLE/bleReconnect'

Page({
    data: {
        scrollArrDegree: {
            '3': 0,
            '2': 70,
            '1': 140
        },
        scrollArrTemp: {
            '40': 300,
            '45': 227,
            '50': 152,
            '55': 76,
            '60': 0
        },
        scrollArrTiming: {
            '10': 300,
            '20': 240,
            '30': 180,
            '40': 120,
            '50': 60,
            '60': 0
        },
        bodyHeight: 0,
        temperature: 50,
        timing: 0,
        power: false,
        degree: 1,
        gas: 1,
        model: 1
    },

    onLoad: function (options) {
        let objD = Object.assign({}, this.data.scrollArrDegree),
            objTe = Object.assign({}, this.data.scrollArrTemp),
            objTi = Object.assign({}, this.data.scrollArrTiming)
        for (let i in objD) {
            objD[i] = objD[i] / AppData.widthProp;
        }
        for (let i in objTe) {
            objTe[i] = objTe[i] / AppData.widthProp;
        }
        for (let i in objTi) {
            objTi[i] = objTi[i] / AppData.widthProp;
        }
        this.setData({
            // bodyHeight: AppData.windowHeight - AppData.menuButtonTop - AppData.menuBtnHeight - 12,
            bodyHeight: AppData.windowHeight,
            scrollArrDegree: objD,
            scrollArrTemp: objTe,
            scrollArrTiming: objTi,
            deviceId: AppData.connectingDeviceId,
        })
    },

    onShow: function () {
        this.handleGetValue();
        this.handleDealBleBroke();
    },

    handleTouchEndTemp: function (e) {
        let num = e.changedTouches[0].clientX,
            temp = 0;
        // 40 113 187 261 336 
        if (num >= 298) {
            temp = 60;
        } else if (num < 298 && num >= 224) {
            temp = 55;
        } else if (num < 224 && num >= 150) {
            temp = 50;
        } else if (num < 150 && num >= 77) {
            temp = 45;
        } else if (num < 77) {
            temp = 40;
        }
        this.handleSetTemp(temp);
    },

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
        this.handleSwitchTimer(time)
    },

    handleTouchEndDegree: function (e) {
        let num = e.changedTouches[0].clientX,
            degree = 0;
        // 199 266 337 
        if (num >= 301) {
            degree = 3;
        } else if (num < 301 && num >= 233) {
            degree = 2
        } else if (num < 233) {
            degree = 1;
        }
        this.handleDegree(degree)
    },

    handleGetValue: function () {
        this.setData({
            temperature: AppData.temperature,
            timing: AppData.timing,
            model: AppData.massageModel,
            degree: AppData.massageDegree,
            gas: AppData.gas,
            power: AppData.timing == 0 ? false : true
        })
    },

    goInroduce: function () {
        wx.navigateTo({
            url: '../Introduce/Introduce',
        })
    },

    // ——————————设备交互————————————

    // 切换模式
    handleModel: function (e) {
        if (this.data.power) {
            if (e.currentTarget.dataset.flag == this.data.model) {
                this.handleMassage(0, 0)
            } else {
                let degree = this.data.degree;
                if (degree == 0) {
                    degree = 1
                }
                this.handleMassage(e.currentTarget.dataset.flag, degree)
            }
        } else {
            wx.showToast({
                title: '设备未开机',
                icon: 'none'
            })
        }
    },

    // 设置力度
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
            } else if (degree == value) {
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
                degree: this.data.degree
            }, () => {
                wx.showToast({
                    title: '设备未开机',
                    icon: 'none'
                })
            })
        }
    },

    // 设置模式
    handleMassage: function (model, degree) {
        let that = this
        wx.showLoading({
            title: '控制中',
        })
        DeviceFunction.handleMassage(that.data.deviceId, model, degree).then(res => {
            that.setData({
                model: model,
                degree: degree,
            }, () => {
                wx.hideLoading()
                wx.showToast({
                    title: '控制成功',
                    mask: false
                })
            })
        })
    },

    // 充放气
    handleGas: function (e) {
        if (this.data.power) {
            let that = this,
                value = Number(e.currentTarget.dataset.flag);
            wx.showLoading({
                title: '控制中',
            })
            if (value == this.data.gas) {
                value = 0
            }
            DeviceFunction.handleGas(AppData.connectingDeviceId, value).then(res => {
                that.setData({
                    gas: value,
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

    // 设置温度
    handleSetTemp: function (temp) {
        let value = this.data.temperature;
        if (!this.data.power) {
            this.setData({
                temperature: 0
            }, () => {
                this.setData({
                    temperature: value
                })
                wx.showToast({
                    title: '设备未开启',
                    icon: 'none'
                })
            })
        } else if (temp == value) {
            this.setData({
                temperature: 0
            }, () => {
                this.setData({
                    temperature: value
                })
            })
        } else {
            let that = this;
            wx.showLoading({
                title: '控制中',
            })
            let value = temp == 40 ? 40 : temp == 45 ? 50 : temp == 50 ? 60 : temp == 55 ? 80 : 100;
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
    },

    // 设置定时
    handleSwitchTimer: function (time) {
        let value = this.data.timing;
        if (!this.data.power) {
            this.setData({
                timing: 0
            }, () => {
                this.setData({
                    timing: value
                })
                wx.showToast({
                    title: '设备未开机',
                    icon: 'none',
                })
            })
        } else if (time == value) {
            this.setData({
                timing: 0
            }, () => {
                this.setData({
                    timing: value
                })
            })
        } else {
            wx.showLoading({
                title: '设置中',
            })
            let deviceId = this.data.deviceId;
            DeviceFunction.handleTimer(deviceId, time).then(res => {
                this.setData({
                    timing: time
                }, () => {
                    wx.hideLoading()
                    wx.showToast({
                        title: '设置完成',
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
                    model: 0,
                    gas: 0,
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
                        DeviceFunction.handleGas(AppData.connectingDeviceId, 1).then(() => {
                            that.setData({
                                timing: 30,
                                power: true,
                                degree: 1,
                                model: 1,
                                gas: 1,
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