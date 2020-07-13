var aesjs = require('aes-js');
var utils = require('./util');

var handleEncryptCBC = function (text) {
	let k = utils.string2BitArr('loufeng123456789')
	console.log('aes密钥xx', utils.ab2hex(k))
	console.log('aes密钥', utils.string2hex('loufeng123456789'))
	var textBytes = aesjs.utils.utf8.toBytes(text);
	var aesCbc = new aesjs.ModeOfOperation.cbc(k, k);
	var encryptedBytes = aesCbc.encrypt(textBytes);
	var encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
	return encryptedHex.toUpperCase(); // 返回大写的Hex数据
}

module.exports = {
	handleEncryptCBC: handleEncryptCBC,
}