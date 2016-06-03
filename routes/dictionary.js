/**
 * Created by Dell on 2015/9/20.
 */
var express = require('express');
var db = require('../utils/msdb');
var router = express.Router();

/*在查询添加加入全部选项，用于默认选择*/
var qb = {
    id: 'qb',
    name: '全部'
};
var defaultQb = {
    "id": '',
    "name": '--请选择--'
};

/*返回人员列表*/
router.get('/getDispatcher', function (req, res, next) {
    var sqlData = {
        statement: " select 工号,姓名 from ausp120.tb_MrUser where 人员类型=0 and 有效标志=1  ",
        params: []
    };
    db.select(sqlData, function (error, results) {
        if (error) {
            console.log(error.message);
        } else {
            result = [];
            for (var i = 0; i < results.length; i++) {
                result.push({
                    "id": results[i][0].value,
                    "name": results[i][1].value
                });
            }
            result.unshift(defaultQb);
            res.json(result);
        }
    });

});

/*返回指定中心的分站*/
router.get('/getStation', function (req, res, next) {
    var sqlData = {
        statement: " SELECT 分站编码,分站名称 from AuSp120.tb_Station  ",
        params: []
    };

    db.select(sqlData, function (error, results) {
        if (error) {
            console.log(error.message);
        } else {
            result = [];
            for (var i = 0; i < results.length; i++) {
                result.push({
                    "id": results[i][0].value,
                    "name": results[i][1].value
                });
            }
            res.json(result);
        }
    });
});

/*返回车辆列表*/
router.get('/getCars', function (req, res, next) {
    var station_id = req.session.stationCode;
    if (string.isBlankOrEmpty(station_id) || string.isEquals('1',req.session.personType)) {
        station_id = config.stationCode;
    }
    var sqlData;
    if (string.isEquals("999", station_id) || string.isBlankOrEmpty(station_id)) {
        sqlData = {
            statement: "select 车辆编码 id,实际标识 plateNo from AuSp120.tb_Ambulance ",
            params: []
        };
    } else {
        sqlData = {
            statement: "select 车辆编码 id,实际标识 plateNo from AuSp120.tb_Ambulance where 分站编码=@station_id ",
            params: [{"name": "station_id", "value": station_id, "type": "varchar"}]
        };
    }

    db.select(sqlData, function (error, results) {
        if (error) {
            console.log(error.message);
        } else {
            var qb = {
                id: 'qb',
                plateNo: '全部'
            };
            result = [];
            for (var i = 0; i < results.length; i++) {
                result.push({
                    "id": results[i][0].value,
                    "plateNo": results[i][1].value
                });
            }
            result.unshift(qb);
            res.json(result);
        }
    });
});


module.exports = router;
