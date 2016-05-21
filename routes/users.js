var express = require('express');
var db = require('../utils/database');

var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

router.post('/login', function (req, res, next) {
    var userId = req.body.userId;
    var password = req.body.password;
    var sqlData = [{
        statement: "select u.*,c.name center from user u left outer join center  c on c.id=u.organization_id where isEnabled=1 and jobNo=?",
        params: [userId, password]
    }
    ];

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
                if (temp.password == password) {
                    if (3 != temp.isEnabled) {
                        req.session.username = temp.username;  //登录成功后存session
                        req.session.userId = temp.id; //存入用户ID
                        req.session.organization_id = temp.organization_id; //存入机构编码
                        req.session.center = temp.center; //中心名称
                        res.json({
                            success: true,
                            msg: "success"
                        });
                    } else {
                        res.json({
                            success: false,
                            msg: "noPermission"
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
