属性下发逻辑：
    设备端设置
        A:统一定时区
            统一定时区的定时时间以AE02下发的数据为准，定时为0时关闭所有定时区内的属性/功能。
            若属性/功能下发时间字段参数为 0000 则进入统一定时区。
        
        B: 多个独立定时区。
            独立定时区的定时时间以单独属性下发时间字段数据为准，独立区定时为0时关闭该定时区绑定的属性/功能。
            若属性/功能下发时时间字段参数不为 0000 则进入独立定时区。
    