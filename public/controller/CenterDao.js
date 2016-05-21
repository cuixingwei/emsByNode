/**
 * Created by Dell on 2015/10/15.
 */
var db = require('../../utils/database');
var excel = require("../../utils/excel");
var string = require("../../utils/string");
var util = require("../../utils/util");

/*振铃到接听大于X秒*/
exports.getRingToAnswerTimes = function (req, res) {
    var startTime = req.body.startTime;
    var endTime = req.body.endTime;
    var overtimes = req.body.overtimes;
    var dispatcher = req.body.dispatcher;
    var sql = "select u.username,ec.beginTime,ec.finishTime,TIMESTAMPDIFF(SECOND,ec.beginTime,ec.finishTime) times,d.displayName,ec.remark from eventcall ec LEFT OUTER JOIN user u on u.id=ec.dispatcher_id  LEFT OUTER JOIN desk d on d.id=ec.desk_id where ec.beginTime between ? and ?   ";
    var param = [startTime, endTime];
    if (!string.isBlankOrEmpty(overtimes)) {
        sql += " and TIMESTAMPDIFF(SECOND,ec.beginTime,ec.finishTime) > ? ";
        param.push(overtimes);
    }
    if (!string.isBlankOrEmpty(dispatcher) && !string.isEquals('qb', dispatcher)) {
        sql += " and ec.dispatcher_id=? ";
        param.push(dispatcher);
    }

    var sqlData = [{
        statement: sql,
        params: param
    }
    ];

    db.select(sqlData, function (error, results) {
        if (error) {
            console.log(error.message);
        } else {
            for (var i = 0; i < results.length; i++) {
                results[i].times = util.formatSecond(results[i].times);
            }
            res.json(results);
        }
    });
};

/* 导出振铃到接听大于X秒Excel*/
exports.exportRingToAnswerTimes = function (req, res) {
    var startTime = req.query.startTime;
    var endTime = req.query.endTime;
    var overtimes = req.query.overtimes;
    var dispatcher = req.query.dispatcher;
    var sql = "select u.username,ec.beginTime,ec.finishTime,TIMESTAMPDIFF(SECOND,ec.beginTime,ec.finishTime) times,d.displayName,ec.remark from eventcall ec LEFT OUTER JOIN user u on u.id=ec.dispatcher_id  LEFT OUTER JOIN desk d on d.id=ec.desk_id where ec.beginTime between ? and ?   ";
    var param = [startTime, endTime];
    if (!string.isBlankOrEmpty(overtimes)) {
        sql += " and TIMESTAMPDIFF(SECOND,ec.beginTime,ec.finishTime) > ? ";
        param.push(overtimes);
    }
    if (!string.isBlankOrEmpty(dispatcher) && !string.isEquals('qb', dispatcher)) {
        sql += " and ec.dispatcher_id=? ";
        param.push(dispatcher);
    }

    var sqlData = [{
        statement: sql,
        params: param
    }
    ];

    db.select(sqlData, function (error, results) {
        if (error) {
            console.log(error.message);
        } else {
            var config = {name: "表单一", fileName: "振铃到接听大于X秒"};
            var arrayDatas = new Array();
            var head = new Array('调度员', '电话振铃时刻', '通话时刻', '响铃时长', '受理台号', '备注');
            arrayDatas.push(head);
            for (var i = 0; i < results.length; i++) {
                results[i].times = util.formatSecond(results[i].times);
                var array = new Array(results[i].username || '', results[i].beginTime || '',
                    results[i].finishTime || '', results[i].times || '', results[i].displayName || '', results[i].remark || '');
                arrayDatas.push(array);
            }
            excel.exportExcel(config, arrayDatas, res);
        }
    });
};

/*受理时长大于X秒页面*/
exports.getAcceptStartToEndTime = function (req, res) {
    var startTime = req.body.startTime;
    var endTime = req.body.endTime;
    var overtimes = req.body.overtimes;
    var dispatcher = req.body.dispatcher;
    var sql = "SELECT u.`name` disptcher,a.acceptBeginTime,a.acceptEndTime,TIMESTAMPDIFF(SECOND,a.acceptBeginTime,a.acceptEndTime) times, dc.`name`,a.alarmCall,a.remark," +
        "a.event_id from `event` e LEFT OUTER JOIN eventaccept a on a.event_id=e.id   " +
        "LEFT OUTER JOIN dictionary_centerid  dc on dc.id=a.acceptType_id  LEFT OUTER JOIN `user` u on u.id=a.disptcher_id  where e.isTest=0 " +
        "and a.acceptBeginTime between ? and ?  ";
    var param = [startTime, endTime];
    if (!string.isBlankOrEmpty(overtimes)) {
        sql += "  and TIMESTAMPDIFF(SECOND,a.acceptBeginTime,a.acceptEndTime) > ? ";
        param.push(overtimes);
    }
    if (!string.isBlankOrEmpty(dispatcher) && !string.isEquals('qb', dispatcher)) {
        sql += "   and a.disptcher_id=? ";
        param.push(dispatcher);
    }

    var sqlData = [{
        statement: sql,
        params: param
    }
    ];

    db.select(sqlData, function (error, results) {
        if (error) {
            console.log(error.message);
        } else {
            for (var i = 0; i < results.length; i++) {
                results[i].times = util.formatSecond(results[i].times);
            }
            res.json(results);
        }
    });
};

/* 导出受理时长大于X秒页面*/
exports.exportAcceptStartToEndTime = function (req, res) {
    var startTime = req.query.startTime;
    var endTime = req.query.endTime;
    var overtimes = req.query.overtimes;
    var dispatcher = req.query.dispatcher;
    var sql = "SELECT u.`name` disptcher,a.acceptBeginTime,a.acceptEndTime,TIMESTAMPDIFF(SECOND,a.acceptBeginTime,a.acceptEndTime) times, dc.`name`,a.alarmCall,a.remark," +
        "a.event_id from `event` e LEFT OUTER JOIN eventaccept a on a.event_id=e.id   " +
        "LEFT OUTER JOIN dictionary_centerid  dc on dc.id=a.acceptType_id  LEFT OUTER JOIN `user` u on u.id=a.disptcher_id  where e.isTest=0 " +
        "and a.acceptBeginTime between ? and ?  ";
    var param = [startTime, endTime];
    if (!string.isBlankOrEmpty(overtimes)) {
        sql += "  and TIMESTAMPDIFF(SECOND,a.acceptBeginTime,a.acceptEndTime) > ? ";
        param.push(overtimes);
    }
    if (!string.isBlankOrEmpty(dispatcher) && !string.isEquals('qb', dispatcher)) {
        sql += "   and a.disptcher_id=? ";
        param.push(dispatcher);
    }
    var sqlData = [{
        statement: sql,
        params: param
    }
    ];

    db.select(sqlData, function (error, results) {
        if (error) {
            console.log(error.message);
        } else {
            var config = {name: "表单一", fileName: "受理时长大于X秒"};
            var arrayDatas = new Array();
            var head = new Array('调度员', '开始受理时刻', '结束受理时刻', '受理时长', '受理类型', '呼救电话', '受理备注');
            arrayDatas.push(head);
            for (var i = 0; i < results.length; i++) {
                results[i].times = util.formatSecond(results[i].times);
                var array = new Array(results[i].disptcher || '', results[i].acceptBeginTime || '',
                    results[i].acceptEndTime || '', results[i].times || '', results[i].name || '', results[i].alarmCall || '', results[i].remark || '');
                arrayDatas.push(array);
            }
            excel.exportExcel(config, arrayDatas, res);
        }
    });
}

/*通话时长大于X秒页面*/
exports.getTalkTime = function (req, res) {
    var startTime = req.body.startTime;
    var endTime = req.body.endTime;
    var overtimes = req.body.overtimes;
    var dispatcher = req.body.dispatcher;
    var sql = "select u.`name` dispatcher,tl.beginTime,tl.finishTime,TIMESTAMPDIFF(SECOND,tl.beginTime,tl.finishTime) times,db.`name` telLogType,tl.teleNo,tl.remark,tl.id "
        + " from telelog tl LEFT OUTER JOIN `user` u on tl.dispatcher_id=u.id  LEFT OUTER JOIN dictionarybasic db on db.id=tl.telLogType_id  WHERE tl.buildTime between ? and ?   ";
    var param = [startTime, endTime];
    if (!string.isBlankOrEmpty(overtimes)) {
        sql += " and TIMESTAMPDIFF(SECOND,tl.beginTime,tl.finishTime) > ? ";
        param.push(overtimes);
    }
    if (!string.isBlankOrEmpty(dispatcher) && !string.isEquals('qb', dispatcher)) {
        sql += " and tl.dispatcher_id=? ";
        param.push(dispatcher);
    }

    var sqlData = [{
        statement: sql,
        params: param
    }
    ];

    db.select(sqlData, function (error, results) {
        if (error) {
            console.log(error.message);
        } else {
            for (var i = 0; i < results.length; i++) {
                results[i].times = util.formatSecond(results[i].times);
            }
            res.json(results);
        }
    });
}

/* 导出通话时长大于X秒页面*/
exports.exportTalkTime = function (req, res) {
    var startTime = req.query.startTime;
    var endTime = req.query.endTime;
    var overtimes = req.query.overtimes;
    var dispatcher = req.query.dispatcher;
    var sql = "select u.`name` dispatcher,tl.beginTime,tl.finishTime,TIMESTAMPDIFF(SECOND,tl.beginTime,tl.finishTime) times,db.`name` telLogType,tl.teleNo,tl.remark,tl.id "
        + " from telelog tl LEFT OUTER JOIN `user` u on tl.dispatcher_id=u.id  LEFT OUTER JOIN dictionarybasic db on db.id=tl.telLogType_id  WHERE tl.buildTime between ? and ?   ";
    var param = [startTime, endTime];
    if (!string.isBlankOrEmpty(overtimes)) {
        sql += " and TIMESTAMPDIFF(SECOND,tl.beginTime,tl.finishTime) > ? ";
        param.push(overtimes);
    }
    if (!string.isBlankOrEmpty(dispatcher) && !string.isEquals('qb', dispatcher)) {
        sql += " and tl.dispatcher_id=? ";
        param.push(dispatcher);
    }
    var sqlData = [{
        statement: sql,
        params: param
    }
    ];
    db.select(sqlData, function (error, results) {
        if (error) {
            console.log(error.message);
        } else {
            var config = {name: "表单一", fileName: "通话时长大于X秒页面"};
            var arrayDatas = new Array();
            var head = new Array('调度员', '通话开始时刻', '通话结束时刻', '通话时长', '通话类型', '对方电话', '备注');
            arrayDatas.push(head);
            for (var i = 0; i < results.length; i++) {
                results[i].times = util.formatSecond(results[i].times);
                var array = new Array(results[i].dispatcher || '', results[i].beginTime || '',
                    results[i].finishTime || '', results[i].times || '', results[i].telLogType || '', results[i].teleNo || '', results[i].remark || '');
                arrayDatas.push(array);
            }
            excel.exportExcel(config, arrayDatas, res);
        }
    });
}

/*事件类型统计页面*/
exports.getEventType = function (req, res) {
    var startTime = req.body.startTime;
    var endTime = req.body.endTime;
    var sqlData = [{
        statement: "SELECT e.eventName,e.firstAlarmCall,u.username,e.firstAcceptTime,e.acceptCount,db.`name` eventType     from `event` e LEFT OUTER JOIN eventaccept ea on ea.event_id=e.id  LEFT OUTER JOIN task t on t.acceptOrder=ea.acceptOrder and ea.event_id=t.event_id "
        + " LEFT OUTER JOIN `user` u on u.id=e.firstDisptcher       LEFT OUTER JOIN dictionarybasic db on db.id=e.eventType_id        WHERE e.firstAcceptTime between ? and ?   ",
        params: [startTime, endTime]
    }
    ];

    db.select(sqlData, function (error, results) {
        if (error) {
            console.log(error.message);
        } else {
            res.json(results);
        }
    });
}

/* 导出事件类型统计页面*/
exports.exportEventType = function (req, res) {
    var startTime = req.query.startTime;
    var endTime = req.query.endTime;
    var sqlData = [{
        statement: "SELECT e.eventName,e.firstAlarmCall,u.username,e.firstAcceptTime,e.acceptCount,db.`name` eventType     from `event` e LEFT OUTER JOIN eventaccept ea on ea.event_id=e.id  LEFT OUTER JOIN task t on t.acceptOrder=ea.acceptOrder and ea.event_id=t.event_id "
        + " LEFT OUTER JOIN `user` u on u.id=e.firstDisptcher       LEFT OUTER JOIN dictionarybasic db on db.id=e.eventType_id        WHERE e.firstAcceptTime between ? and ?   ",
        params: [startTime, endTime]
    }
    ];

    db.select(sqlData, function (error, results) {
        if (error) {
            console.log(error.message);
        } else {
            var config = {name: "表单一", fileName: "事件类型统计页面"};
            var arrayDatas = new Array();
            var head = new Array('事件名称', '首次呼救电话', '首次调度员', '首次受理时间', '受理次数', '事件类型');
            arrayDatas.push(head);
            for (var i = 0; i < results.length; i++) {
                var array = new Array(results[i].eventName || '', results[i].firstAlarmCall || '',
                    results[i].username || '', results[i].firstAcceptTime || '', results[i].acceptCount || '', results[i].eventType || '');
                arrayDatas.push(array);
            }
            excel.exportExcel(config, arrayDatas, res);
        }
    });
}

/*受理时间统计页面*/
exports.getAcceptTime = function (req, res) {
    var startTime = req.body.startTime;
    var endTime = req.body.endTime;
    var dispatcher = req.body.dispatcher;
    var sql = "SELECT u.username dispatcher,AVG(TIMESTAMPDIFF(SECOND,ea.acceptBeginTime,ea.sendCommandTime)) averageOffSendCar,AVG(TIMESTAMPDIFF(SECOND,ea.acceptBeginTime,ea.acceptEndTime)) averageAccept,"
        + "(SELECT AVG(TIMESTAMPDIFF(SECOND,tl.ringTime,tl.beginTime)) from telelog tl where tl.dispatcher_id=t.disptcher_id) averageOffhookTime     from `event` e LEFT OUTER JOIN eventaccept ea on ea.event_id=e.id "
        + "LEFT OUTER JOIN task t on t.acceptOrder=ea.acceptOrder and ea.event_id=t.event_id     LEFT OUTER JOIN `user` u on u.id=t.disptcher_id    WHERE e.firstAcceptTime between ? and ? and u.username is not null  ";
    var param = [startTime, endTime];
    if (!string.isBlankOrEmpty(dispatcher) && !string.isEquals('qb', dispatcher)) {
        sql += " and t.disptcher_id=? ";
        param = [startTime, endTime, dispatcher];
    }
    sql += " GROUP BY u.username";

    var sqlData = [{
        statement: sql,
        params: param
    }
    ];

    db.select(sqlData, function (error, results) {
        if (error) {
            console.log(error.message);
        } else {
            for (var i = 0; i < results.length; i++) {
                results[i].averageOffhookTime = util.formatSecond(results[i].averageOffhookTime);
                results[i].averageOffSendCar = util.formatSecond(results[i].averageOffSendCar);
                results[i].averageAccept = util.formatSecond(results[i].averageAccept);
            }
            res.json(results);
        }
    });
}

/* 导出受理时间统计页面*/
exports.exportAcceptTime = function (req, res) {
    var startTime = req.query.startTime;
    var endTime = req.query.endTime;
    var dispatcher = req.query.dispatcher;
    var sql = "SELECT u.username dispatcher,AVG(TIMESTAMPDIFF(SECOND,ea.acceptBeginTime,ea.sendCommandTime)) averageOffSendCar,AVG(TIMESTAMPDIFF(SECOND,ea.acceptBeginTime,ea.acceptEndTime)) averageAccept,"
        + "(SELECT AVG(TIMESTAMPDIFF(SECOND,tl.ringTime,tl.beginTime)) from telelog tl where tl.dispatcher_id=t.disptcher_id) averageOffhookTime     from `event` e LEFT OUTER JOIN eventaccept ea on ea.event_id=e.id "
        + "LEFT OUTER JOIN task t on t.acceptOrder=ea.acceptOrder and ea.event_id=t.event_id     LEFT OUTER JOIN `user` u on u.id=t.disptcher_id    WHERE e.firstAcceptTime between ? and ? and u.username is not null  ";
    var param = [startTime, endTime];
    if (!string.isBlankOrEmpty(dispatcher) && !string.isEquals('qb', dispatcher)) {
        sql += " and t.disptcher_id=? ";
        param = [startTime, endTime, dispatcher];
    }
    sql += " GROUP BY u.username";

    var sqlData = [{
        statement: sql,
        params: param
    }
    ];

    db.select(sqlData, function (error, results) {
        if (error) {
            console.log(error.message);
        } else {
            var config = {name: "表单一", fileName: "受理时间统计页面"};
            var arrayDatas = new Array();
            var head = new Array('调度员', '平均摘机时长(秒)', '平均派车时长(秒)', '平均受理时长(秒)');
            arrayDatas.push(head);
            for (var i = 0; i < results.length; i++) {
                results[i].averageOffhookTime = util.formatSecond(results[i].averageOffhookTime);
                results[i].averageOffSendCar = util.formatSecond(results[i].averageOffSendCar);
                results[i].averageAccept = util.formatSecond(results[i].averageAccept);
                var array = new Array(results[i].dispatcher, results[i].averageOffhookTime,
                    results[i].averageOffSendCar, results[i].averageAccept);
                arrayDatas.push(array);
            }
            excel.exportExcel(config, arrayDatas, res);
        }
    });
}

/*查询呼救历史*/
exports.getCallHistory = function (req, res) {
    var startTime = req.body.startTime;
    var endTime = req.body.endTime;
    var dispatcher = req.body.dispatcher;
    var relevance = req.body.relevance;
    var alarmPhone = req.body.alarmPhone;
    var eventType = req.body.eventType;

    var sql = "select e.id,e.eventName,e.firstAlarmCall,e.acceptCount,e.taskCount,e.firstDisptcher, e.firstAcceptTime,db1.name eventType,db2.name eventSource    " +
        "from event e left outer join dictionarybasic db1 on db1.id=e.eventType_id  left outer join dictionarybasic db2 on db2.id=e.eventSource_id   " +
        "where e.isTest=0 and e.firstAcceptTime between ? and ? ";
    var params = [startTime, endTime];
    if (!string.isBlankOrEmpty(eventType) && !string.isEquals('qb', eventType)) {
        sql += " and e.eventType_id=? ";
        params.push(eventType);
    }
    if (!string.isBlankOrEmpty(relevance) && !string.isEquals('qb', relevance)) {
        sql += " and e.eventSource_id=? ";
        params.push(relevance);
    }
    if (!string.isBlankOrEmpty(alarmPhone)) {
        alarmPhone = '%' + alarmPhone + '%';
        sql += " and e.firstAlarmCall like ? ";
        params.push(alarmPhone);
    }
    if (!string.isBlankOrEmpty(dispatcher)) {
        dispatcher = '%' + dispatcher + '%';
        sql += " and e.firstDisptcher like ? ";
        params.push(dispatcher);
    }
    var sqlData = [{
        statement: sql,
        params: params
    }
    ];

    db.select(sqlData, function (error, results) {
        if (error) {
            console.log(error.message);
        } else {
            res.json(results);
        }
    });
};

/* 导出呼救历史Excel*/
exports.exportCallHistory = function (req, res) {
    var startTime = req.query.startTime;
    var endTime = req.query.endTime;
    var dispatcher = req.query.dispatcher;
    var relevance = req.query.relevance;
    var alarmPhone = req.query.alarmPhone;
    var eventType = req.query.eventType;

    var sql = "select e.id,e.eventName,e.firstAlarmCall,e.acceptCount,e.taskCount,e.firstDisptcher, e.firstAcceptTime,db1.name eventType,db2.name eventSource    " +
        "from event e left outer join dictionarybasic db1 on db1.id=e.eventType_id  left outer join dictionarybasic db2 on db2.id=e.eventSource_id   " +
        "where e.isTest=0 and e.firstAcceptTime between ? and ? ";
    var params = [startTime, endTime];
    if (!string.isBlankOrEmpty(eventType) && !string.isEquals('qb', eventType)) {
        sql += " and e.eventType_id=? ";
        params.push(eventType);
    }
    if (!string.isBlankOrEmpty(relevance) && !string.isEquals('qb', relevance)) {
        sql += " and e.eventSource_id=? ";
        params.push(relevance);
    }
    if (!string.isBlankOrEmpty(alarmPhone)) {
        alarmPhone = '%' + alarmPhone + '%';
        sql += " and e.firstAlarmCall like ? ";
        params.push(alarmPhone);
    }
    if (!string.isBlankOrEmpty(dispatcher)) {
        dispatcher = '%' + dispatcher + '%';
        sql += " and e.firstDisptcher like ? ";
        params.push(dispatcher);
    }
    var sqlData = [{
        statement: sql,
        params: params
    }
    ];

    db.select(sqlData, function (error, results) {
        if (error) {
            console.log(error.message);
        } else {
            var config = {name: "表单一", fileName: "呼救历史查询页面"};
            var arrayDatas = new Array();
            var head = new Array('首次受理时刻', '事件名称', '呼救电话', '事件类型', '受理次数', '出车次数', '联动来源', '调度员');
            arrayDatas.push(head);
            for (var i = 0; i < results.length; i++) {
                var array = new Array(results[i].firstAcceptTime, results[i].eventName || '',
                    results[i].firstAlarmCall || '', results[i].eventType || '', results[i].acceptCount || '', results[i].taskCount || '', results[i].eventSource || '', results[i].firstDisptcher || '');
                arrayDatas.push(array);
            }
            excel.exportExcel(config, arrayDatas, res);
        }
    });
};

/*根据事件编码获取受理信息*/
exports.getAcceptDataByEventId = function (req, res) {
    var event_id = req.query.event_id;
    var sql = 'SELECT ea.*,db.name acceptType,dbr.name reason,dbl.name localAddrType,u.username dispatcher  from eventaccept ea  left outer join dictionarybasic db on db.id=ea.acceptType_id ' +
        'left outer join dictionarybasic dbr on dbr.id=ea.reason_id left outer join dictionarybasic dbl on dbl.id=ea.localAddrType_id ' +
        'left outer join user u on u.id=ea.disptcher_id WHERE ea.event_id=?';
    var param = [event_id];
    var sqlData = [{
        statement: sql,
        params: param
    }
    ];

    db.select(sqlData, function (error, results) {
        if (error) {
            console.log(error.message);
        } else {
            res.json(results);
        }
    });
};

/*根据事件编码和受理序号获取任务信息*/
exports.getTaskDataByEventId = function (req, res) {
    var event_id = req.query.event_id;
    var acceptOrder = req.query.acceptOrder;
    var sql = 'SELECT * from task t WHERE t.event_id=? and t.acceptOrder=?';
    var param = [event_id, acceptOrder];
    var sqlData = [{
        statement: sql,
        params: param
    }
    ];

    db.select(sqlData, function (error, results) {
        if (error) {
            console.log(error.message);
        } else {
            res.json(results);
        }
    });
};

/*根据事件编码获取病历信息*/
exports.getPatientCase = function (req, res) {
    var event_id = req.body.event_id;
    var task_id = req.body.task_id;
    var sql = '';
    var param;
    if(!string.isBlankOrEmpty(event_id)){
        param = [event_id];
        sql = 'SELECT pc.* from task t LEFT OUTER JOIN patientcase pc on pc.task_id=t.task_id where t.event_id=?';
    }
    if(!string.isBlankOrEmpty(task_id)){
        param = [task_id];
        sql = 'SELECT pc.*,db1.name localAddrType,db2.name sendAddrType ,db3.name alarmReason,db4.name illnessType,db5.name illnessState,db6.name cureResult         ' +
            'from patientcase pc        LEFT OUTER JOIN dictionarybasic db1 on db1.id=pc.localAddrType_id LEFT OUTER JOIN dictionarybasic db2 on db2.id=pc.sendAddrType_id       ' +
            ' LEFT OUTER JOIN dictionarybasic db3 on db3.id=pc.alarmReason_id LEFT OUTER JOIN dictionarybasic db4 on db4.id=pc.illnessType_id        ' +
            'LEFT OUTER JOIN dictionarybasic db5 on db5.id=pc.illnessState_id LEFT OUTER JOIN dictionarybasic db6 on db6.id=pc.cureResult_id        WHERE pc.task_id=?';
    }
    var sqlData = [{
        statement: sql,
        params: param
    }
    ];

    db.select(sqlData, function (error, results) {
        if (error) {
            console.log(error.message);
        } else {
            res.json(results);
        }
    });
};

/*重大紧急事件情况统计页面*/
exports.getAccident = function (req, res) {
    var startTime = req.body.startTime;
    var endTime = req.body.endTime;
    var callPhone = req.body.callPhone;
    var eventName = req.body.eventName;
    var address = req.body.address;
    var eventType = req.body.eventType;
    var dispatcher = req.body.dispatcher;

    var sql = "SELECT e.eventName,e.firstAcceptTime,db.`name` eventType,e.firstAlarmCall,e.firstDisptcher,ea.localAddr,c.`name` centerName  from `event` e " +
        "LEFT OUTER JOIN eventaccept ea on ea.event_id=e.id  LEFT OUTER JOIN dictionarybasic db on db.id=e.eventType_id  LEFT OUTER JOIN center c on c.id=e.center_id  " +
        "WHERE e.accidentLevel_id<>108 and e.firstAcceptTime between ? and ?  ";
    var param = [startTime, endTime];

    if (!string.isBlankOrEmpty(eventType) && !string.isEquals('qb', eventType)) {
        sql += " and e.eventType_id=? ";
        param.push(eventType);
    }
    if (!string.isBlankOrEmpty(callPhone)) {
        sql += " and e.firstAlarmCall like ? ";
        callPhone = '%' + callPhone + '%';
        param.push(callPhone);
    }
    if (!string.isBlankOrEmpty(eventName)) {
        sql += " and e.eventName like ? ";
        eventName = '%' + eventName + '%';
        param.push(eventName);
    }
    if (!string.isBlankOrEmpty(address)) {
        sql += " and ea.localAddr like ? ";
        address = '%' + address + '%';
        param.push(address);
    }
    if (!string.isBlankOrEmpty(dispatcher)) {
        sql += " and e.firstDisptcher like ? ";
        dispatcher = '%' + dispatcher + '%';
        param.push(dispatcher);
    }
    var sqlData = [{
        statement: sql,
        params: param
    }
    ];

    db.select(sqlData, function (error, results) {
        if (error) {
            console.log(error.message);
        } else {
            res.json(results);
        }
    });
};

/* 导出重大紧急事件情况统计页面*/
exports.exportAccident = function (req, res) {
    var startTime = req.query.startTime;
    var endTime = req.query.endTime;
    var callPhone = req.query.callPhone;
    var eventName = req.query.eventName;
    var address = req.query.address;
    var eventType = req.query.eventType;
    var dispatcher = req.query.dispatcher;

    var sql = "SELECT e.eventName,e.firstAcceptTime,db.`name` eventType,e.firstAlarmCall,e.firstDisptcher,ea.localAddr,c.`name` centerName  from `event` e " +
        "LEFT OUTER JOIN eventaccept ea on ea.event_id=e.id  LEFT OUTER JOIN dictionarybasic db on db.id=e.eventType_id  LEFT OUTER JOIN center c on c.id=e.center_id  " +
        "WHERE e.accidentLevel_id<>108 and e.firstAcceptTime between ? and ?  ";
    var param = [startTime, endTime];

    if (!string.isBlankOrEmpty(eventType) && !string.isEquals('qb', eventType)) {
        sql += " and e.eventType_id=? ";
        param.push(eventType);
    }
    if (!string.isBlankOrEmpty(callPhone)) {
        sql += " and e.firstAlarmCall like ? ";
        callPhone = '%' + callPhone + '%';
        param.push(callPhone);
    }
    if (!string.isBlankOrEmpty(eventName)) {
        sql += " and e.eventName like ? ";
        eventName = '%' + eventName + '%';
        param.push(eventName);
    }
    if (!string.isBlankOrEmpty(address)) {
        sql += " and ea.localAddr like ? ";
        address = '%' + address + '%';
        param.push(address);
    }
    if (!string.isBlankOrEmpty(dispatcher)) {
        sql += " and e.firstDisptcher like ? ";
        dispatcher = '%' + dispatcher + '%';
        param.push(dispatcher);
    }
    var sqlData = [{
        statement: sql,
        params: param
    }
    ];

    db.select(sqlData, function (error, results) {
        if (error) {
            console.log(error.message);
        } else {
            var config = {name: "表单一", fileName: "重大紧急事件情况统计页面"};
            var arrayDatas = new Array();
            var head = new Array('事件名称', '时间', '事件类别', '首次呼救电话', '调度员', '所属单位', '事发地点');
            arrayDatas.push(head);
            for (var i = 0; i < results.length; i++) {
                var array = new Array(results[i].eventName, results[i].firstAcceptTime || '',
                    results[i].eventType || '', results[i].firstAlarmCall || '', results[i].firstDisptcher || '', results[i].centerName || '', results[i].localAddr || '');
                arrayDatas.push(array);
            }
            excel.exportExcel(config, arrayDatas, res);
        }
    });
}

/*调度员工作统计页面*/
exports.getDispatcherWorkload = function (req, res) {
    var startTime = req.body.startTime;
    var endTime = req.body.endTime;
    var sqlData = [{
        statement: "SELECT a.name,a.total,a.intele,a.outtele,b.sendCars,b.commonComplete,b.stopTask,b.takeBacks    from (SELECT u.`name`,COUNT(tl.id) total,sum(case WHEN tl.telLogType_id in (32,33,34,35,36,37) then 1 else 0 END) intele, " +
        "sum(case WHEN tl.telLogType_id in (38) then 1 else 0 END) outtele from telelog tl LEFT OUTER JOIN `user` u on u.id=tl.dispatcher_id WHERE tl.buildTime BETWEEN ? and ?  " +
        "GROUP BY u.`name`) a,(SELECT u.`name`,COUNT(t.task_id) sendCars,	sum(case WHEN t.isStop=0 then 1 else 0 END) commonComplete, sum(case WHEN t.isStop=1 then 1 else 0 END) stopTask,sum(t.actualPatientCount) takeBacks  " +
        "from `event` e LEFT OUTER JOIN eventaccept ea on e.id=ea.event_id  LEFT OUTER JOIN task t on t.acceptOrder=ea.acceptOrder and t.event_id=ea.event_id  LEFT OUTER JOIN  `user` u on u.id=t.disptcher_id  " +
        "where e.isTest=0 and e.firstAcceptTime BETWEEN ? and ? GROUP BY u.`name`) b  WHERE a.name=b.`name`",
        params: [startTime, endTime, startTime, endTime]
    }
    ];

    db.select(sqlData, function (error, results) {
        if (error) {
            console.log(error.message);
        } else {
            res.json(results);
        }
    });
}

/* 导出调度员工作统计页面*/
exports.exportDispatcherWorkload = function (req, res) {
    var startTime = req.query.startTime;
    var endTime = req.query.endTime;
    var sqlData = [{
        statement: "SELECT a.name,a.total,a.intele,a.outtele,b.sendCars,b.commonComplete,b.stopTask,b.takeBacks    from (SELECT u.`name`,COUNT(tl.id) total,sum(case WHEN tl.telLogType_id in (32,33,34,35,36,37) then 1 else 0 END) intele, " +
        "sum(case WHEN tl.telLogType_id in (38) then 1 else 0 END) outtele from telelog tl LEFT OUTER JOIN `user` u on u.id=tl.dispatcher_id WHERE tl.buildTime BETWEEN ? and ?  " +
        "GROUP BY u.`name`) a,(SELECT u.`name`,COUNT(t.task_id) sendCars,	sum(case WHEN t.isStop=0 then 1 else 0 END) commonComplete, sum(case WHEN t.isStop=1 then 1 else 0 END) stopTask,sum(t.actualPatientCount) takeBacks  " +
        "from `event` e LEFT OUTER JOIN eventaccept ea on e.id=ea.event_id  LEFT OUTER JOIN task t on t.acceptOrder=ea.acceptOrder and t.event_id=ea.event_id  LEFT OUTER JOIN  `user` u on u.id=t.disptcher_id  " +
        "where e.isTest=0 and e.firstAcceptTime BETWEEN ? and ? GROUP BY u.`name`) b  WHERE a.name=b.`name`",
        params: [startTime, endTime, startTime, endTime]
    }
    ];

    db.select(sqlData, function (error, results) {
        if (error) {
            console.log(error.message);
        } else {
            var config = {name: "表单一", fileName: "调度员工作统计页面"};
            var arrayDatas = new Array();
            var head = new Array('调度员', '电话总数', '接入电话', '打出电话', '派车数', '正常完成', '空车', '接回病人数');
            arrayDatas.push(head);
            for (var i = 0; i < results.length; i++) {
                var array = new Array(results[i].name, results[i].total,
                    results[i].intele, results[i].outtele, results[i].sendCars, results[i].commonComplete, results[i].stopTask, results[i].takeBacks);
                arrayDatas.push(array);
            }
            excel.exportExcel(config, arrayDatas, res);
        }
    });
}

/*出车记录表页面*/
exports.getOutCarRecord = function (req, res) {
    var startTime = req.body.startTime;
    var endTime = req.body.endTime;
    var sqlData = [{
        statement: "SELECT t.receiveCommandTime,CASE WHEN t.isStop=0 THEN '正常完成' WHEN t.isStop=1 then '中止任务' ELSE '其他' END taskResult, s.name,e.eventName," +
        "t.actualSendAddr,t.actualPatientCount,t.remark  from `event` e LEFT OUTER JOIN eventaccept ea on e.id=ea.event_id  " +
        "LEFT OUTER JOIN task t on t.acceptOrder=ea.acceptOrder and t.event_id=ea.event_id  LEFT OUTER JOIN station s on t.station_id=s.id  " +
        "where e.isTest=0 and e.firstAcceptTime between ? and ?",
        params: [startTime, endTime]
    }
    ];

    db.select(sqlData, function (error, results) {
        if (error) {
            console.log(error.message);
        } else {
            res.json(results);
        }
    });
}

/* 导出出车记录表页面*/
exports.exportOutCarRecord = function (req, res) {
    var startTime = req.query.startTime;
    var endTime = req.query.endTime;
    var sqlData = [{
        statement: "SELECT t.receiveCommandTime,CASE WHEN t.isStop=0 THEN '正常完成' WHEN t.isStop=1 then '中止任务' ELSE '其他' END taskResult, s.name,e.eventName," +
        "t.actualSendAddr,t.actualPatientCount,t.remark  from `event` e LEFT OUTER JOIN eventaccept ea on e.id=ea.event_id  " +
        "LEFT OUTER JOIN task t on t.acceptOrder=ea.acceptOrder and t.event_id=ea.event_id  LEFT OUTER JOIN station s on t.station_id=s.id  " +
        "where e.isTest=0 and e.firstAcceptTime between ? and ?",
        params: [startTime, endTime]
    }
    ];

    db.select(sqlData, function (error, results) {
        if (error) {
            console.log(error.message);
        } else {
            var config = {name: "表单一", fileName: "出车记录表页面"};
            var arrayDatas = new Array();
            var head = new Array('接收命令时刻', '任务结果', '分站', '事件名称', '送往地点', '救治人数', '备注');
            arrayDatas.push(head);
            for (var i = 0; i < results.length; i++) {
                var array = new Array(results[i].receiveCommandTime || '', results[i].taskResult || '',
                    results[i].name || '', results[i].eventName || '', results[i].actualSendAddr || '', results[i].actualPatientCount || '', results[i].remark || '');
                arrayDatas.push(array);
            }
            excel.exportExcel(config, arrayDatas, res);
        }
    });
}

/*中止任务信息统计页面*/
exports.getStopTask = function (req, res) {
    var startTime = req.body.startTime;
    var endTime = req.body.endTime;
    var station = req.body.station;
    var carCode = req.body.carCode;
    var stopReason = req.body.stopReason;
    var dispatcher = req.body.dispatcher;
    var sql = "SELECT ea.localAddr,u.`name`,a.plateNo,t.outTime,t.finishTime,db.`name` stopReason,t.remark  from `event` e LEFT OUTER JOIN eventaccept ea on e.id=ea.event_id  " +
        "LEFT OUTER JOIN task t on ea.acceptOrder=t.acceptOrder and ea.event_id=t.event_id  LEFT OUTER JOIN `user` u on u.id=t.disptcher_id  LEFT OUTER JOIN ambulance a on a.id=t.amb_id " +
        " LEFT OUTER JOIN dictionarybasic db on db.id=t.stopReason_id  WHERE e.isTest=0 and e.firstAcceptTime between ? and ? ";

    var param = [startTime, endTime];
    if (!string.isBlankOrEmpty(station) && !string.isEquals('qb', station)) {
        sql += " and t.station_id=?";
        param.push(station);
    }
    if (!string.isBlankOrEmpty(carCode) && !string.isEquals('qb', carCode)) {
        sql += " and t.amb_id=?   ";
        param.push(carCode);
    }
    if (!string.isBlankOrEmpty(stopReason) && !string.isEquals('qb', stopReason)) {
        sql += " and t.stopReason_id=?";
        param.push(stopReason);
    }
    if (!string.isBlankOrEmpty(dispatcher) && !string.isEquals('qb', dispatcher)) {
        sql += " and t.disptcher_id=?";
        param.push(dispatcher);
    }
    var sqlData = [{
        statement: sql,
        params: param
    }
    ];

    db.select(sqlData, function (error, results) {
        if (error) {
            console.log(error.message);
        } else {
            res.json(results);
        }
    });
}

/* 导出中止任务信息统计页面*/
exports.exportStopTask = function (req, res) {
    var startTime = req.query.startTime;
    var endTime = req.query.endTime;
    var station = req.query.station;
    var carCode = req.query.carCode;
    var stopReason = req.query.stopReason;
    var dispatcher = req.query.dispatcher;
    var sql = "SELECT ea.localAddr,u.`name`,a.plateNo,t.outTime,t.finishTime,db.`name` stopReason,t.remark  from `event` e LEFT OUTER JOIN eventaccept ea on e.id=ea.event_id  " +
        "LEFT OUTER JOIN task t on ea.acceptOrder=t.acceptOrder and ea.event_id=t.event_id  LEFT OUTER JOIN `user` u on u.id=t.disptcher_id  LEFT OUTER JOIN ambulance a on a.id=t.amb_id " +
        " LEFT OUTER JOIN dictionarybasic db on db.id=t.stopReason_id  WHERE e.isTest=0 and e.firstAcceptTime between ? and ? ";

    var param = [startTime, endTime];
    if (!string.isBlankOrEmpty(station) && !string.isEquals('qb', station)) {
        sql += " and t.station_id=?";
        param.push(station);
    }
    if (!string.isBlankOrEmpty(carCode) && !string.isEquals('qb', carCode)) {
        sql += " and t.amb_id=?   ";
        param.push(carCode);
    }
    if (!string.isBlankOrEmpty(stopReason) && !string.isEquals('qb', stopReason)) {
        sql += " and t.stopReason_id=?";
        param.push(stopReason);
    }
    if (!string.isBlankOrEmpty(dispatcher) && !string.isEquals('qb', dispatcher)) {
        sql += " and t.disptcher_id=?";
        param.push(dispatcher);
    }
    var sqlData = [{
        statement: sql,
        params: param
    }
    ];

    db.select(sqlData, function (error, results) {
        if (error) {
            console.log(error.message);
        } else {
            var config = {name: "表单一", fileName: "中止任务信息统计页面"};
            var arrayDatas = new Array();
            var head = new Array('现场地址', '调度员', '车辆号码', '出车时间', '任务完成时时间', '中止原因', '备注说明');
            arrayDatas.push(head);
            for (var i = 0; i < results.length; i++) {
                var array = new Array(results[i].localAddr, results[i].name || '',
                    results[i].plateNo || '', results[i].outTime || '', results[i].finishTime || '', results[i].stopReason || '', results[i].remark || '');
                arrayDatas.push(array);
            }
            excel.exportExcel(config, arrayDatas, res);
        }
    });
}

/*中止任务原因统计页面*/
exports.getStopTaskReason = function (req, res) {
    var startTime = req.body.startTime;
    var endTime = req.body.endTime;
    var station = req.body.station;
    var sql = "select db.`name` stopReason,COUNT(*) times,''rate from `event` e LEFT OUTER JOIN eventaccept ea on e.id=ea.event_id LEFT OUTER JOIN task t on t.event_id=ea.event_id and t.acceptOrder=ea.acceptOrder " +
        "LEFT OUTER JOIN dictionarybasic db on db.id=t.stopReason_id  where e.isTest=0 and e.firstAcceptTime BETWEEN ? and ? and db.`name` is not null ";
    var param = [startTime, endTime];
    if (!string.isBlankOrEmpty(station) && !string.isEquals('qb', station)) {
        sql += " and t.station_id=? ";
        param = [startTime, endTime, station];
    }
    sql += " GROUP BY db.`name`";
    var sqlData = [{
        statement: sql,
        params: param
    }
    ];

    db.select(sqlData, function (error, results) {
        if (error) {
            console.log(error.message);
        } else {
            var total = 0;
            for (var i = 0; i < results.length; i++) {
                total += results[i].times;
            }
            for (var i = 0; i < results.length; i++) {
                results[i].rate = util.calculateRate(total, results[i].times);
            }
            res.json(results);
        }
    });
}

/* 导出中止任务原因统计页面*/
exports.exportStopTaskReason = function (req, res) {
    var startTime = req.query.startTime;
    var endTime = req.query.endTime;
    var station = req.query.station;
    var sql = "select db.`name` stopReason,COUNT(*) times,''rate from `event` e LEFT OUTER JOIN eventaccept ea on e.id=ea.event_id LEFT OUTER JOIN task t on t.event_id=ea.event_id and t.acceptOrder=ea.acceptOrder " +
        "LEFT OUTER JOIN dictionarybasic db on db.id=t.stopReason_id  where e.isTest=0 and e.firstAcceptTime BETWEEN ? and ? and db.`name` is not null ";
    var param = [startTime, endTime];
    if (!string.isBlankOrEmpty(station) && !string.isEquals('qb', station)) {
        sql += " and t.station_id=? ";
        param = [startTime, endTime, station];
    }
    sql += " GROUP BY db.`name`";
    var sqlData = [{
        statement: sql,
        params: param
    }
    ];

    db.select(sqlData, function (error, results) {
        if (error) {
            console.log(error.message);
        } else {
            var config = {name: "表单一", fileName: "中止任务原因统计页面"};
            var arrayDatas = new Array();
            var head = new Array('原因', '次数', '比率');
            arrayDatas.push(head);
            var total = 0;
            for (var i = 0; i < results.length; i++) {
                total += results[i].times;
            }
            for (var i = 0; i < results.length; i++) {
                results[i].rate = util.calculateRate(total, results[i].times);
                var array = new Array(results[i].stopReason, results[i].times,
                    results[i].rate);
                arrayDatas.push(array);
            }
            excel.exportExcel(config, arrayDatas, res);
        }
    });
}

/*车辆暂停调用情况页面*/
exports.getCarPause = function (req, res) {
    var startTime = req.body.startTime;
    var endTime = req.body.endTime;
    var station = req.body.station;
    var pauseReason = req.body.pauseReason;
    var carCode = req.body.carCode;
    var dispatcher = req.body.dispatcher;
    var sql = "select ap.plateNo,ap.driver,ap.pauseTime,ap.endTime,TIMESTAMPDIFF(SECOND,ap.pauseTime,ap.endTime) pauseTimes,db.`name` pauseReason," +
        "u.`name` pauseOperator FROM ambulancepauserecord ap  LEFT OUTER JOIN station s on s.id=ap.station_id  LEFT OUTER JOIN `user` u on u.id=ap.pauseOperator_id  " +
        "LEFT OUTER JOIN dictionarybasic db on db.id=ap.pauseReason_id  WHERE ap.pauseTime BETWEEN  ? and ? and ap.plateNo is not null ";
    var param = [startTime, endTime];
    if (!string.isBlankOrEmpty(station) && !string.isEquals('qb', station)) {
        sql += " and ap.station_id=?";
        param.push(station);
    }
    if (!string.isBlankOrEmpty(carCode) && !string.isEquals('qb', carCode)) {
        sql += " and ap.amb_id=?";
        param.push(carCode);
    }
    if (!string.isBlankOrEmpty(pauseReason) && !string.isEquals('qb', pauseReason)) {
        sql += " and ap.pauseReason_id=?";
        param.push(pauseReason);
    }

    if (!string.isBlankOrEmpty(dispatcher) && !string.isEquals('qb', dispatcher)) {
        sql += " and ap.pauseOperator_id=?";
        param.push(dispatcher);
    }
    var sqlData = [{
        statement: sql,
        params: param
    }
    ];

    db.select(sqlData, function (error, results) {
        if (error) {
            console.log(error.message);
        } else {
            for (var i = 0; i < results.length; i++) {
                results[i].pauseTimes = util.formatSecond(results[i].pauseTimes);
            }
            res.json(results);
        }
    });
}

/* 导出车辆暂停调用情况页面*/
exports.exportCarPause = function (req, res) {
    var startTime = req.query.startTime;
    var endTime = req.query.endTime;
    var station = req.query.station;
    var pauseReason = req.query.pauseReason;
    var carCode = req.query.carCode;
    var dispatcher = req.query.dispatcher;
    var sql = "select ap.plateNo,ap.driver,ap.pauseTime,ap.endTime,TIMESTAMPDIFF(SECOND,ap.pauseTime,ap.endTime) pauseTimes,db.`name` pauseReason," +
        "u.`name` pauseOperator FROM ambulancepauserecord ap  LEFT OUTER JOIN station s on s.id=ap.station_id  LEFT OUTER JOIN `user` u on u.id=ap.pauseOperator_id  " +
        "LEFT OUTER JOIN dictionarybasic db on db.id=ap.pauseReason_id  WHERE ap.pauseTime BETWEEN  ? and ? and ap.plateNo is not null ";
    var param = [startTime, endTime];
    if (!string.isBlankOrEmpty(station) && !string.isEquals('qb', station)) {
        sql += " and ap.station_id=?";
        param.push(station);
    }
    if (!string.isBlankOrEmpty(carCode) && !string.isEquals('qb', carCode)) {
        sql += " and ap.amb_id=?";
        param.push(carCode);
    }
    if (!string.isBlankOrEmpty(pauseReason) && !string.isEquals('qb', pauseReason)) {
        sql += " and ap.pauseReason_id=?";
        param.push(pauseReason);
    }

    if (!string.isBlankOrEmpty(dispatcher) && !string.isEquals('qb', dispatcher)) {
        sql += " and ap.pauseOperator_id=?";
        param.push(dispatcher);
    }
    var sqlData = [{
        statement: sql,
        params: param
    }
    ];

    db.select(sqlData, function (error, results) {
        if (error) {
            console.log(error.message);
        } else {
            var config = {name: "表单一", fileName: "车辆暂停调用情况页面"};
            var arrayDatas = new Array();
            var head = new Array('车辆', '司机', '暂停时刻', '结束时刻', '暂停时长', '暂停操作人', '暂停原因');
            arrayDatas.push(head);
            for (var i = 0; i < results.length; i++) {
                results[i].pauseTimes = util.formatSecond(results[i].pauseTimes);
                var array = new Array(results[i].plateNo, results[i].driver || '',
                    results[i].pauseTime || '', results[i].endTime || '', results[i].pauseTimes || '',
                    results[i].pauseOperator || '', results[i].pauseReason || '');
                arrayDatas.push(array);
            }
            excel.exportExcel(config, arrayDatas, res);
        }
    });
}

/*挂起事件流水统计页面*/
exports.getHungEvent = function (req, res) {
    var startTime = req.body.startTime;
    var endTime = req.body.endTime;
    var dispatcher = req.body.dispatcher;
    var hungReason = req.body.hungReason;
    var sql = "SELECT e.eventName,db1.`name` acceptType,db.`name` hungReason,u.`name` dispatcher,ea.acceptEndTime  from `event` e LEFT OUTER JOIN eventaccept ea on ea.event_id=e.id " +
        "LEFT OUTER JOIN task t on e.id=t.event_id and ea.acceptOrder=t.acceptOrder  LEFT OUTER JOIN dictionarybasic db on db.id=ea.reason_id  " +
        "LEFT OUTER JOIN `user` u on ea.disptcher_id=u.id  LEFT OUTER JOIN dictionarybasic db1 on db1.id=ea.acceptType_id  " +
        "WHERE e.isTest=0 AND ea.acceptType_id in (19,21,25) and e.firstAcceptTime BETWEEN  ? and ? ";
    var param = param = [startTime, endTime];
    if (!string.isBlankOrEmpty(dispatcher) && !string.isEquals('qb', dispatcher)) {
        sql += " and ea.disptcher_id=? ";
        param.push(dispatcher);
    }
    if (!string.isBlankOrEmpty(hungReason) && !string.isEquals('qb', hungReason)) {
        sql += " and ea.reason_id=? ";
        param.push(hungReason);
    }
    var sqlData = [{
        statement: sql,
        params: param
    }
    ];

    db.select(sqlData, function (error, results) {
        if (error) {
            console.log(error.message);
        } else {
            res.json(results);
        }
    });
}

/* 导出挂起事件流水统计页面*/
exports.exportHungEvent = function (req, res) {
    var startTime = req.query.startTime;
    var endTime = req.query.endTime;
    var dispatcher = req.query.dispatcher;
    var hungReason = req.query.hungReason;
    var sql = "SELECT e.eventName,db1.`name` acceptType,db.`name` hungReason,u.`name` dispatcher,ea.acceptEndTime  from `event` e LEFT OUTER JOIN eventaccept ea on ea.event_id=e.id " +
        "LEFT OUTER JOIN task t on e.id=t.event_id and ea.acceptOrder=t.acceptOrder  LEFT OUTER JOIN dictionarybasic db on db.id=ea.reason_id  " +
        "LEFT OUTER JOIN `user` u on ea.disptcher_id=u.id  LEFT OUTER JOIN dictionarybasic db1 on db1.id=ea.acceptType_id  " +
        "WHERE e.isTest=0 AND ea.acceptType_id in (19,21,25) and e.firstAcceptTime BETWEEN  ? and ? ";
    var param = param = [startTime, endTime];
    if (!string.isBlankOrEmpty(dispatcher) && !string.isEquals('qb', dispatcher)) {
        sql += " and ea.disptcher_id=? ";
        param.push(dispatcher);
    }
    if (!string.isBlankOrEmpty(hungReason) && !string.isEquals('qb', hungReason)) {
        sql += " and ea.reason_id=? ";
        param.push(hungReason);
    }
    var sqlData = [{
        statement: sql,
        params: param
    }
    ];

    db.select(sqlData, function (error, results) {
        if (error) {
            console.log(error.message);
        } else {
            var config = {name: "表单一", fileName: "挂起事件流水统计页面"};
            var arrayDatas = new Array();
            var head = new Array('事件名称', '挂起类型', '挂起原因', '操作人', '挂起时刻');
            arrayDatas.push(head);
            for (var i = 0; i < results.length; i++) {
                var array = new Array(results[i].eventName, results[i].acceptType,
                    results[i].hungReason || '', results[i].dispatcher || '', results[i].acceptEndTime || '');
                arrayDatas.push(array);
            }
            excel.exportExcel(config, arrayDatas, res);
        }
    });
}

/*挂起事件原因统计页面*/
exports.getHungEventReason = function (req, res) {
    var startTime = req.body.startTime;
    var endTime = req.body.endTime;
    var dispatcher = req.body.dispatcher;
    var sql = "select db.`name` hungReason,COUNT(*) times,'' rate   from `event` e LEFT OUTER JOIN eventaccept ea on ea.event_id=e.id   " +
        "LEFT OUTER JOIN dictionarybasic db on db.id=ea.reason_id  " +
        "WHERE e.isTest=0 and db.name is not null AND ea.acceptType_id in (19,21,25) and e.firstAcceptTime BETWEEN  ? and ? ";
    var param = [startTime, endTime];
    if (!string.isBlankOrEmpty(dispatcher) && !string.isEquals('qb', dispatcher)) {
        sql += " and ea.disptcher_id=? ";
        param = [startTime, endTime, dispatcher];
    }
    sql += "group by db.name";
    var sqlData = [{
        statement: sql,
        params: param
    }
    ];

    db.select(sqlData, function (error, results) {
        if (error) {
            console.log(error.message);
        } else {
            var total = 0;
            for (var i = 0; i < results.length; i++) {
                total += total + results[i].times;
            }
            for (var i = 0; i < results.length; i++) {
                results[i].rate = util.calculateRate(total, results[i].times);
            }
            res.json(results);
        }
    });
}

/* 导出挂起原因统计页面*/
exports.exportHungEventReason = function (req, res) {
    var startTime = req.query.startTime;
    var endTime = req.query.endTime;
    var dispatcher = req.query.dispatcher;
    var sql = "select db.`name` hungReason,COUNT(*) times,'' rate   from `event` e LEFT OUTER JOIN eventaccept ea on ea.event_id=e.id   " +
        "LEFT OUTER JOIN dictionarybasic db on db.id=ea.reason_id  " +
        "WHERE e.isTest=0 and db.name is not null AND ea.acceptType_id in (19,21,25) and e.firstAcceptTime BETWEEN  ? and ? ";
    var param = [startTime, endTime];
    if (!string.isBlankOrEmpty(dispatcher) && !string.isEquals('qb', dispatcher)) {
        sql += " and ea.disptcher_id=? ";
        param = [startTime, endTime, dispatcher];
    }
    sql += "group by db.name";
    var sqlData = [{
        statement: sql,
        params: param
    }
    ];

    db.select(sqlData, function (error, results) {
        if (error) {
            console.log(error.message);
        } else {
            var config = {name: "表单一", fileName: "挂起原因统计页面"};
            var arrayDatas = new Array();
            var head = new Array('原因', '次数', '比率');
            arrayDatas.push(head);
            var total = 0;
            for (var i = 0; i < results.length; i++) {
                total += total + results[i].times;
            }
            for (var i = 0; i < results.length; i++) {
                results[i].rate = util.calculateRate(total, results[i].times);
                var array = new Array(results[i].hungReason, results[i].times,
                    results[i].rate);
                arrayDatas.push(array);
            }
            excel.exportExcel(config, arrayDatas, res);
        }
    });
}

/*中心接警情况统计页面*/
exports.getAnswerAlarm = function (req, res) {
    var startTime = req.body.startTime;
    var endTime = req.body.endTime;
    var alarmPhone = req.body.alarmPhone;
    var dispatcher = req.body.dispatcher;
    var siteAddress = req.body.siteAddress;
    var sql = "select ea.ringTime,e.firstSendAmbTime,ea.alarmCall,ea.linkTel,ea.localAddr,ea.illness,u.`name` disptcherName  from `event` e " +
        "LEFT OUTER JOIN eventaccept ea on ea.event_id=e.id  LEFT OUTER JOIN `user` u on u.id=ea.disptcher_id  where e.isTest=0 and e.firstAcceptTime BETWEEN  ? and ? ";
    var param = [startTime, endTime];
    if (!string.isBlankOrEmpty(alarmPhone)) {
        alarmPhone = '%' + alarmPhone + '%';
        sql += " and ea.alarmCall like ? ";
        param.push(alarmPhone);
    }
    if (!string.isBlankOrEmpty(siteAddress)) {
        siteAddress = '%' + siteAddress + '%';
        sql += " and ea.localAddr like ?";
        param.push(siteAddress);
    }
    if (!string.isBlankOrEmpty(dispatcher) && !string.isEquals('qb', dispatcher)) {
        sql += "  and ea.disptcher_id=?";
        param.push(dispatcher);
    }
    var sqlData = [{
        statement: sql,
        params: param
    }
    ];

    db.select(sqlData, function (error, results) {
        if (error) {
            console.log(error.message);
        } else {
            res.json(results);
        }
    });
}

/* 导出中心接警情况统计页面*/
exports.exportAnswerAlarm = function (req, res) {
    var startTime = req.query.startTime;
    var endTime = req.query.endTime;
    var alarmPhone = req.query.alarmPhone;
    var dispatcher = req.query.dispatcher;
    var siteAddress = req.query.siteAddress;
    var sql = "select ea.ringTime,e.firstSendAmbTime,ea.alarmCall,ea.linkTel,ea.localAddr,ea.illness,u.`name` disptcherName  from `event` e " +
        "LEFT OUTER JOIN eventaccept ea on ea.event_id=e.id  LEFT OUTER JOIN `user` u on u.id=ea.disptcher_id  where e.isTest=0 and e.firstAcceptTime BETWEEN  ? and ? ";
    var param = [startTime, endTime];
    if (!string.isBlankOrEmpty(alarmPhone)) {
        alarmPhone = '%' + alarmPhone + '%';
        sql += " and ea.alarmCall like ? ";
        param.push(alarmPhone);
    }
    if (!string.isBlankOrEmpty(siteAddress)) {
        siteAddress = '%' + siteAddress + '%';
        sql += " and ea.localAddr like ?";
        param.push(siteAddress);
    }
    if (!string.isBlankOrEmpty(dispatcher) && !string.isEquals('qb', dispatcher)) {
        sql += "  and ea.disptcher_id=?";
        param.push(dispatcher);
    }
    var sqlData = [{
        statement: sql,
        params: param
    }
    ];

    db.select(sqlData, function (error, results) {
        if (error) {
            console.log(error.message);
        } else {
            var config = {name: "表单一", fileName: "中心接警情况统计页面"};
            var arrayDatas = new Array();
            var head = new Array('报警时间', '首次派车时间', '报警电话', '相关电话', '报警地址', '病种判断', '调度员');
            arrayDatas.push(head);
            for (var i = 0; i < results.length; i++) {
                var array = new Array(results[i].ringTime, results[i].firstSendAmbTime,
                    results[i].alarmCall, results[i].linkTel, results[i].localAddr || '',
                    results[i].illness || '', results[i].disptcherName || '');
                arrayDatas.push(array);
            }
            excel.exportExcel(config, arrayDatas, res);
        }
    });
}

/*急救站出诊情况查询页面*/
exports.getSubstationVisit = function (req, res) {
    var startTime = req.body.startTime;
    var endTime = req.body.endTime;
    var sqlData = [{
        statement: "select s.hospitalName,COUNT(*) sendNumbers,SUM(case when t.isStop=0 then 1 else 0 END) nomalNumbers,'' nomalRate, " +
        "SUM(case when t.isStop=1 then 1 else 0 END) stopNumbers,'' stopRate,sum(t.actualPatientCount) takeBacks from `event` e " +
        "LEFT OUTER JOIN eventaccept ea on ea.event_id=e.id LEFT OUTER JOIN task t on t.event_id=ea.event_id and t.acceptOrder=ea.acceptOrder " +
        "LEFT OUTER JOIN `user` u on u.id=ea.disptcher_id  LEFT OUTER JOIN station s on s.id=t.station_id  where e.isTest=0 and e.firstAcceptTime BETWEEN ? and ? GROUP BY s.hospitalName ",
        params: [startTime, endTime]
    }
    ];
    db.select(sqlData, function (error, results) {
        if (error) {
            console.log(error.message);
        } else {
            for (var i = 0; i < results.length; i++) {
                results[i].nomalRate = util.calculateRate(results[i].sendNumbers, results[i].nomalNumbers);
                results[i].stopRate = util.calculateRate(results[i].sendNumbers, results[i].stopNumbers);
            }
            res.json(results);
        }
    });
}

/* 导出急救站出诊情况查询页面*/
exports.exportSubstationVisit = function (req, res) {
    var startTime = req.query.startTime;
    var endTime = req.query.endTime;
    var sqlData = [{
        statement: "select s.hospitalName,COUNT(*) sendNumbers,SUM(case when t.isStop=0 then 1 else 0 END) nomalNumbers,'' nomalRate, " +
        "SUM(case when t.isStop=1 then 1 else 0 END) stopNumbers,'' stopRate,sum(t.actualPatientCount) takeBacks from `event` e " +
        "LEFT OUTER JOIN eventaccept ea on ea.event_id=e.id LEFT OUTER JOIN task t on t.event_id=ea.event_id and t.acceptOrder=ea.acceptOrder " +
        "LEFT OUTER JOIN `user` u on u.id=ea.disptcher_id  LEFT OUTER JOIN station s on s.id=t.station_id  where e.isTest=0 and e.firstAcceptTime BETWEEN ? and ? GROUP BY s.hospitalName ",
        params: [startTime, endTime]
    }
    ];
    db.select(sqlData, function (error, results) {
        if (error) {
            console.log(error.message);
        } else {
            var config = {name: "表单一", fileName: "急救站出诊情况查询页面"};
            var arrayDatas = new Array();
            var head = new Array('分站名称', '120派诊', '正常完成', '正常完成比率', '中止任务', '中止任务比率', '实际救治人数');
            arrayDatas.push(head);
            for (var i = 0; i < results.length; i++) {
                results[i].nomalRate = util.calculateRate(results[i].sendNumbers, results[i].nomalNumbers);
                results[i].stopRate = util.calculateRate(results[i].sendNumbers, results[i].stopNumbers);
                var array = new Array(results[i].hospitalName, results[i].sendNumbers,
                    results[i].nomalNumbers, results[i].nomalRate, results[i].stopNumbers,
                    results[i].stopRate, results[i].takeBacks || '');
                arrayDatas.push(array);
            }
            excel.exportExcel(config, arrayDatas, res);
        }
    });
}

/*急救站晚出诊统计页面*/
exports.getSubstationLateVisit = function (req, res) {
    var startTime = req.body.startTime;
    var endTime = req.body.endTime;
    var station = req.body.station;
    var outCarTimesMin = req.body.outCarTimesMin;
    var outCarTimesMax = req.body.outCarTimesMax;
    var sql = "select s.hospitalName,db.name eventType,t.plateNo,t.sendCommandTime,t.outTime,case when t.isStop=0 then '正常完成' else '中止任务' end isStop,t.remark,u.`name` disptcher,ea.localAddr,TIMESTAMPDIFF(SECOND,t.sendCommandTime,t.outTime) outCarTimes   from `event` e " +
        "LEFT OUTER JOIN eventaccept ea on ea.event_id=e.id LEFT OUTER JOIN task t on t.event_id=ea.event_id and t.acceptOrder=ea.acceptOrder " +
        "LEFT OUTER JOIN `user` u on u.id=ea.disptcher_id  LEFT OUTER JOIN station s on s.id=t.station_id  LEFT OUTER JOIN dictionarybasic db ON db.id=e.eventType_id  " +
        "where e.isTest=0 and e.firstAcceptTime BETWEEN ? and ?  ";
    var param = [startTime, endTime];
    if (!string.isBlankOrEmpty(station) && !string.isEquals('qb', station)) {
        sql += " and t.station_id=? ";
        param.push(station);
    }
    if (!string.isBlankOrEmpty(outCarTimesMin)) {
        sql += " and TIMESTAMPDIFF(SECOND,t.sendCommandTime,t.outTime)>=? ";
        param.push(outCarTimesMin);
    }
    if (!string.isBlankOrEmpty(outCarTimesMax)) {
        sql += " and TIMESTAMPDIFF(SECOND,t.sendCommandTime,t.outTime)<=? ";
        param.push(outCarTimesMax);
    }
    sql += "  GROUP BY s.hospitalName";
    var sqlData = [{
        statement: sql,
        params: param
    }
    ];

    db.select(sqlData, function (error, results) {
        if (error) {
            console.log(error.message);
        } else {
            for (var i = 0; i < results.length; i++) {
                results[i].outCarTimes = util.formatSecond(results[i].outCarTimes);
            }
            res.json(results);
        }
    });
}

/* 导出急救站晚出诊统计页面*/
exports.exportSubstationLateVisit = function (req, res) {
    var startTime = req.query.startTime;
    var endTime = req.query.endTime;
    var station = req.query.station;
    var outCarTimesMin = req.query.outCarTimesMin;
    var outCarTimesMax = req.query.outCarTimesMax;
    var sql = "select s.hospitalName,db.name eventType,t.plateNo,t.sendCommandTime,t.outTime,case when t.isStop=0 then '正常完成' else '中止任务' end isStop,t.remark,u.`name` disptcher,ea.localAddr,TIMESTAMPDIFF(SECOND,t.sendCommandTime,t.outTime) outCarTimes   from `event` e " +
        "LEFT OUTER JOIN eventaccept ea on ea.event_id=e.id LEFT OUTER JOIN task t on t.event_id=ea.event_id and t.acceptOrder=ea.acceptOrder " +
        "LEFT OUTER JOIN `user` u on u.id=ea.disptcher_id  LEFT OUTER JOIN station s on s.id=t.station_id  LEFT OUTER JOIN dictionarybasic db ON db.id=e.eventType_id  " +
        "where e.isTest=0 and e.firstAcceptTime BETWEEN ? and ?  ";
    var param = [startTime, endTime];
    if (!string.isBlankOrEmpty(station) && !string.isEquals('qb', station)) {
        sql += " and t.station_id=? ";
        param.push(station);
    }
    if (!string.isBlankOrEmpty(outCarTimesMin)) {
        sql += " and TIMESTAMPDIFF(SECOND,t.sendCommandTime,t.outTime)>=? ";
        param.push(outCarTimesMin);
    }
    if (!string.isBlankOrEmpty(outCarTimesMax)) {
        sql += " and TIMESTAMPDIFF(SECOND,t.sendCommandTime,t.outTime)<=? ";
        param.push(outCarTimesMax);
    }
    sql += "  GROUP BY s.hospitalName";
    var sqlData = [{
        statement: sql,
        params: param
    }
    ];

    db.select(sqlData, function (error, results) {
        if (error) {
            console.log(error.message);
        } else {
            var config = {name: "表单一", fileName: "急救站晚出诊统计页面"};
            var arrayDatas = new Array();
            var head = new Array('急救站', '现场地址', '事件类型', '车牌号码', '发送指令时刻', '出车时刻', '出车时长', '出车结果', '任务备注', '调度员');
            arrayDatas.push(head);
            for (var i = 0; i < results.length; i++) {
                results[i].outCarTimes = util.formatSecond(results[i].outCarTimes);
                var array = new Array(results[i].hospitalName, results[i].localAddr,
                    results[i].eventType, results[i].plateNo, results[i].sendCommandTime,
                    results[i].outCarTime, results[i].outCarTimes, results[i].isStop, results[i].remark || '', results[i].disptcher);
                arrayDatas.push(array);
            }
            excel.exportExcel(config, arrayDatas, res);
        }
    });
}

/*司机工作情况查询页面*/
exports.getDriverWork = function (req, res) {
    var startTime = req.body.startTime;
    var endTime = req.body.endTime;
    var sqlData = [{
        statement: "SELECT t.driver,COUNT(*) outCarNumbers,SUM(case when t.isStop=0 then 0 else 0 END) nomalNumbers,SUM(case when t.isStop=1 then 0 else 0 END) stopNumbers, "
        + "avg(TIMESTAMPDIFF(SECOND,t.sendCommandTime,t.outTime)) averageOutCarTimes,avg(TIMESTAMPDIFF(SECOND,t.outTime,t.arriveSceneTime)) averageArriveSpotTimes   from `event` e LEFT OUTER JOIN eventaccept ea on ea.event_id=e.id "
        + "LEFT OUTER JOIN task t on ea.event_id=t.event_id and ea.acceptOrder=t.acceptOrder    WHERE e.isTest=0 and e.firstAcceptTime BETWEEN ? and ?     GROUP BY t.driver  ",
        params: [startTime, endTime]
    }
    ];
    db.select(sqlData, function (error, results) {
        if (error) {
            console.log(error.message);
        } else {
            for (var i = 0; i < results.length; i++) {
                results[i].averageOutCarTimes = util.formatSecond(results[i].averageOutCarTimes);
                results[i].averageArriveSpotTimes = util.formatSecond(results[i].averageArriveSpotTimes);
            }
            res.json(results);
        }
    });
}

/* 导出司机工作情况查询页面*/
exports.exportDriverWork = function (req, res) {
    var startTime = req.query.startTime;
    var endTime = req.query.endTime;
    var sqlData = [{
        statement: "SELECT t.driver,COUNT(*) outCarNumbers,SUM(case when t.isStop=0 then 0 else 0 END) nomalNumbers,SUM(case when t.isStop=1 then 0 else 0 END) stopNumbers, "
        + "avg(TIMESTAMPDIFF(SECOND,t.sendCommandTime,t.outTime)) averageOutCarTimes,avg(TIMESTAMPDIFF(SECOND,t.outTime,t.arriveSceneTime)) averageArriveSpotTimes   from `event` e LEFT OUTER JOIN eventaccept ea on ea.event_id=e.id "
        + "LEFT OUTER JOIN task t on ea.event_id=t.event_id and ea.acceptOrder=t.acceptOrder    WHERE e.isTest=0 and e.firstAcceptTime BETWEEN ? and ?     GROUP BY t.driver  ",
        params: [startTime, endTime]
    }
    ];
    db.select(sqlData, function (error, results) {
        if (error) {
            console.log(error.message);
        } else {
            var config = {name: "表单一", fileName: "司机工作情况查询页面"};
            var arrayDatas = new Array();
            var head = new Array('司机', '出车次数', '正常完成次数', '中止数', '平均出车时间', '平均到达时间');
            arrayDatas.push(head);
            for (var i = 0; i < results.length; i++) {
                results[i].averageOutCarTimes = util.formatSecond(results[i].averageOutCarTimes);
                results[i].averageArriveSpotTimes = util.formatSecond(results[i].averageArriveSpotTimes);
                var array = new Array(results[i].driver, results[i].outCarNumbers,
                    results[i].nomalNumbers, results[i].stopNumbers, results[i].averageOutCarTimes,
                    results[i].averageArriveSpotTimes);
                arrayDatas.push(array);
            }
            excel.exportExcel(config, arrayDatas, res);
        }
    });
}

/*医生工作情况查询页面*/
exports.getDoctorWork = function (req, res) {
    var startTime = req.body.startTime;
    var endTime = req.body.endTime;
    var sqlData = [{
        statement: "SELECT t.doctor,COUNT(*) outCarNumbers,SUM(case when t.isStop=0 then 0 else 0 END) nomalNumbers,SUM(case when t.isStop=1 then 0 else 0 END) stopNumbers, "
        + "sum(t.actualPatientCount) curePeopleNumbers,avg(TIMESTAMPDIFF(SECOND,t.outTime,t.arriveSceneTime)) averateCureTimes   from `event` e LEFT OUTER JOIN eventaccept ea on ea.event_id=e.id "
        + "LEFT OUTER JOIN task t on ea.event_id=t.event_id and ea.acceptOrder=t.acceptOrder    WHERE e.isTest=0 and e.firstAcceptTime BETWEEN ? and ?     GROUP BY t.doctor  ",
        params: [startTime, endTime]
    }
    ];

    db.select(sqlData, function (error, results) {
        if (error) {
            console.log(error.message);
        } else {
            for (var i = 0; i < results.length; i++) {
                results[i].averateCureTimes = util.formatSecond(results[i].averateCureTimes);
            }
            res.json(results);
        }
    });
}

/* 导出医生工作情况查询页面*/
exports.exportDoctorWork = function (req, res) {
    var startTime = req.query.startTime;
    var endTime = req.query.endTime;
    var sqlData = [{
        statement: "SELECT t.doctor,COUNT(*) outCarNumbers,SUM(case when t.isStop=0 then 0 else 0 END) nomalNumbers,SUM(case when t.isStop=1 then 0 else 0 END) stopNumbers, "
        + "sum(t.actualPatientCount) curePeopleNumbers,avg(TIMESTAMPDIFF(SECOND,t.outTime,t.arriveSceneTime)) averateCureTimes   from `event` e LEFT OUTER JOIN eventaccept ea on ea.event_id=e.id "
        + "LEFT OUTER JOIN task t on ea.event_id=t.event_id and ea.acceptOrder=t.acceptOrder    WHERE e.isTest=0 and e.firstAcceptTime BETWEEN ? and ?     GROUP BY t.doctor  ",
        params: [startTime, endTime]
    }
    ];

    db.select(sqlData, function (error, results) {
        if (error) {
            console.log(error.message);
        } else {
            var config = {name: "表单一", fileName: "医生工作情况查询页面"};
            var arrayDatas = new Array();
            var head = new Array('医生', '出车次数', '正常完成次数', '中止数', '救治人数', '平均救治时间');
            arrayDatas.push(head);
            for (var i = 0; i < results.length; i++) {
                results[i].averateCureTimes = util.formatSecond(results[i].averateCureTimes);
                var array = new Array(results[i].doctor, results[i].outCarNumbers,
                    results[i].nomalNumbers, results[i].stopNumbers, results[i].curePeopleNumbers || '',
                    results[i].averateCureTimes);
                arrayDatas.push(array);
            }
            excel.exportExcel(config, arrayDatas, res);
        }
    });
}

/*护士工作情况查询页面*/
exports.getNurseWork = function (req, res) {
    var startTime = req.body.startTime;
    var endTime = req.body.endTime;
    var sqlData = [{
        statement: "SELECT t.nurse,COUNT(*) outCarNumbers,SUM(case when t.isStop=0 then 0 else 0 END) nomalNumbers,SUM(case when t.isStop=1 then 0 else 0 END) stopNumbers, "
        + "sum(t.actualPatientCount) curePeopleNumbers,avg(TIMESTAMPDIFF(SECOND,t.outTime,t.arriveSceneTime)) averateCureTimes   from `event` e LEFT OUTER JOIN eventaccept ea on ea.event_id=e.id "
        + "LEFT OUTER JOIN task t on ea.event_id=t.event_id and ea.acceptOrder=t.acceptOrder    WHERE e.isTest=0 and e.firstAcceptTime BETWEEN ? and ?     GROUP BY t.nurse  ",
        params: [startTime, endTime]
    }
    ];

    db.select(sqlData, function (error, results) {
        if (error) {
            console.log(error.message);
        } else {
            for (var i = 0; i < results.length; i++) {
                results[i].averateCureTimes = util.formatSecond(results[i].averateCureTimes);
            }
            res.json(results);
        }
    });
}

/* 导出护士工作情况查询页面*/
exports.exportNurseWork = function (req, res) {
    var startTime = req.query.startTime;
    var endTime = req.query.endTime;
    var sqlData = [{
        statement: "SELECT t.nurse,COUNT(*) outCarNumbers,SUM(case when t.isStop=0 then 0 else 0 END) nomalNumbers,SUM(case when t.isStop=1 then 0 else 0 END) stopNumbers, "
        + "sum(t.actualPatientCount) curePeopleNumbers,avg(TIMESTAMPDIFF(SECOND,t.outTime,t.arriveSceneTime)) averateCureTimes   from `event` e LEFT OUTER JOIN eventaccept ea on ea.event_id=e.id "
        + "LEFT OUTER JOIN task t on ea.event_id=t.event_id and ea.acceptOrder=t.acceptOrder    WHERE e.isTest=0 and e.firstAcceptTime BETWEEN ? and ?     GROUP BY t.nurse  ",
        params: [startTime, endTime]
    }
    ];

    db.select(sqlData, function (error, results) {
        if (error) {
            console.log(error.message);
        } else {
            var config = {name: "表单一", fileName: "护士工作情况查询页面"};
            var arrayDatas = new Array();
            var head = new Array('护士', '出车次数', '正常完成次数', '中止数', '救治人数', '平均救治时间');
            arrayDatas.push(head);
            for (var i = 0; i < results.length; i++) {
                results[i].averateCureTimes = util.formatSecond(results[i].averateCureTimes);
                var array = new Array(results[i].nurse, results[i].outCarNumbers,
                    results[i].nomalNumbers, results[i].stopNumbers, results[i].curePeopleNumbers || '',
                    results[i].averateCureTimes);
                arrayDatas.push(array);
            }
            excel.exportExcel(config, arrayDatas, res);
        }
    });
}




