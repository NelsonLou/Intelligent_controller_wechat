
const randomString = function () {
	let len = 16;
	var $chars = 'abcdefhijkmnprstwxyz12345678';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
	var maxPos = $chars.length;
	var pwd = '';
	for (let i = 0; i < len; i++) {
		pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
	}
	return pwd;
}

const ab2hex = function (buffer) {
	let hexArr = Array.prototype.map.call(
		new Uint8Array(buffer),
		function (bit) {
			return ('00' + bit.toString(16)).slice(-2)
		}
	)
	return hexArr.join('');
}

const hex2ab = function (hex) {
	var typedArray = new Uint8Array(hex.match(/[\da-f]{2}/gi).map(function (h) {
		return parseInt(h, 16)
	}))
	var buffer = typedArray.buffer
	return buffer
}

const int2hex = function (num) {
	let str = num.toString(16).toUpperCase()
	if (str.length < 2) {
		return '0' + str
	} else {
		return str
	}
};

const string2hex = function (str) {
	var val = "";
	for (var i = 0; i < str.length; i++) {
		if (val == "")
			val = str.charCodeAt(i).toString(16);
		else
			val += str.charCodeAt(i).toString(16);
	}
	return val.toLocaleUpperCase()
}

const hex2string = function (longhex) {
	var str = '',
		hex = '',
		i = null
	for (i = 0; i < longhex.length; i = i + 2) {
		hex = '0x' + longhex.substring(i, i + 2)
		str = str + String.fromCharCode(hex)
	}
	return str
}

const string2BitArr = function (string) {
	let arr = []
	for (let i = 0; i < string.length; i++) {
		arr.push(parseInt(string[i].charCodeAt()))
	}
	return arr
}

const hex2Int = function (hex) {
	var len = hex.length, a = new Array(len), code;
	for (var i = 0; i < len; i++) {
		code = hex.charCodeAt(i);
		if (48 <= code && code < 58) {
			code -= 48;
		} else {
			code = (code & 0xdf) - 65 + 10;
		}
		a[i] = code;
	}

	return a.reduce(function (acc, c) {
		acc = 16 * acc + c;
		return acc;
	}, 0);
}

// 获取激活码异常的处理
const activeErrorDeal = function (code) {
	switch (code) {
		case -100:
			return "激活失败"
			break;
		case -200:
			return "验证码失效"
			break;
		case -101:
			return "激活码生成失败"
			break;
		case -102:
			return "超过激活次数"
			break;
		case -103:
			return "存在关联设备"
			break;
		default:
			return "服务器异常"
			break;
	}
}

module.exports = {
	hex2string: hex2string,
	string2hex: string2hex,
	ab2hex: ab2hex,
	hex2ab: hex2ab,
	hex2Int: hex2Int,
	string2BitArr: string2BitArr,
	activeErrorDeal: activeErrorDeal,
	int2hex: int2hex,
	randomString: randomString,
}
