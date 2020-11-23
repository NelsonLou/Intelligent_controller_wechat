// 继续设备未完成操作
// 连接设备 =》 鉴权
const AppData = getApp().globalData;
const Utils = require('../util');
import BleTools from './bleTools';

const tempList = {
    yy01: {
        '0': 0,
        '30': 30,
        '40': 35,
        '60': 40,
        '80': 45,
        '100': 50,
    },
    yy02: {
        '0': 0,
        '20': 20,
        '40': 40,
        '60': 60,
        '80': 80,
        '100': 100,
    },
    yy03: {
        '0': 0,
        '40': 40,
        '50': 45,
        '60': 50,
        '70': 55,
        '80': 60,
        '100': 65,
    },
    yy04: {
        '0': 0,
        '40': 40,
        '50': 45,
        '60': 50,
        '70': 55,
        '80': 60,
        '100': 65,
    },
    yy05: {
        '0': 0,
        '40': 40,
        '50': 45,
        '60': 50,
        '70': 55,
        '80': 60,
        '100': 65,
    },
    yy06: {
        '0': 0,
        '40': 40,
        '50': 45,
        '60': 50,
        '80': 55,
        '100': 60,
    },
    yy07: {
        '0': 0,
        '40': 40,
        '50': 45,
        '60': 50,
        '80': 55,
        '100': 60,
    },
    yy08: {
        '0': 0,
        '40': 40,
        '50': 45,
        '60': 50,
        '80': 55,
        '100': 60,
    },
    yy09: {
        '0': 0,
        '40': 40,
        '50': 45,
        '60': 50,
        '80': 55,
        '100': 60,
    },
}


const getDeviceInfo = function (deviceId, callBack) {
    handleWatchValue(deviceId, callBack)
}

const handleWatchValue = function (deviceId, callBack) {
    wx.onBLECharacteristicValueChange((result) => {
        console.log('获取返回值', result);
        BleTools.handleUnNotify(deviceId, result.serviceId, result.characteristicId);
        handleDealResult(deviceId, result, callBack);
    })
    getTemp(deviceId, callBack);
}

const handleDealResult = function (deviceId, result, callBack) {
    let value = Utils.ab2hex(result.value),
        charId = result.characteristicId;
    // 温度
    if (charId == AppData.services.temp[1]) {
        console.log('获取温度', value);
        let temperature = parseInt('0x' + value.substring(0, 2)).toString(),
            tempTiming = parseInt('0x' + value.substring(4, 6) + value.substring(2, 4));
        AppData.temperature = tempList[AppData.productType][temperature]
        AppData.tempTiming = tempTiming
        getTiming(deviceId, callBack);
    }
    // 定时
    else if (charId == AppData.services.timing[1]) {
        // 小端
        let first = value.substring(0, 2),
            last = value.substring(2, 4)
        let num = parseInt('0x' + last + first)
        AppData.timing = Number(num)
        getMassage(deviceId, callBack);
    }
    // 按摩
    else if (charId == AppData.services.massage[1]) {
        let model = Number(value.substring(0, 2)),
            degree = Number(value.substring(2, 4)),
            massageTiming = parseInt('0x' + value.substring(6, 8) + value.substring(4, 6));
        AppData.massageModel = model;
        AppData.massageDegree = degree;
        AppData.massageTiming = massageTiming;
        getVentilation(deviceId, callBack);
    }
    // 通风
    else if (charId == AppData.services.ventilation[1]) {
        let ventilation = Number(value.substring(0, 2)),
            ventilationTiming = parseInt('0x' + value.substring(4, 6) + value.substring(2, 4));
        AppData.ventilation = ventilation
        AppData.ventilationTiming = ventilationTiming
        getKnead(deviceId, callBack);
    }
    // 揉捏
    else if (charId == AppData.services.knead[1]) {
        let direction = Number(value.substring(0, 2)),
            degree = Number(value.substring(2, 4)),
            kneadTiming = parseInt('0x' + value.substring(6, 8) + value.substring(4, 6));
        AppData.kneadDirection = direction;
        AppData.kneadDegree = degree;
        AppData.kneadTiming = kneadTiming;
        getGas(deviceId, callBack);
    }
    // 充放气
    else {
        let gas = Number(value.substring(0, 2)),
            gasTiming = parseInt('0x' + value.substring(4, 6) + value.substring(2, 4));
        AppData.gas = Number(value)
        AppData.gasTiming = gasTiming
        finish(true, callBack);
    }
}

const getTemp = function (deviceId, callBack) {
    BleTools.handleRead(deviceId, AppData.services.temp[0], AppData.services.temp[1]).catch(err => {
        finish(false, callBack)
    })
}

const getTiming = function (deviceId, callBack) {
    BleTools.handleRead(deviceId, AppData.services.timing[0], AppData.services.timing[1]).catch(err => {
        finish(false, callBack)
    })
}
const getMassage = function (deviceId, callBack) {
    BleTools.handleRead(deviceId, AppData.services.massage[0], AppData.services.massage[1]).catch(err => {
        finish(false, callBack)
    })
}
const getVentilation = function (deviceId, callBack) {
    BleTools.handleRead(deviceId, AppData.services.ventilation[0], AppData.services.ventilation[1]).catch(err => {
        finish(false, callBack)
    })
}
const getKnead = function (deviceId, callBack) {
    BleTools.handleRead(deviceId, AppData.services.knead[0], AppData.services.knead[1]).catch(err => {
        finish(false, callBack)
    })
}
const getGas = function (deviceId, callBack) {
    BleTools.handleRead(deviceId, AppData.services.gas[0], AppData.services.gas[1]).catch(err => {
        finish(false, callBack)
    })
}

const finish = function (flag, callBack) {
    callBack(flag)
}

module.exports = {
    getDeviceInfo: getDeviceInfo
}