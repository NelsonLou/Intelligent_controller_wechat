const AppData = getApp().globalData;
const GetServices = require('./getService');
const GetDeviceInfo = require('./getDeviceInfo');

import BleTools from './bleTools'

const reConnect = function (deviceId, callback) {
    wx.showLoading({
        title: '设备重连中',
        mask: true,
    });
    handleCloseBle(deviceId, callback)
}

// 关闭小程序蓝牙适配器
const handleCloseBle = function (deviceId, callback) {
    console.log('重连，关闭蓝牙适配器');
    wx.closeBluetoothAdapter({
        success(res) {
            handleOpenBle(deviceId, callback)
        },
        fail(err) {
            console.log('重连，关闭蓝牙适配器失败', err);
            result(deviceId, false, callback)
        }
    })
}

// 检测蓝牙状态
const handleOpenBle = function (deviceId, callback) {
    console.log('重连，检测蓝牙状态');
    wx.openBluetoothAdapter({
        success: function (res) {
            handleConnect(deviceId, callback)
        },
        fail: function (err) {
            console.log('重连，开启蓝牙适配器失败', err)
            result(deviceId, false, callback)
        }
    })
}

// 连接设备
const handleConnect = function (deviceId, callback) {
    console.log('重连，开始连接设备');
    wx.createBLEConnection({
        deviceId,
        success: function (res) {
            AppData.services = BleTools.serviceList // 重制全局服务列表
            GetServices.getServices(function () { // 重新连接之后必须重新获取服务，相当于打开可调用服务的开关
                console.log('获取设备服务列表', AppData.services);
                getDeviceInfo(deviceId, true, callback);
            })
        },
        fail: function (err) {
            console.log('重连，连接蓝牙设备失败', err);
            result(deviceId, false, callback)
        },
    })
}

// 获取设备信息
const getDeviceInfo = function (deviceId, callback) {
    GetDeviceInfo.getDeviceInfo(AppData.connectingDeviceId, function (res) {
        if (res) {
            result(deviceId, true, callback)
        } else {
            BleTools.handleDisConnect(AppData.connectingDeviceId);
            result(deviceId, false, callback)
        }
    })
}

// 蓝牙重连结果
const result = function (deviceId, flag, callback) {
    wx.hideLoading();
    wx.showModal({
        content: flag ? '蓝牙重连成功' : '蓝牙重连失败，请检查设备',
        cancelText: '返回首页',
        confirmText: flag ? '确认' : '重新尝试',
        showCancel: flag ? false : true,
        success: res => {
            if (res.confirm) {
                if (!flag) {
                    reConnect(deviceId, callback)
                } else {
                    AppData.isConnecting = true
                    callback()
                }
            } else {
                console.log('重连异常', err);
                wx.reLaunch({
                    url: '../../pages/index/index',
                })
            }
        }
    })
}

module.exports = {
    reConnect: reConnect
}