const AppData = getApp().globalData;
const DeviceFunction = require('../../utils/BLE/deviceFuntion')
import Dialog from 'vant-weapp/dialog/dialog';


Page({
    data: {
        // 滚动相关
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
        power: false,
        kneadModel: 0,
        kneadDegree: 0, // 按摩登记
        tempList: [10, 20, 30, 40, 50, 60], // 温度列表
        tempTiming: 0, // 温度定时
        tempPower: false, // 加热开关
        showDialog: false, // 展示弹窗
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
        this.handleGetValue();
    },

    handleGetValue() {
        this.setData({
            temperature: AppData.temperature,
            tempTiming: AppData.tempTiming,
            tempPower: AppData.tempTiming === 0 ? false : true,
            kneadModel: AppData.kneadDirection,
            kneadDegree: AppData.kneadDegree,
            power: AppData.timing == 0 ? false : true,
        }, () => {
            this.handleNotify()
        })
    },

    // 拖拽加热定时控件
    handleTouchEndTime: function (e) {
        // 37 97 157 217 277 337
        let num = e.changedTouches[0].clientX,
            that = this,
            tempTiming = 0;
        if (num > 307) {
            tempTiming = 60
        } else if (num <= 307 && num > 247) {
            tempTiming = 50
        } else if (num <= 247 && num > 187) {
            tempTiming = 40
        } else if (num <= 187 && num > 127) {
            tempTiming = 30
        } else if (num <= 127 && num > 67) {
            tempTiming = 20
        } else if (num <= 67) {
            tempTiming = 10
        }
        DeviceFunction.handleTemperature(AppData.connectingDeviceId, that.data.temperature, tempTiming).then(() => {
            that.setData({
                tempTiming: tempTiming
            }, () => {
                wx.hideLoading();
                wx.showToast({
                    title: '控制成功',
                    mask: false
                })
            })
        })
    },

    // 拖拽揉捏控件
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

    // ———————————— 设备控制-其他 ————————————

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
                }, () => {
                    wx.hideLoading();
                    wx.showToast({
                        title: '控制成功',
                        icon: 'none'
                    })
                })
            })
        } else {
            DeviceFunction.handleTimer(AppData.connectingDeviceId, 30).then(() => {
                DeviceFunction.handleKnead(AppData.connectingDeviceId, 3, 1).then(() => {
                    that.setData({
                        timing: 30,
                        power: true,
                        kneadModel: 3,
                        kneadDegree: 1,
                    }, () => {
                        wx.hideLoading();
                        wx.showToast({
                            title: '控制成功',
                            mask: false
                        })
                    })
                })
            })
        }
    },



    // ———————————— 设备控制-加热 ————————————

    // 开启加热
    handleStartTemp: function () {
        let that = this;
        if (!this.data.tempPower) {
            DeviceFunction.handleTemperature(AppData.connectingDeviceId, 60, 30).then(res => {
                wx.hideLoading()
                that.setData({
                    tempPower: true,
                    tempTiming: 30,
                    temperature: 60
                }, () => {
                    wx.showToast({
                        title: '开启成功',
                    })
                })
            });
        } else {
            DeviceFunction.handleTemperature(AppData.connectingDeviceId, 0, 0).then(res => {
                wx.hideLoading()
                that.setData({
                    tempPower: false,
                    tempTiming: 0,
                    temperature: 0
                }, () => {
                    wx.showToast({
                        title: '关闭成功',
                    })
                })
            });
        }
    },

    // 控制温度
    handleTemp: function (e) {
        if (this.data.tempPower) {
            let temp = Number(this.data.temperature),
                flag = Number(e.currentTarget.dataset.flag),
                that = this;
            if ((temp > 40 && flag != 1) || (temp < 60 && flag == 1)) {
                wx.showLoading({
                    title: '控制中',
                })
                temp = flag == 1 ? (temp + 5) : (temp - 5)
                let value = temp == 40 ? 40 : temp == 45 ? 50 : temp == 50 ? 60 : temp == 55 ? 80 : 100;
                DeviceFunction.handleTemperature(AppData.connectingDeviceId, value, that.data.tempTiming).then(() => {
                    that.setData({
                        temperature: temp
                    }, () => {
                        wx.hideLoading();
                        wx.showToast({
                            title: '控制成功',
                            mask: false
                        })
                    })
                })
            }
        } else {
            wx.showToast({
                title: '加热未开启',
                icon: 'none'
            })
        }
    },

    // ———————————— 监听数据 ————————————
    handleNotify: function () {
        let that = this;
        wx.onBLECharacteristicValueChange((result) => {
            that.handleDealNotify(result);
        })
        wx.notifyBLECharacteristicValueChange({
            deviceId: AppData.connectingDeviceId,
            serviceId: AppData.services.temp[0],
            characteristicId: AppData.services.temp[1],
            state: true,
            success: () => {
                wx.notifyBLECharacteristicValueChange({
                    deviceId: AppData.connectingDeviceId,
                    serviceId: AppData.services.knead[0],
                    characteristicId: AppData.services.knead[1],
                    state: true,
                })
            },
        })
    },

    handleDealNotify: function (result) {
        let value = Utils.ab2hex(result.value);
        if (charId == AppData.services.temp[1]) {
            let timeA = value.substring(4, 6),
                timeB = value.substring(2, 4),
                temp = value.substring(0, 2);
            this.setData({
                temperature: temp,
                tempTiming: parseInt('0x' + timeA + timeB)
            })
        }
        if (charId == AppData.services.knead[1]) {
            let direction = Number(value.substring(0, 2)),
                degree = Number(value.substring(2, 4));
            this.setData({
                kneadModel: direction,
                kneadModel: degree
            })
        }
    },

    // —————————————— 其他 ———————————————

    // 前往介绍
    goInroduce: function () {
        wx.navigateTo({
            url: '../Introduce/Introduce',
        })
    },
})