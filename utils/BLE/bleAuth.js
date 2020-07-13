const Utils = require('../util');
const AesTools = require('../aesTools')
import BleTools from '../bleTools'

const getPwd = function () {
	let originPwd = Utils.randomString(),
		pwd = AesTools.handleEncryptCBC(originPwd)
	console.log('生成随机密钥', originPwd);
	console.log('生成加密密钥', pwd);
	return {
		originPwd: originPwd,
		pwd: pwd
	}
}

const writePwd = function (deviceId) {
	return new Promise(function (resolve, reject) {
		
	})
}



module.exports = {
	getPwd: getPwd,
	writePwd: writePwd
}