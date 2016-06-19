var express = require('express');
var db = require('../utils/msdb');
var logger  = require("../utils/log").logger; //日志

var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
    console.log('进入user路由');
    res.send('respond with a resource');
});

router.post('/login', function (req, res, next) {
    var userId = req.body.userId;
    var password = req.body.password;
    var sqlData = {
        statement: "select 工号,姓名,密码,部门名称,单位编码,人员类型 from AuSp120.tb_MrUser where 工号=@userId",
        params: [{"name": "userId", "value": userId, "type": "varchar"}]
    };
    db.select(sqlData, function (error, results) {
        if (error) {
            res.json({
                msg: "查询失败"
            })
        } else {
            var length = results.length;
            if (length == 0) {
                res.json({
                    success: false,
                    msg: "fail"
                });
            } else {
                var temp = results[0];
                if (temp[2].value == password) {
                    if (!(temp[5].value == 1 || temp[5].value == 3 || temp[5].value == 5)) {
                        res.json({
                            success: false,
                            msg: "noPermission"
                        });
                    } else {
                        logger.info(temp[3].value+'的'+temp[1].value+'登录成功');
                        req.session.username = temp[1].value;  //登录成功后存session
                        req.session.userId = temp[0].value; //存入用户ID
                        req.session.center = temp[3].value; //中心名称
                        req.session.stationCode = temp[4].value; //单位编码
                        req.session.personType = temp[5].value; //人员类型
                        res.json({
                            success: true,
                            msg: "success"
                        });
                    }
                } else {
                    res.json({
                        success: false,
                        msg: "error"
                    });
                }
            }
        }
    });
});


module.exports = router;
