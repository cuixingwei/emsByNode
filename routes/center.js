/**
 * Created by Dell on 2015/9/10.
 */
var express = require('express');
var router = express.Router();
var CenterDao = require('../public/controller/CenterDao');

/*振铃到接听大于X秒页面*/
router.post('/getRingToAnswerTimes', function (req, res, next) {
    CenterDao.getRingToAnswerTimes(req, res);
});

/*导出振铃到接听大于X秒页面*/
router.get('/exportRingToAnswerTimes', function (req, res, next) {
    CenterDao.exportRingToAnswerTimes(req, res);
});

/*受理时长大于X秒页面*/
router.post('/getAcceptStartToEndTime', function (req, res, next) {
    CenterDao.getAcceptStartToEndTime(req, res);
});

/*导出受理时长大于X秒页面*/
router.get('/exportAcceptStartToEndTime', function (req, res, next) {
    CenterDao.exportAcceptStartToEndTime(req, res);
});

/*通话时长大于X秒页面*/
router.post('/getTalkTime', function (req, res, next) {
    CenterDao.getTalkTime(req, res);
});

/*导出通话时长大于X秒页面*/
router.get('/exportTalkTime', function (req, res, next) {
    CenterDao.exportTalkTime(req, res);
});

/*事件类型统计页面*/
router.post('/getEventType', function (req, res, next) {
    CenterDao.getEventType(req, res);
});

/*导出事件类型统计页面*/
router.get('/exportEventType', function (req, res, next) {
    CenterDao.exportEventType(req, res);
});

/*受理时间统计页面*/
router.post('/getAcceptTime', function (req, res, next) {
    CenterDao.getAcceptTime(req, res);
});

/*导出受理时间统计页面*/
router.get('/exportAcceptTime', function (req, res, next) {
    CenterDao.exportAcceptTime(req, res);
});

/*呼救历史查询*/
router.post('/getCallHistory', function (req, res, next) {
    CenterDao.getCallHistory(req, res);
});

/*导出呼救历史查询*/
router.get('/exportCallHistory', function (req, res, next) {
    CenterDao.exportCallHistory(req, res);
});

/*根据事件编码获取受理信息*/
router.get('/getAcceptDataByEventId', function (req, res, next) {
    CenterDao.getAcceptDataByEventId(req, res);
});

/*根据事件编码和受理序号获取任务信息*/
router.get('/getTaskDataByEventId', function (req, res, next) {
    CenterDao.getTaskDataByEventId(req, res);
});

/*根据事件编码获取病历信息*/
router.post('/getPatientCase', function (req, res, next) {
    CenterDao.getPatientCase(req, res);
});

/*重大紧急事件情况统计页面*/
router.post('/getAccident', function (req, res, next) {
    CenterDao.getAccident(req, res);
});

/*导出重大紧急事件情况统计页面*/
router.get('/exportAccident', function (req, res, next) {
    CenterDao.exportAccident(req, res);
});

/*调度员工作统计页面*/
router.post('/getDispatcherWorkload', function (req, res, next) {
    CenterDao.getDispatcherWorkload(req, res);
});

/*导出调度员工作统计页面*/
router.get('/exportDispatcherWorkload', function (req, res, next) {
    CenterDao.exportDispatcherWorkload(req, res);
});

/*出车记录表页面*/
router.post('/getOutCarRecord', function (req, res, next) {
    CenterDao.getOutCarRecord(req, res);
});

/*导出出车记录表页面*/
router.get('/exportOutCarRecord', function (req, res, next) {
    CenterDao.exportOutCarRecord(req, res);
});

/*中止任务信息统计页面*/
router.post('/getStopTask', function (req, res, next) {
    CenterDao.getStopTask(req, res);
});

/*导出中止任务信息统计页面*/
router.get('/exportStopTask', function (req, res, next) {
    CenterDao.exportStopTask(req, res);
});

/*中止任务原因统计页面*/
router.post('/getStopTaskReason', function (req, res, next) {
    CenterDao.getStopTaskReason(req, res);
});

/*导出中止任务原因统计页面*/
router.get('/exportStopTaskReason', function (req, res, next) {
    CenterDao.exportStopTaskReason(req, res);
});

/*车辆暂停调用情况页面*/
router.post('/getCarPause', function (req, res, next) {
    CenterDao.getCarPause(req, res);
});

/*导出车辆暂停调用情况页面*/
router.get('/exportCarPause', function (req, res, next) {
    CenterDao.exportCarPause(req, res);
});

/*挂起事件流水统计页面*/
router.post('/getHungEvent', function (req, res, next) {
    CenterDao.getHungEvent(req, res);
});

/*导出挂起事件流水统计页面*/
router.get('/exportHungEvent', function (req, res, next) {
    CenterDao.exportHungEvent(req, res);
});

/*挂起原因统计页面*/
router.post('/getHungEventReason', function (req, res, next) {
    CenterDao.getHungEventReason(req, res);
});

/*导出挂起原因统计页面*/
router.get('/exportHungEventReason', function (req, res, next) {
    CenterDao.exportHungEventReason(req, res);
});

/*中心接警情况统计页面*/
router.post('/getAnswerAlarm', function (req, res, next) {
    CenterDao.getAnswerAlarm(req, res);
});

/*导出中心接警情况统计页面*/
router.get('/exportAnswerAlarm', function (req, res, next) {
    CenterDao.exportAnswerAlarm(req, res);
});

/*急救站出诊情况查询页面*/
router.post('/getSubstationVisit', function (req, res, next) {
    CenterDao.getSubstationVisit(req, res);
});

/*导出急救站出诊情况查询页面*/
router.get('/exportSubstationVisit', function (req, res, next) {
    CenterDao.exportSubstationVisit(req, res);
});

/*急救站晚出诊统计页面*/
router.post('/getSubstationLateVisit', function (req, res, next) {
    CenterDao.getSubstationLateVisit(req, res);
});

/*导出急救站晚出诊统计页面*/
router.get('/exportSubstationLateVisit', function (req, res, next) {
    CenterDao.exportSubstationLateVisit(req, res);
});

/*司机工作情况查询页面*/
router.post('/getDriverWork', function (req, res, next) {
    CenterDao.getDriverWork(req, res);
});

/*导出司机工作情况查询页面*/
router.get('/exportDriverWork', function (req, res, next) {
    CenterDao.exportDriverWork(req, res);
});

/*医生工作情况查询页面*/
router.post('/getDoctorWork', function (req, res, next) {
    CenterDao.getDoctorWork(req, res);
});

/*导出医生工作情况查询页面*/
router.get('/exportDoctorWork', function (req, res, next) {
    CenterDao.exportDoctorWork(req, res);
});

/*护士工作情况查询页面*/
router.post('/getNurseWork', function (req, res, next) {
    CenterDao.getNurseWork(req, res);
});

/*导出护士工作情况查询页面*/
router.get('/exportNurseWork', function (req, res, next) {
    CenterDao.exportNurseWork(req, res);
});

/*接口测试*/
var param = [{"addressType":"1","age":"5","createDateTime":"2015121815220000","createUserId":"jsnj6107","detailedAddress":"江苏省南京市鼓楼区","education":"5","enterType":"1","infoFlow":"32000032010020151218152200","mobileName":"张三先生","moblePhone":"18655551234","profession":"14",
    "reportList":[{"anawerContent":"已预约","doFlag":"Y","levelGrade":"000000000006,000000000601,000000060123","levelGradeName":"","receivingContent":"预约空腔科","reportFlow":"320000320100201512181522000001","reportType":"000000000006","reportjishiBJFlag":"Y"}],
    "sex":"1","updateDateTime":"","updateUserId":""}];

var info = {
    arg2:'mm',
    arg1:'0379',
    arg0:JSON.stringify(param)
};

router.get('/jk', function (req, res, next) {
    console.log('测试');
    var soap = require('soap');
    var url = 'http://gczx.njmu.edu.cn:8086/PhoneREP/webservice/report?wsdl';
    var args = info;
    soap.createClient(url, function(err, client) {
        if(err){
            res.send(err);
        }
        client.addPhoneInfo(args,function(err,result){
            console.log(result);
        });
    });

});

module.exports = router;