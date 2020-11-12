const AppData = getApp().globalData;
const DeviceFunction = require('../../utils/BLE/deviceFuntion')
import Dialog from 'vant-weapp/dialog/dialog';


Page({
    data: {
        scrollArrTiming: {
            '10': 310,
            '20': 240,
            '30': 178,
            '40': 120,
            '50': 60,
            '60': 0
        },
        scrollArrDegree: {
            '1': 138,
            '2': 70,
            '3': 0
        },
        kneadScrollNum: 0,
        bodyHeight: 0,
        temperature: 0,
        timing: 0,
        degree: 0,
        power: false,
        kneadModel: 0,
        kneadDegree: 0,
        tempList: [10, 20, 30, 40, 50, 60],
        tempPower: false,
        tempTiminig: 30,
        showDialog: false,
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
            bodyHeight: AppData.windowHeight - AppData.menuButtonTop - AppData.menuBtnHeight - 12,
            scrollArrTiming: objTi,
            scrollArrDegree: objD,
        })
    },

    onShow: function () {
        this.handleGetValue()
    },

    handleGetValue() {
        this.setData({
            temperature: 45,
            timing: 50,
            kneadModel: AppData.kneadDirection,
            kneadDegree: AppData.kneadDegree,
            power: true
        })
    },

    // 拖拽控件
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

    handleTouchEndKnead: function (e) {
        let num = e.changedTouches[0].clientX,
            degree = 0;
        // 206 276 346 
        if (num <= 241) {
            degree = 1
        } else if (num > 241 && num <= 311) {
            degree = 2
        } else if (num > 311) {
            degree = 3
        }
        this.handleKneadDegree(degree)
    },

    // 控制温度
    handleTemp: function (e) {
        if (this.data.power) {
            let temp = Number(this.data.temperature),
                flag = Number(e.currentTarget.dataset.flag),
                that = this;
            if ((temp > 40 && flag != 1) || (temp < 60 && flag == 1)) {
                wx.showLoading({
                    title: '控制中',
                })
                temp = flag == 1 ? (temp + 5) : (temp - 5)
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
        } else {
            wx.showToast({
                title: '设备未开启',
                icon: 'none'
            })
        }
    },

    // 揉捏方向
    handleKneadModel: function () {
        let value = this.data.kneadModel == 1 ? 2 : this.data.kneadModel == 2 ? 3 : this.data.kneadModel == 3 ? 0 : 1;
        console.log()
        if (value == 0) {
            this.handleKnead(0, 0)
        } else {
            let degree = this.data.kneadDegree;
            if (degree == 0) {
                degree = 1
            }
            this.handleKnead(value, degree)
        }
    },

    // 揉捏力度
    handleKneadDegree: function (degree) {
        console.log(degree);
        let value = this.data.kneadDegree;
        if (this.data.kneadModel == 0) {
            this.setData({
                kneadDegree: 0
            }, () => {
                this.setData({
                    kneadDegree: value
                })
                wx.showToast({
                    title: '揉捏未开启',
                    icon: 'none'
                })
            })
        } else if (degree == value) {
            this.setData({
                kneadDegree: 0
            }, () => {
                this.setData({
                    kneadDegree: value
                })
            })
        } else {
            this.handleKnead(this.data.kneadModel, degree)
        }
    },

    // 揉捏
    handleKnead: function (kneadModel, kneadDegree) {
        if (this.data.power) {
            let that = this;
            wx.showLoading({
                title: '控制中',
            })
            DeviceFunction.handleKnead(AppData.connectingDeviceId, kneadModel, kneadDegree).then(() => {
                that.setData({
                    kneadModel: kneadModel,
                    kneadDegree: kneadDegree
                }, () => {
                    wx.hideLoading();
                    wx.showToast({
                        title: '控制成功',
                        mask: false
                    })
                })
            })
        } else {
            this.setData({
                kneadDegree: this.data.kneadDegree
            }, () => {
                wx.showToast({
                    title: '设备未开启',
                    icon: 'none'
                })
            })
        }
    },

    // 定时
    handleSwitchTimer: function (timing) {
        let value = this.data.timing;
        if (this.data.power) {
            if (timing == value) {
                this.setData({
                    timing: 0
                }, () => {
                    this.setData({
                        timing: value
                    })
                })
            } else {
                let that = this;
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
        } else {
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
            })
        }
    },

    // 开关机
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
                    kneadModel: 0,
                    kneadDegree: 0,
                    temperature: 0,
                }, () => {
                    wx.hideLoading()
                    wx.showToast({
                        title: '控制成功',
                        icon: 'none'
                    })
                })
            })
        } else {
            DeviceFunction.handleTimer(AppData.connectingDeviceId, 30).then(() => {
                DeviceFunction.handleTemperature(AppData.connectingDeviceId, 60).then(() => {
                    DeviceFunction.handleKnead(AppData.connectingDeviceId, 3, 1).then(() => {
                        that.setData({
                            timing: 30,
                            power: true,
                            kneadModel: 3,
                            kneadDegree: 1,
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
        }
    },

    // 前往介绍
    goInroduce: function () {
        wx.navigateTo({
            url: '../Introduce/Introduce',
        })
    },

    handleStartTemp: function (params) {
        this.setData({
            tempPower: !this.data.tempPower,
            temperature: this.data.tempPower ? 0 : 50,
            tempTiminig: this.data.tempPower ? 0 : 30,
        })
    },
    handleChoseTempTiming: function () {
        this.setData({
            showDialog: true
        })
    },
    handleConfirm: function (val) {
        this.setData({
            tempPower: true,
            temperature: this.data.tempPower ? this.data.temperature : 50,
            tempTiminig: val.detail.value,
            showDialog: false
        })
    }
})