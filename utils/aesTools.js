var aesjs = require('aes-js');
var utils = require('./util');

var handleEncryptCBC = function (key, text) {
	let k = utils.string2BitArr(key)
	var textBytes = aesjs.utils.utf8.toBytes(text);
	var aesCbc = new aesjs.ModeOfOperation.cbc(k, k);
	var encryptedBytes = aesCbc.encrypt(textBytes);
	var encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
	return encryptedHex.toUpperCase(); // 返回大写的Hex数据
}

module.exports = {
	handleEncryptCBC: handleEncryptCBC,
}