/**
 * Created by Dell on 2015/9/20.
 */
var express = require('express');
var db = require('../utils/database');
var router = express.Router();

/*在查询添加加入全部选项，用于默认选择*/
var qb = {
    id: 'qb',
    name: '全部'
}

/*返回人员列表*/
router.get('/getDispatcher', function (req, res, next) {
    if (req.session.organization_id == null || req.session.organization_id == undefined) {
        res.json({success: 'fail'});
    } else {
        var organization_id = req.session.organization_id;
        organization_id = organization_id + '%';
        var sqlData = [{
            statement: " SELECT * from `user` WHERE id like ? AND personType_id=5 ",
            params: [organization_id]
        }
        ];

        db.select(sqlData, function (error, results) {
            if (error) {
                console.log(error.message);
            } else {
                results.unshift(qb);
                res.json(results);
            }
        });
    }

});

/*返回指定中心的分站*/
router.get('/getStation', function (req, res, next) {
    console.log("userId=" + req.session.userId);
    if (req.session.userId == null || req.session.userId == undefined) {
        res.json({success: 'fail'});
    } else {
        var center_id = req.session.userId.substr(0, 6);
        var sqlData = [{
            statement: " SELECT * from station WHERE center_id=?  ",
            params: [center_id]
        }
        ];

        db.select(sqlData, function (error, results) {
            if (error) {
                console.log(error.message);
            } else {
                results.unshift(qb);
                res.json(results);
            }
        });
    }
});

/*返回车辆列表*/
router.get('/getCars', function (req, res, next) {
    var station_id = req.query.station_id;
    var sqlData = [{
        statement: " SELECT * from ambulance where station_id=? ",
        params: [station_id]
    }
    ];

    db.select(sqlData, function (error, results) {
        if (error) {
            console.log(error.message);
        } else {
            var qb = {
                id: 'qb',
                plateNo: '全部'
            }
            results.unshift(qb);
            res.json(results);
        }
    });
});

/*根据字典类型获取指定字典表*/
router.get('/getDictionaryByType', function (req, res, next) {
    var type = req.query.type;
    var sqlData = [{
        statement: " select * from dictionarybasic db WHERE db.type_id=? ",
        params: [type]
    }
    ];

    db.select(sqlData, function (error, results) {
        if (error) {
            console.log(error.message);
        } else {
            results.unshift(qb);
            res.json(results);
        }
    });
});

module.exports = router;
