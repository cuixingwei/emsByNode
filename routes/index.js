var express = require('express');
var router = express.Router();
var string = require("../utils/string");
var db = require("../utils/msdb");

var menu = require("../config/menu.json");


/* GET home page. */

router.get('/', function (req, res, next) {
    if (!string.isBlankOrEmpty(req.session.username)) {
        res.render('main', {title: '主页面', username: req.session.username, center: req.session.center});
    } else {
        res.render('login', {});
    }
});

/*退出*/
router.get('/logOut', function (req, res, next) {
    req.session.destroy(function (err) {
        if (err) {
            console.log(err.message);
        } else {
            res.render('login', {title: 'Express'});
        }
    })
});


/*登录成功后跳转到主页面*/
router.get('/main', function (req, res, next) {
    if (!string.isBlankOrEmpty(req.session.username)) {
        res.render('main', {title: '主页面', username: req.session.username, center: req.session.center});
    } else {
        res.render('login', {});
    }
});

/*获取菜单*/
router.get('/menu', function (req, res, next) {
    res.json(menu);
});
/*改密*/
router.post('/changePwd', function (req, res, next) {
    var userId = req.session.userId;
    var password = req.body.dataPwd;
    var sqlData = {
        statement: "update AuSp120.tb_MrUser set 密码=@pwd where 工号=@userId",
        params: [{"name": "userId", "value": userId}, {"name": "pwd", "value": password}]
    };
    db.change(sqlData, function (err, results) {
        if (err) {
            console.info("操作失败!");
        } else {
            if (results == 0) {
                res.json({
                    success: false
                });
            } else {
                res.json({
                    success: true
                });
            }
        }
    });
});

/*业务工作情况日报表*/
router.get('/BusinessWorkDay', function (req, res, next) {
    res.render('page/BusinessWorkDay', {title: ''});
});

/*业务工作情况月季年*/
router.get('/BusinessWorkMonth', function (req, res, next) {
    res.render('page/BusinessWorkMonth', {title: ''});
});

/*日报表1*/
router.get('/CenterDay1', function (req, res, next) {
    res.render('page/CenterDay1', {title: ''});
});

/*日报表2*/
router.get('/CenterDay2', function (req, res, next) {
    res.render('page/CenterDay2', {title: ''});
});

/*社会急救保障流水表*/
router.get('/EventTypeFlow', function (req, res, next) {
    res.render('page/EventTypeFlow', {title: ''});
});

/*医疗保障、应急演练流水表*/
router.get('/EventSafeOrEmergencyFlow', function (req, res, next) {
    res.render('page/EventSafeOrEmergencyFlow', {title: ''});
});

/*突发公卫事件*/
router.get('/Accident', function (req, res, next) {
    res.render('page/Accident', {title: ''});
});

/*高速站出车*/
router.get('/GsStationOutCar', function (req, res, next) {
    res.render('page/GsStationOutCar', {title: ''});
});

/*急救站出车情况表*/
router.get('/StationOutCar', function (req, res, next) {
    res.render('page/StationOutCar', {title: ''});
});

/*三家医院出车反馈*/
router.get('/StationOutCarFeedback', function (req, res, next) {
    res.render('page/StationOutCarFeedback', {title: ''});
});

/*三家医院月季年出车*/
router.get('/ThreeStationOutCar', function (req, res, next) {
    res.render('page/ThreeStationOutCar', {title: ''});
});

/*中心医院四分站月季年*/
router.get('/CenterFourStationOutCar', function (req, res, next) {
    res.render('page/CenterFourStationOutCar', {title: ''});
});

/*网内转送月季年*/
router.get('/StationTransfer', function (req, res, next) {
    res.render('page/StationTransfer', {title: ''});
});

/*未按辖区流水表*/
router.get('/NoAreaFlow', function (req, res, next) {
    res.render('page/NoAreaFlow', {title: ''});
});

/*未按辖区月季年*/
router.get('/NoAreaStatistics', function (req, res, next) {
    res.render('page/NoAreaStatistics', {title: ''});
});

/*24小时受理情况统计*/
router.get('/TwentyFourAccept', function (req, res, next) {
    res.render('page/TwentyFourAccept', {title: ''});
});

/*电话判断疾病分类表*/
router.get('/PhoneJudgeDiseaseClass', function (req, res, next) {
    res.render('page/PhoneJudgeDiseaseClass', {title: ''});
});

/*鄂州市医疗紧急救援中心病员流向表*/
router.get('/PatientFlowDirection', function (req, res, next) {
    res.render('page/PatientFlowDirection', {title: ''});
});

/*鄂州市医疗紧急救援中心病员流向情况统计表*/
router.get('/PatientFlowDirectionStatistics', function (req, res, next) {
    res.render('page/PatientFlowDirectionStatistics', {title: ''});
});

/*呼救区域病种分类流水表*/
router.get('/AreaPatientClassFlow', function (req, res, next) {
    res.render('page/AreaPatientClassFlow', {title: ''});
});

/*呼救区域统计表*/
router.get('/AreaPatientClassFlowStatistics', function (req, res, next) {
    res.render('page/AreaPatientClassFlowStatistics', {title: ''});
});

/*车辆出车情况统计表*/
router.get('/CarOutStatistics', function (req, res, next) {
    res.render('page/CarOutStatistics', {title: ''});
});

/*急救站出车反应速度统计表New*/
router.get('/StationOutCarReactionSpeed', function (req, res, next) {
    res.render('page/StationOutCarReactionSpeed', {title: ''});
});

/*司机出车反应速度统计表*/
router.get('/DriverOutCarReactionSpeed', function (req, res, next) {
    res.render('page/DriverOutCarReactionSpeed', {title: ''});
});

/*暂停调用流水表*/
router.get('/PauseFlow', function (req, res, next) {
    res.render('page/PauseFlow', {title: ''});
});

/*暂停调用统计表*/
router.get('/PauseStatistics', function (req, res, next) {
    res.render('page/PauseStatistics', {title: ''});
});

/*挂起流水表*/
router.get('/HungEventFlow', function (req, res, next) {
    res.render('page/HungEventFlow', {title: ''});
});

/*待派处理情况统计表*/
router.get('/HungEventHandle', function (req, res, next) {
    res.render('page/HungEventHandle', {title: ''});
});

/*摘机时长流水表*/
router.get('/HookTimeFlow', function (req, res, next) {
    res.render('page/HookTimeFlow', {title: ''});
});

/*受理人员摘机速度统计报表*/
router.get('/HookSpeedStatistics', function (req, res, next) {
    res.render('page/HookSpeedStatistics', {title: ''});
});

/*调度员工作量统计*/
router.get('/DispatcherWorkload', function (req, res, next) {
    res.render('page/DispatcherWorkload', {title: ''});
});

/*调度员工作效率统计*/
router.get('/DispatcherWorkEfficiency', function (req, res, next) {
    res.render('page/DispatcherWorkEfficiency', {title: ''});
});


module.exports = router;
