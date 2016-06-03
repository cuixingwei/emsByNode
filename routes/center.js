/**
 * Created by Dell on 2015/9/10.
 */
var express = require('express');
var router = express.Router();
var CenterDao = require('../public/controller/CenterDao');

/*业务工作情况日、月、季、年报表*/
router.post('/getBusinessWorkDay', function (req, res, next) {
    CenterDao.getBusinessWorkDay(req, res);
});

/**
 * 日报表1,2
 */
router.post('/getCenterDay', function (req, res, next) {
    CenterDao.getCenterDay(req, res);
});

/**
 * 社会急救保障流水表
 */
router.post('/getEventTypeFlow', function (req, res, next) {
    CenterDao.getEventTypeFlow(req, res);
});

/**
 * 突发公卫事件
 */
router.post('/getAccident', function (req, res, next) {
    CenterDao.getAccident(req, res);
});

/**
 * 高速站出车
 */
router.post('/getGsStationOutCar', function (req, res, next) {
    CenterDao.getGsStationOutCar(req, res);
});

/**
 * 急救站出车情况表
 */
router.post('/getStationOutCar', function (req, res, next) {
    CenterDao.getStationOutCar(req, res);
});

/**
 * 三家医院出车反馈
 */
router.post('/getStationOutCarFeedback', function (req, res, next) {
    CenterDao.getStationOutCarFeedback(req, res);
});

/**
 * 三家医院月季年出车
 */
router.post('/getThreeStationOutCar', function (req, res, next) {
    CenterDao.getThreeStationOutCar(req, res);
});

/**
 * 中心医院四分站月季年
 */
router.post('/getCenterFourStationOutCar', function (req, res, next) {
    CenterDao.getCenterFourStationOutCar(req, res);
});

/**
 * 网内转送月季年
 */
router.post('/getStationTransfer', function (req, res, next) {
    CenterDao.getStationTransfer(req, res);
});

/**
 * 未按辖区流水表
 */
router.post('/getNoAreaFlow', function (req, res, next) {
    CenterDao.getNoAreaFlow(req, res);
});

/**
 * 未按辖区月季年
 */
router.post('/getNoAreaStatistics', function (req, res, next) {
    CenterDao.getNoAreaStatistics(req, res);
});

/**
 * 24小时受理情况统计
 */
router.post('/getTwentyFourAccept', function (req, res, next) {
    CenterDao.getTwentyFourAccept(req, res);
});

/**
 * 电话判断疾病分类表
 */
router.post('/getPhoneJudgeDiseaseClass', function (req, res, next) {
    CenterDao.getPhoneJudgeDiseaseClass(req, res);
});

/**
 * 鄂州市医疗紧急救援中心病员流向表
 */
router.post('/getPatientFlowDirection', function (req, res, next) {
    CenterDao.getPatientFlowDirection(req, res);
});

/**
 * 鄂州市医疗紧急救援中心病员流向表
 */
router.post('/getPatientFlowDirectionStatistics', function (req, res, next) {
    CenterDao.getPatientFlowDirectionStatistics(req, res);
});

/**
 * 呼救区域病种分类流水表
 */
router.post('/getAreaPatientClassFlow', function (req, res, next) {
    CenterDao.getAreaPatientClassFlow(req, res);
});

/**
 * 呼救区域统计表
 */
router.post('/getAreaPatientClassFlowStatistics', function (req, res, next) {
    CenterDao.getAreaPatientClassFlowStatistics(req, res);
});

/**
 * 车辆出车情况统计表
 */
router.post('/getCarOutStatistics', function (req, res, next) {
    CenterDao.getCarOutStatistics(req, res);
});

/**
 * 急救站出车反应速度统计表New
 */
router.post('/getStationOutCarReactionSpeed', function (req, res, next) {
    CenterDao.getStationOutCarReactionSpeed(req, res);
});

/**
 * 司机出车反应速度统计表
 */
router.post('/getDriverOutCarReactionSpeed', function (req, res, next) {
    CenterDao.getDriverOutCarReactionSpeed(req, res);
});

/**
 * 暂停调用流水表
 */
router.post('/getPauseFlow', function (req, res, next) {
    CenterDao.getPauseFlow(req, res);
});

/**
 * 暂停调用统计表
 */
router.post('/getPauseStatistics', function (req, res, next) {
    CenterDao.getPauseStatistics(req, res);
});

/**
 * 挂起流水表
 */
router.post('/getHungEventFlow', function (req, res, next) {
    CenterDao.getHungEventFlow(req, res);
});

/**
 * 待派处理情况统计表
 */
router.post('/getHungEventHandle', function (req, res, next) {
    CenterDao.getHungEventHandle(req, res);
});

/**
 * 摘机时长流水表
 */
router.post('/getHookTimeFlow', function (req, res, next) {
    CenterDao.getHookTimeFlow(req, res);
});

/**
 * 受理人员摘机速度统计报表
 */
router.post('/getHookSpeedStatistics', function (req, res, next) {
    CenterDao.getHookSpeedStatistics(req, res);
});

/**
 * 调度员工作量统计
 */
router.post('/getDispatcherWorkload', function (req, res, next) {
    CenterDao.getDispatcherWorkload(req, res);
});

/**
 * 调度员工作效率统计
 */
router.post('/getDispatcherWorkEfficiency', function (req, res, next) {
    CenterDao.getDispatcherWorkEfficiency(req, res);
});

module.exports = router;