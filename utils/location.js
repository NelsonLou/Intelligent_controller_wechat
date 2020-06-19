const QQMapWX = require('qqmap-wx-jssdk');
const qqmapsdk = new QQMapWX({
	key: 'XRKBZ-WS26D-KDY4E-POSNQ-PEIEE-MQBUD'
})
 
const getLocation = function(){
	let result = null,
		cCode = null
	return new Promise(function(reslove,reject){
		wx.authorize({
			scope: 'scope.userLocation',
			success() {
				// 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
				wx.getLocation({
					success: res => {
						qqmapsdk.reverseGeocoder({
							location: {
								longitude: res.longitude,
								latitude: res.latitude
							},
							success: function(resMap) {
								result = resMap.result.ad_info
								cCode = result.city_code.split(result.nation_code)[1]
								reslove({
									pCode:(Number(result.adcode) - Number(result.adcode)%1000),
									pName: result.province,
									cCode: cCode,
									cName: result.city,
									counCode: result.adcode,
									counName: result.district
								})
							},
							fail: function(err) {
								console.log('QQmap获取设备定位失败',err);
								reject()
							}
						})
					},
					fail: err => {
						console.log('微信获取用户定位权限失败',err);
						reject()
					},
				})
			},
			fail: function(err){
				console.log('获取用户定位权限失败',err);
				reject()
			}
		})
	})
}

module.exports = {
	getLocation: getLocation
}