/**
 * Created by Dell on 2015/10/15.
 */
var db = require('../../utils/msdb');
var excel = require("../../utils/excel");
var string = require("../../utils/string");
var util = require("../../utils/util");

/*业务工作情况日、月、季、年报表*/
exports.getBusinessWorkDay = function (req, res) {
    var startTime = req.body.startTime;
    var endTime = req.body.endTime;

    var sqlBatch = [];

    var sql = 'select s.分站名称,SUM(case when a.类型编码 not in (2,4) and t.任务序号=1 then 1 else 0 end) 有效接警数,   ' +
        ' SUM(case when a.类型编码 not in (2,4) and t.结果编码=4 then cast(t.人数 as int) else 0 end) 接诊人数,        ' +
        'SUM(case when a.类型编码 not in (2,4) then 1 else 0 end) 出车次数,        ' +
        'SUM(case when a.类型编码 not in (2,4) and t.结果编码=4 then 1 else 0 end) 接到病人次数,        ' +
        'SUM(case when a.类型编码 not in (2,4) and t.结果编码=2 and t.中止任务原因编码=6 then 1 else 0 end) 出车前退车,        ' +
        'SUM(case when a.类型编码 not in (2,4) and t.结果编码=2 and t.中止任务原因编码=7 then 1 else 0 end) 中途退车,        ' +
        'SUM(case when a.类型编码 not in (2,4) and t.结果编码=2 and t.中止任务原因编码=0 then 1 else 0 end) 其他,        ' +
        'SUM(case when a.类型编码 not in (2,4) and t.结果编码=2 then 1 else 0 end) 合计,        ' +
        'SUM(case when a.类型编码 not in (2,4) and t.结果编码=3 and t.放空车原因编码=8 then 1 else 0 end) 现场退车,       ' +
        'SUM(case when a.类型编码 not in (2,4) and t.结果编码=3 and t.放空车原因编码=2 then 1 else 0 end) 现场无人,        ' +
        'SUM(case when a.类型编码 not in (2,4) and t.结果编码=3 and t.放空车原因编码=1 then 1 else 0 end) 现场死亡,        ' +
        'SUM(case when a.类型编码 not in (2,4) and t.结果编码=3 and t.放空车原因编码=7 then 1 else 0 end) 其他,        ' +
        'SUM(case when a.类型编码 not in (2,4) and t.结果编码=3 then 1 else 0 end) 合计    ' +
        'from ausp120.tb_EventV e    left outer join ausp120.tb_AcceptDescript a on e.事件编码=a.事件编码    ' +
        'left outer join ausp120.tb_TaskV t on a.事件编码=t.事件编码 and a.受理序号=t.受理序号    ' +
        'left outer join ausp120.tb_Station s on s.分站编码=t.分站编码    where e.事件性质编码=1  and a.开始受理时刻 between @startTime and @endTime    group by s.分站名称';
    var params = [{"name": "startTime", "value": startTime, "type": "varchar"}, {
        "name": "endTime", "value": endTime, "type": "varchar"
    }];
    var sqlData = {
        statement: sql,
        params: params
    };
    sqlBatch.push(sqlData);

    sql = "select s.分站名称,t.送往地点,SUM(case when a.类型编码 not in (2,4) and t.结果编码=4 then 1 else 0 end) 次数,   " +
        "SUM(case when a.类型编码 not in (2,4) and t.结果编码=4 then cast(t.人数 as int) else 0 end) 人数    from ausp120.tb_EventV e    " +
        "left outer join ausp120.tb_AcceptDescript a on e.事件编码=a.事件编码    left outer join ausp120.tb_TaskV t on a.事件编码=t.事件编码 and a.受理序号=t.受理序号    " +
        "left outer join ausp120.tb_Station s on s.分站编码=t.分站编码    where e.事件性质编码=1 and t.分站编码 is not null " +
        "and t.送往地点 in ('中心医院','二医院','高速站','华容医院','太和医院','鄂钢医院')    and s.分站名称<>t.送往地点 and a.开始受理时刻 between @startTime and @endTime    " +
        "group by s.分站名称,t.送往地点    order by s.分站名称,t.送往地点";
    sqlBatch.push({
        statement: sql,
        params: params
    });

    sql = "select COUNT(*) from ausp120.tb_TeleRecordV tr where tr.记录类型编码 in (1,2,3,5,8) and tr.产生时刻 between @startTime and @endTime";
    sqlBatch.push({
        statement: sql,
        params: params
    });
    //疾病人数统计（按分站）
    sql = "select s.分站名称,SUM(case when a.初步判断 like '%外伤1%' then t.人数 else 0 end) 外伤1,   " +
        "SUM(case when (a.初步判断 like '%外伤%' or a.初步判断 like '%骨折%' or a.初步判断 like '%坠落伤%' or a.初步判断 like '%摔伤%') and a.初步判断 not like '%外伤1%'  then t.人数 else 0 end) 其他外伤,        " +
        "SUM(case when a.初步判断 like '%心脏聚停%' or a.初步判断 like '%高血压%' or a.初步判断 like '%风湿性心脏病%' or a.初步判断 like '%急性冠脉综合征%' or a.初步判断 like '%心肌梗塞%' or a.初步判断 like '%心率失常%' or a.初步判断 like '%心包压塞%' or a.初步判断 like '%蛛网膜下腔出血%' or a.初步判断 like '%脑出血%' or a.初步判断 like '%脑梗塞%' or a.初步判断 like '%脑血管意外后遗症%' or a.初步判断 like '%低血压%' or a.初步判断 like '%心力衰竭%' or a.初步判断 like '%心源性休克%' or a.初步判断 like '%其他心脑血管疾病%' or a.初步判断 like '%心脏不适%' or a.初步判断 like '%心动过速%' or a.初步判断 like '%心动过缓%'  then t.人数 else 0 end) 心脑血管疾病,        " +
        "SUM(case when a.初步判断 like '%晕厥%' or a.初步判断 like '%昏迷%'  then t.人数 else 0 end) 晕厥或昏迷,        " +
        "SUM(case when a.初步判断 like '%中毒%' then t.人数 else 0 end) 中毒,        " +
        "SUM(case when a.初步判断 like '%急腹症%' or a.初步判断 like '%消化性溃疡%' or a.初步判断 like '%胃出血%' or a.初步判断 like '%上消化道出血%' or a.初步判断 like '%阑尾炎%' or a.初步判断 like '%腹股沟疝%' or a.初步判断 like '%急性胃肠炎%' or a.初步判断 like '%肠梗阻%' or a.初步判断 like '%腹膜炎%' or a.初步判断 like '%肝硬化%' or a.初步判断 like '%胆囊炎%' or a.初步判断 like '%胰腺炎%' or a.初步判断 like '%急性肝脏衰竭%' or a.初步判断 like '%便血%' or a.初步判断 like '%肠套叠%' or a.初步判断 like '%其他消化系统疾病%'  then t.人数 else 0 end) 消化系统疾病,        " +
        "SUM(case when a.初步判断 like '%上呼吸道感染%' or a.初步判断 like '%感冒%' or a.初步判断 like '%支气管炎%' or a.初步判断 like '%肺炎%' or a.初步判断 like '%ARDS%' or a.初步判断 like '%肺气肿%' or a.初步判断 like '%哮喘%' or a.初步判断 like '%支气管扩张%' or a.初步判断 like '%COPD%' or a.初步判断 like '%血、气胸%' or a.初步判断 like '%肺栓塞%' or a.初步判断 like '%呼吸衰竭%' or a.初步判断 like '%其他呼吸系统疾病%'  then t.人数 else 0 end) 呼吸系统疾病,        " +
        "SUM(case when a.初步判断 like '%盆腔炎%' or a.初步判断 like '%痛经%' or a.初步判断 like '%功能性子宫出血%' or a.初步判断 like '%阴道出血%' or a.初步判断 like '%卵巢囊肿剃扭转%' or a.初步判断 like '%宫外孕%' or a.初步判断 like '%自然流产%' or a.初步判断 like '%羊水栓塞%' or a.初步判断 like '%妊高症%' or a.初步判断 like '%先兆子痫%' or a.初步判断 like '%先兆流产%' or a.初步判断 like '%胎膜早破%' or a.初步判断 like '%前置胎盘%' or a.初步判断 like '%胎盘早剥%' or a.初步判断 like '%早产%' or a.初步判断 like '%产后出血%' or a.初步判断 like '%子宫破裂%' or a.初步判断 like '%临产%' or a.初步判断 like '%其他妇产科疾病%' or a.初步判断 like '%早产儿%' or a.初步判断 like '%新生儿窒息%' or a.初步判断 like '%新生儿黄疸%' or a.初步判断 like '%新生儿败血症%' or a.初步判断 like '%其他新生儿疾病%' then t.人数 else 0 end) 妇儿疾病,        " +
        "SUM(case when a.初步判断 like '%抽搐%'  then t.人数 else 0 end) 抽搐,        " +
        "SUM(case when a.初步判断 like '%中暑%' or a.初步判断 like '%淹溺%'  then t.人数 else 0 end) 中暑淹溺,        " +
        "'0' 其他,SUM(t.人数) 合计    from ausp120.tb_Eventv e left outer join ausp120.tb_AcceptDescript a on a.事件编码=e.事件编码    " +
        "left outer join ausp120.tb_TaskV t on a.事件编码=t.事件编码 and a.受理序号=t.受理序号    left outer join ausp120.tb_Station s on s.分站编码=t.分站编码    " +
        "where e.事件性质编码=1 and a.类型编码 not in (2,4) and t.结果编码=4 and a.开始受理时刻 between @startTime and @endTime    group by s.分站名称";
    sqlBatch.push({
        statement: sql,
        params: params
    });
    //疾病人数统计（合计）
    sql = "select '合计' 合计,isnull(SUM(case when a.初步判断 like '%外伤1%' then t.人数 else 0 end),0) 外伤1,   " +
        "isnull(SUM(case when (a.初步判断 like '%外伤%' or a.初步判断 like '%骨折%' or a.初步判断 like '%坠落伤%' or a.初步判断 like '%摔伤%') and a.初步判断 not like '%外伤1%'  then t.人数 else 0 end),0) 其他外伤,        " +
        "isnull(SUM(case when a.初步判断 like '%心脏聚停%' or a.初步判断 like '%高血压%' or a.初步判断 like '%风湿性心脏病%' or a.初步判断 like '%急性冠脉综合征%' or a.初步判断 like '%心肌梗塞%' or a.初步判断 like '%心率失常%' or a.初步判断 like '%心包压塞%' or a.初步判断 like '%蛛网膜下腔出血%' or a.初步判断 like '%脑出血%' or a.初步判断 like '%脑梗塞%' or a.初步判断 like '%脑血管意外后遗症%' or a.初步判断 like '%低血压%' or a.初步判断 like '%心力衰竭%' or a.初步判断 like '%心源性休克%' or a.初步判断 like '%其他心脑血管疾病%' or a.初步判断 like '%心脏不适%' or a.初步判断 like '%心动过速%' or a.初步判断 like '%心动过缓%'  then t.人数 else 0 end),0) 心脑血管疾病,        " +
        "isnull(SUM(case when a.初步判断 like '%晕厥%' or a.初步判断 like '%昏迷%'  then t.人数 else 0 end),0) 晕厥或昏迷,        " +
        "isnull(SUM(case when a.初步判断 like '%中毒%' then t.人数 else 0 end),0) 中毒,        " +
        "isnull(SUM(case when a.初步判断 like '%急腹症%' or a.初步判断 like '%消化性溃疡%' or a.初步判断 like '%胃出血%' or a.初步判断 like '%上消化道出血%' or a.初步判断 like '%阑尾炎%' or a.初步判断 like '%腹股沟疝%' or a.初步判断 like '%急性胃肠炎%' or a.初步判断 like '%肠梗阻%' or a.初步判断 like '%腹膜炎%' or a.初步判断 like '%肝硬化%' or a.初步判断 like '%胆囊炎%' or a.初步判断 like '%胰腺炎%' or a.初步判断 like '%急性肝脏衰竭%' or a.初步判断 like '%便血%' or a.初步判断 like '%肠套叠%' or a.初步判断 like '%其他消化系统疾病%'  then t.人数 else 0 end),0) 消化系统疾病,        " +
        "isnull(SUM(case when a.初步判断 like '%上呼吸道感染%' or a.初步判断 like '%感冒%' or a.初步判断 like '%支气管炎%' or a.初步判断 like '%肺炎%' or a.初步判断 like '%ARDS%' or a.初步判断 like '%肺气肿%' or a.初步判断 like '%哮喘%' or a.初步判断 like '%支气管扩张%' or a.初步判断 like '%COPD%' or a.初步判断 like '%血、气胸%' or a.初步判断 like '%肺栓塞%' or a.初步判断 like '%呼吸衰竭%' or a.初步判断 like '%其他呼吸系统疾病%'  then t.人数 else 0 end),0) 呼吸系统疾病,        " +
        "isnull(SUM(case when a.初步判断 like '%盆腔炎%' or a.初步判断 like '%痛经%' or a.初步判断 like '%功能性子宫出血%' or a.初步判断 like '%阴道出血%' or a.初步判断 like '%卵巢囊肿剃扭转%' or a.初步判断 like '%宫外孕%' or a.初步判断 like '%自然流产%' or a.初步判断 like '%羊水栓塞%' or a.初步判断 like '%妊高症%' or a.初步判断 like '%先兆子痫%' or a.初步判断 like '%先兆流产%' or a.初步判断 like '%胎膜早破%' or a.初步判断 like '%前置胎盘%' or a.初步判断 like '%胎盘早剥%' or a.初步判断 like '%早产%' or a.初步判断 like '%产后出血%' or a.初步判断 like '%子宫破裂%' or a.初步判断 like '%临产%' or a.初步判断 like '%其他妇产科疾病%' or a.初步判断 like '%早产儿%' or a.初步判断 like '%新生儿窒息%' or a.初步判断 like '%新生儿黄疸%' or a.初步判断 like '%新生儿败血症%' or a.初步判断 like '%其他新生儿疾病%' then t.人数 else 0 end),0) 妇儿疾病,        " +
        "isnull(SUM(case when a.初步判断 like '%抽搐%'  then t.人数 else 0 end),0) 抽搐,        " +
        "isnull(SUM(case when a.初步判断 like '%中暑%' or a.初步判断 like '%淹溺%'  then t.人数 else 0 end),0) 中暑淹溺,        " +
        "'0' 其他,isnull(SUM(t.人数),0) 合计    from ausp120.tb_Eventv e left outer join ausp120.tb_AcceptDescript a on a.事件编码=e.事件编码    " +
        "left outer join ausp120.tb_TaskV t on a.事件编码=t.事件编码 and a.受理序号=t.受理序号       " +
        "where e.事件性质编码=1 and a.类型编码 not in (2,4) and t.结果编码=4 and a.开始受理时刻 between @startTime and @endTime  ";
    sqlBatch.push({
        statement: sql,
        params: params
    });
    db.selectSerial(sqlBatch, function (err, results) {
        var result = []; //存储表一数据
        var table2 = []; //存储表2数据
        if (err) {
            console.log(results);
        } else {
            //一表数据结果集-start
            var result1 = {
                "station": '中心医院',
                "validPhones": 0,
                "receivePersons": 0,
                "outCars": 0,
                "normalTasks": 0,
                "stopTask1": 0,
                "stopTask2": 0,
                "stopTask3": 0,
                "stopTaskTotal": 0,
                "emptyTask1": 0,
                "emptyTask2": 0,
                "emptyTask3": 0,
                "emptyTask4": 0,
                "emptyTaskTotal": 0,
                "transfer": ''
            };
            var result2 = {
                "station": '太和站',
                "validPhones": 0,
                "receivePersons": 0,
                "outCars": 0,
                "normalTasks": 0,
                "stopTask1": 0,
                "stopTask2": 0,
                "stopTask3": 0,
                "stopTaskTotal": 0,
                "emptyTask1": 0,
                "emptyTask2": 0,
                "emptyTask3": 0,
                "emptyTask4": 0,
                "emptyTaskTotal": 0,
                "transfer": ''
            };
            var result3 = {
                "station": '高速站',
                "validPhones": 0,
                "receivePersons": 0,
                "outCars": 0,
                "normalTasks": 0,
                "stopTask1": 0,
                "stopTask2": 0,
                "stopTask3": 0,
                "stopTaskTotal": 0,
                "emptyTask1": 0,
                "emptyTask2": 0,
                "emptyTask3": 0,
                "emptyTask4": 0,
                "emptyTaskTotal": 0,
                "transfer": ''
            };
            var result4 = {
                "station": '华容站',
                "validPhones": 0,
                "receivePersons": 0,
                "outCars": 0,
                "normalTasks": 0,
                "stopTask1": 0,
                "stopTask2": 0,
                "stopTask3": 0,
                "stopTaskTotal": 0,
                "emptyTask1": 0,
                "emptyTask2": 0,
                "emptyTask3": 0,
                "emptyTask4": 0,
                "emptyTaskTotal": 0,
                "transfer": ''
            };
            var result5 = {
                "station": '所占比例',
                "validPhones": 0,
                "receivePersons": 0,
                "outCars": 0,
                "normalTasks": 0,
                "stopTask1": 0,
                "stopTask2": 0,
                "stopTask3": 0,
                "stopTaskTotal": 0,
                "emptyTask1": 0,
                "emptyTask2": 0,
                "emptyTask3": 0,
                "emptyTask4": 0,
                "emptyTaskTotal": 0,
                "transfer": ''
            };
            var result6 = {
                "station": '鄂钢医院',
                "validPhones": 0,
                "receivePersons": 0,
                "outCars": 0,
                "normalTasks": 0,
                "stopTask1": 0,
                "stopTask2": 0,
                "stopTask3": 0,
                "stopTaskTotal": 0,
                "emptyTask1": 0,
                "emptyTask2": 0,
                "emptyTask3": 0,
                "emptyTask4": 0,
                "emptyTaskTotal": 0,
                "transfer": ''
            };
            var result7 = {
                "station": '所占比例',
                "validPhones": 0,
                "receivePersons": 0,
                "outCars": 0,
                "normalTasks": 0,
                "stopTask1": 0,
                "stopTask2": 0,
                "stopTask3": 0,
                "stopTaskTotal": 0,
                "emptyTask1": 0,
                "emptyTask2": 0,
                "emptyTask3": 0,
                "emptyTask4": 0,
                "emptyTaskTotal": 0,
                "transfer": ''
            };
            var result8 = {
                "station": '二医院',
                "validPhones": 0,
                "receivePersons": 0,
                "outCars": 0,
                "normalTasks": 0,
                "stopTask1": 0,
                "stopTask2": 0,
                "stopTask3": 0,
                "stopTaskTotal": 0,
                "emptyTask1": 0,
                "emptyTask2": 0,
                "emptyTask3": 0,
                "emptyTask4": 0,
                "emptyTaskTotal": 0,
                "transfer": ''
            };
            var result9 = {
                "station": '所占比例',
                "validPhones": 0,
                "receivePersons": 0,
                "outCars": 0,
                "normalTasks": 0,
                "stopTask1": 0,
                "stopTask2": 0,
                "stopTask3": 0,
                "stopTaskTotal": 0,
                "emptyTask1": 0,
                "emptyTask2": 0,
                "emptyTask3": 0,
                "emptyTask4": 0,
                "emptyTaskTotal": 0,
                "transfer": ''
            };
            var result10 = {
                "station": '中医医院',
                "validPhones": 0,
                "receivePersons": 0,
                "outCars": 0,
                "normalTasks": 0,
                "stopTask1": 0,
                "stopTask2": 0,
                "stopTask3": 0,
                "stopTaskTotal": 0,
                "emptyTask1": 0,
                "emptyTask2": 0,
                "emptyTask3": 0,
                "emptyTask4": 0,
                "emptyTaskTotal": 0,
                "transfer": ''
            };
            var result11 = {
                "station": '所占比例',
                "validPhones": 0,
                "receivePersons": 0,
                "outCars": 0,
                "normalTasks": 0,
                "stopTask1": 0,
                "stopTask2": 0,
                "stopTask3": 0,
                "stopTaskTotal": 0,
                "emptyTask1": 0,
                "emptyTask2": 0,
                "emptyTask3": 0,
                "emptyTask4": 0,
                "emptyTaskTotal": 0,
                "transfer": ''
            };
            var result12 = {
                "station": '合计',
                "validPhones": 0,
                "receivePersons": 0,
                "outCars": 0,
                "normalTasks": 0,
                "stopTask1": 0,
                "stopTask2": 0,
                "stopTask3": 0,
                "stopTaskTotal": 0,
                "emptyTask1": 0,
                "emptyTask2": 0,
                "emptyTask3": 0,
                "emptyTask4": 0,
                "emptyTaskTotal": 0,
                "transfer": ''
            };
            //一表数据结果集-end
            //二表数据结果集-start
            var rs1 = {
                "station": '中心医院',
                "type1": 0, //车祸外伤
                "type2": 0, //其他外伤
                "type3": 0, //心脑血管
                "type4": 0, //昏厥或昏迷
                "type5": 0, //中毒
                "type6": 0, //消化系统疾病
                "type7": 0, //呼吸系统疾病
                "type8": 0, //妇儿疾病
                "type9": 0, //抽搐
                "type10": 0, //中暑或淹溺
                "type11": 0, //其他
                "type12": 0 //合计
            };
            var rs2 = {
                "station": '太和站',
                "type1": 0, //车祸外伤
                "type2": 0, //其他外伤
                "type3": 0, //心脑血管
                "type4": 0, //昏厥或昏迷
                "type5": 0, //中毒
                "type6": 0, //消化系统疾病
                "type7": 0, //呼吸系统疾病
                "type8": 0, //妇儿疾病
                "type9": 0, //抽搐
                "type10": 0, //中暑或淹溺
                "type11": 0, //其他
                "type12": 0 //合计
            };
            var rs3 = {
                "station": '高速站',
                "type1": 0, //车祸外伤
                "type2": 0, //其他外伤
                "type3": 0, //心脑血管
                "type4": 0, //昏厥或昏迷
                "type5": 0, //中毒
                "type6": 0, //消化系统疾病
                "type7": 0, //呼吸系统疾病
                "type8": 0, //妇儿疾病
                "type9": 0, //抽搐
                "type10": 0, //中暑或淹溺
                "type11": 0, //其他
                "type12": 0 //合计
            };
            var rs4 = {
                "station": '华容站',
                "type1": 0, //车祸外伤
                "type2": 0, //其他外伤
                "type3": 0, //心脑血管
                "type4": 0, //昏厥或昏迷
                "type5": 0, //中毒
                "type6": 0, //消化系统疾病
                "type7": 0, //呼吸系统疾病
                "type8": 0, //妇儿疾病
                "type9": 0, //抽搐
                "type10": 0, //中暑或淹溺
                "type11": 0, //其他
                "type12": 0 //合计
            };
            var rs5 = {
                "station": '鄂钢医院',
                "type1": 0, //车祸外伤
                "type2": 0, //其他外伤
                "type3": 0, //心脑血管
                "type4": 0, //昏厥或昏迷
                "type5": 0, //中毒
                "type6": 0, //消化系统疾病
                "type7": 0, //呼吸系统疾病
                "type8": 0, //妇儿疾病
                "type9": 0, //抽搐
                "type10": 0, //中暑或淹溺
                "type11": 0, //其他
                "type12": 0 //合计
            };
            var rs6 = {
                "station": '二医院',
                "type1": 0, //车祸外伤
                "type2": 0, //其他外伤
                "type3": 0, //心脑血管
                "type4": 0, //昏厥或昏迷
                "type5": 0, //中毒
                "type6": 0, //消化系统疾病
                "type7": 0, //呼吸系统疾病
                "type8": 0, //妇儿疾病
                "type9": 0, //抽搐
                "type10": 0, //中暑或淹溺
                "type11": 0, //其他
                "type12": 0 //合计
            };
            var rs7 = {
                "station": '中医医院',
                "type1": 0, //车祸外伤
                "type2": 0, //其他外伤
                "type3": 0, //心脑血管
                "type4": 0, //昏厥或昏迷
                "type5": 0, //中毒
                "type6": 0, //消化系统疾病
                "type7": 0, //呼吸系统疾病
                "type8": 0, //妇儿疾病
                "type9": 0, //抽搐
                "type10": 0, //中暑或淹溺
                "type11": 0, //其他
                "type12": 0 //合计
            };
            var rs8 = {
                "station": '合计',
                "type1": 0, //车祸外伤
                "type2": 0, //其他外伤
                "type3": 0, //心脑血管
                "type4": 0, //昏厥或昏迷
                "type5": 0, //中毒
                "type6": 0, //消化系统疾病
                "type7": 0, //呼吸系统疾病
                "type8": 0, //妇儿疾病
                "type9": 0, //抽搐
                "type10": 0, //中暑或淹溺
                "type11": 0, //其他
                "type12": 0 //合计
            };
            var rs9 = {
                "station": '所占比例',
                "type1": 0, //车祸外伤
                "type2": 0, //其他外伤
                "type3": 0, //心脑血管
                "type4": 0, //昏厥或昏迷
                "type5": 0, //中毒
                "type6": 0, //消化系统疾病
                "type7": 0, //呼吸系统疾病
                "type8": 0, //妇儿疾病
                "type9": 0, //抽搐
                "type10": 0, //中暑或淹溺
                "type11": 0, //其他
                "type12": 0 //合计
            };
            //二表数据结果集-end
            var data1 = []; //第一个sql语句查询结果
            var data2 = []; //第二个sql语句查询结果（转送情况）
            var data3 = []; //第三个sql语句查询结果（接电话总数）
            var date4 = []; //第四个sql语句查询结果 (按分站)
            var date5 = []; //第四个sql语句查询结果 (合计)

            var data;
            for (var j = 0; j < results.length; j++) { //遍历三个结果
                if (j == 0) { //第一个sql语句查询结果
                    data = results[j];
                    for (var i = 0; i < data.length; i++) {
                        if (string.isEquals("中心医院", data[i][0].value)) {
                            result1.validPhones = data[i][1].value; //有效接警
                            result1.receivePersons = data[i][2].value; //接诊人数
                            result1.outCars = data[i][3].value; //出车次数
                            result1.normalTasks = data[i][4].value; //接到病人次数
                            result1.stopTask1 = data[i][5].value; //中止任务-出车前退车
                            result1.stopTask2 = data[i][6].value; //中止任务-中途退车
                            result1.stopTask3 = data[i][7].value; //中止任务-其他
                            result1.stopTaskTotal = data[i][8].value; //中止任务-合计
                            result1.emptyTask1 = data[i][9].value; //空车-现场退车
                            result1.emptyTask2 = data[i][10].value; //空车-现场无人
                            result1.emptyTask3 = data[i][11].value; //空车-现场死亡
                            result1.emptyTask4 = data[i][12].value; //空车-其他
                            result1.emptyTaskTotal = data[i][13].value; //空车-合计
                        }
                        if (string.isEquals("太和医院", data[i][0].value)) {
                            result2.validPhones = data[i][1].value; //有效接警
                            result2.receivePersons = data[i][2].value; //接诊人数
                            result2.outCars = data[i][3].value; //出车次数
                            result2.normalTasks = data[i][4].value; //接到病人次数
                            result2.stopTask1 = data[i][5].value; //中止任务-出车前退车
                            result2.stopTask2 = data[i][6].value; //中止任务-中途退车
                            result2.stopTask3 = data[i][7].value; //中止任务-其他
                            result2.stopTaskTotal = data[i][8].value; //中止任务-合计
                            result2.emptyTask1 = data[i][9].value; //空车-现场退车
                            result2.emptyTask2 = data[i][10].value; //空车-现场无人
                            result2.emptyTask3 = data[i][11].value; //空车-现场死亡
                            result2.emptyTask4 = data[i][12].value; //空车-其他
                            result2.emptyTaskTotal = data[i][13].value; //空车-合计
                        }
                        if (string.isEquals("高速站", data[i][0].value)) {
                            result3.validPhones = data[i][1].value; //有效接警
                            result3.receivePersons = data[i][2].value; //接诊人数
                            result3.outCars = data[i][3].value; //出车次数
                            result3.normalTasks = data[i][4].value; //接到病人次数
                            result3.stopTask1 = data[i][5].value; //中止任务-出车前退车
                            result3.stopTask2 = data[i][6].value; //中止任务-中途退车
                            result3.stopTask3 = data[i][7].value; //中止任务-其他
                            result3.stopTaskTotal = data[i][8].value; //中止任务-合计
                            result3.emptyTask1 = data[i][9].value; //空车-现场退车
                            result3.emptyTask2 = data[i][10].value; //空车-现场无人
                            result3.emptyTask3 = data[i][11].value; //空车-现场死亡
                            result3.emptyTask4 = data[i][12].value; //空车-其他
                            result3.emptyTaskTotal = data[i][13].value; //空车-合计
                        }
                        if (string.isEquals("华容医院", data[i][0].value)) {
                            result4.validPhones = data[i][1].value; //有效接警
                            result4.receivePersons = data[i][2].value; //接诊人数
                            result4.outCars = data[i][3].value; //出车次数
                            result4.normalTasks = data[i][4].value; //接到病人次数
                            result4.stopTask1 = data[i][5].value; //中止任务-出车前退车
                            result4.stopTask2 = data[i][6].value; //中止任务-中途退车
                            result4.stopTask3 = data[i][7].value; //中止任务-其他
                            result4.stopTaskTotal = data[i][8].value; //中止任务-合计
                            result4.emptyTask1 = data[i][9].value; //空车-现场退车
                            result4.emptyTask2 = data[i][10].value; //空车-现场无人
                            result4.emptyTask3 = data[i][11].value; //空车-现场死亡
                            result4.emptyTask4 = data[i][12].value; //空车-其他
                            result4.emptyTaskTotal = data[i][13].value; //空车-合计
                        }
                        if (string.isEquals("鄂钢医院", data[i][0].value)) {
                            result6.validPhones = data[i][1].value; //有效接警
                            result6.receivePersons = data[i][2].value; //接诊人数
                            result6.outCars = data[i][3].value; //出车次数
                            result6.normalTasks = data[i][4].value; //接到病人次数
                            result6.stopTask1 = data[i][5].value; //中止任务-出车前退车
                            result6.stopTask2 = data[i][6].value; //中止任务-中途退车
                            result6.stopTask3 = data[i][7].value; //中止任务-其他
                            result6.stopTaskTotal = data[i][8].value; //中止任务-合计
                            result6.emptyTask1 = data[i][9].value; //空车-现场退车
                            result6.emptyTask2 = data[i][10].value; //空车-现场无人
                            result6.emptyTask3 = data[i][11].value; //空车-现场死亡
                            result6.emptyTask4 = data[i][12].value; //空车-其他
                            result6.emptyTaskTotal = data[i][13].value; //空车-合计
                        }
                        if (string.isEquals("二医院", data[i][0].value)) {
                            result8.validPhones = data[i][1].value; //有效接警
                            result8.receivePersons = data[i][2].value; //接诊人数
                            result8.outCars = data[i][3].value; //出车次数
                            result8.normalTasks = data[i][4].value; //接到病人次数
                            result8.stopTask1 = data[i][5].value; //中止任务-出车前退车
                            result8.stopTask2 = data[i][6].value; //中止任务-中途退车
                            result8.stopTask3 = data[i][7].value; //中止任务-其他
                            result8.stopTaskTotal = data[i][8].value; //中止任务-合计
                            result8.emptyTask1 = data[i][9].value; //空车-现场退车
                            result8.emptyTask2 = data[i][10].value; //空车-现场无人
                            result8.emptyTask3 = data[i][11].value; //空车-现场死亡
                            result8.emptyTask4 = data[i][12].value; //空车-其他
                            result8.emptyTaskTotal = data[i][13].value; //空车-合计
                        }
                        if (string.isEquals("中医院", data[i][0].value)) {
                            result10.validPhones = data[i][1].value; //有效接警
                            result10.receivePersons = data[i][2].value; //接诊人数
                            result10.outCars = data[i][3].value; //出车次数
                            result10.normalTasks = data[i][4].value; //接到病人次数
                            result10.stopTask1 = data[i][5].value; //中止任务-出车前退车
                            result10.stopTask2 = data[i][6].value; //中止任务-中途退车
                            result10.stopTask3 = data[i][7].value; //中止任务-其他
                            result10.stopTaskTotal = data[i][8].value; //中止任务-合计
                            result10.emptyTask1 = data[i][9].value; //空车-现场退车
                            result10.emptyTask2 = data[i][10].value; //空车-现场无人
                            result10.emptyTask3 = data[i][11].value; //空车-现场死亡
                            result10.emptyTask4 = data[i][12].value; //空车-其他
                            result10.emptyTaskTotal = data[i][13].value; //空车-合计
                        }
                    }
                }
                if (j == 1) { //第二个sql语句查询结果（转送情况）
                    data = results[j];
                    for (var i = 0; i < data.length; i++) {
                        if (string.isEquals('中心医院', data[i][0].value)) {
                            result1.transfer += ';' + data[i][2].value + '次/' + data[i][3].value + '人/' + data[i][1].value;
                        }
                        if (string.isEquals('太和医院', data[i][0].value)) {
                            result2.transfer += ';' + data[i][2].value + '次/' + data[i][3].value + '人/' + data[i][1].value;
                        }
                        if (string.isEquals('高速站', data[i][0].value)) {
                            result3.transfer += ';' + data[i][2].value + '次/' + data[i][3].value + '人/' + data[i][1].value;
                        }
                        if (string.isEquals('华容医院', data[i][0].value)) {
                            result4.transfer += ';' + data[i][2].value + '次/' + data[i][3].value + '人/' + data[i][1].value;
                        }
                        if (string.isEquals('鄂钢医院', data[i][0].value)) {
                            result6.transfer += ';' + data[i][2].value + '次/' + data[i][3].value + '人/' + data[i][1].value;
                        }
                        if (string.isEquals('二医院', data[i][0].value)) {
                            result8.transfer += ';' + data[i][2].value + '次/' + data[i][3].value + '人/' + data[i][1].value;
                        }
                        if (string.isEquals('中医院', data[i][0].value)) {
                            result10.transfer += ';' + data[i][2].value + '次/' + data[i][3].value + '人/' + data[i][1].value;
                        }
                    }
                    if (result1.transfer.length > 0) {
                        result1.transfer = result1.transfer.substr(1);
                    }
                    if (result2.transfer.length > 0) {
                        result2.transfer = result2.transfer.substr(1);
                    }
                    if (result3.transfer.length > 0) {
                        result3.transfer = result3.transfer.substr(1);
                    }
                    if (result4.transfer.length > 0) {
                        result4.transfer = result4.transfer.substr(1);
                    }
                    if (result6.transfer.length > 0) {
                        result6.transfer = result6.transfer.substr(1);
                    }
                    if (result8.transfer.length > 0) {
                        result8.transfer = result8.transfer.substr(1);
                    }
                    if (result10.transfer.length > 0) {
                        result10.transfer = result10.transfer.substr(1);
                    }
                }
                if (j == 2) { //第三个sql语句查询结果（接电话总数）
                    data = results[j];
                    for (var i = 0; i < data.length; i++) {
                        data3.push({
                            phoneNumbers: data[i][0].value
                        })
                    }
                }//end 结果集3

                if (j == 3) { //第四个sql语句查询结果 (按分站)
                    data = results[j];
                    for (var i = 0; i < data.length; i++) {
                        if (string.isEquals("中心医院", data[i][0].value)) {
                            rs1.type1 = data[i][1].value;  //车祸外伤
                            rs1.type2 = data[i][2].value;  //其他外伤
                            rs1.type3 = data[i][3].value;  //心脑血管疾病
                            rs1.type4 = data[i][4].value;  //晕厥或昏迷
                            rs1.type5 = data[i][5].value;  //中毒
                            rs1.type6 = data[i][6].value;  //消化系统疾病
                            rs1.type7 = data[i][7].value;  //呼吸系统疾病
                            rs1.type8 = data[i][8].value;  //妇儿疾病
                            rs1.type9 = data[i][9].value;  //抽搐
                            rs1.type10 = data[i][10].value;  //中暑淹溺
                            rs1.type11 = data[i][11].value;  //其他
                            rs1.type12 = data[i][12].value;  //合计
                        }
                        if (string.isEquals("太和医院", data[i][0].value)) {
                            rs2.type1 = data[i][1].value;  //车祸外伤
                            rs2.type2 = data[i][2].value;  //其他外伤
                            rs2.type3 = data[i][3].value;  //心脑血管疾病
                            rs2.type4 = data[i][4].value;  //晕厥或昏迷
                            rs2.type5 = data[i][5].value;  //中毒
                            rs2.type6 = data[i][6].value;  //消化系统疾病
                            rs2.type7 = data[i][7].value;  //呼吸系统疾病
                            rs2.type8 = data[i][8].value;  //妇儿疾病
                            rs2.type9 = data[i][9].value;  //抽搐
                            rs2.type10 = data[i][10].value;  //中暑淹溺
                            rs2.type11 = data[i][11].value;  //其他
                            rs2.type12 = data[i][12].value;  //合计
                        }
                        if (string.isEquals("高速站", data[i][0].value)) {
                            rs3.type1 = data[i][1].value;  //车祸外伤
                            rs3.type2 = data[i][2].value;  //其他外伤
                            rs3.type3 = data[i][3].value;  //心脑血管疾病
                            rs3.type4 = data[i][4].value;  //晕厥或昏迷
                            rs3.type5 = data[i][5].value;  //中毒
                            rs3.type6 = data[i][6].value;  //消化系统疾病
                            rs3.type7 = data[i][7].value;  //呼吸系统疾病
                            rs3.type8 = data[i][8].value;  //妇儿疾病
                            rs3.type9 = data[i][9].value;  //抽搐
                            rs3.type10 = data[i][10].value;  //中暑淹溺
                            rs3.type11 = data[i][11].value;  //其他
                            rs3.type12 = data[i][12].value;  //合计
                        }
                        if (string.isEquals("华容医院", data[i][0].value)) {
                            rs4.type1 = data[i][1].value;  //车祸外伤
                            rs4.type2 = data[i][2].value;  //其他外伤
                            rs4.type3 = data[i][3].value;  //心脑血管疾病
                            rs4.type4 = data[i][4].value;  //晕厥或昏迷
                            rs4.type5 = data[i][5].value;  //中毒
                            rs4.type6 = data[i][6].value;  //消化系统疾病
                            rs4.type7 = data[i][7].value;  //呼吸系统疾病
                            rs4.type8 = data[i][8].value;  //妇儿疾病
                            rs4.type9 = data[i][9].value;  //抽搐
                            rs4.type10 = data[i][10].value;  //中暑淹溺
                            rs4.type11 = data[i][11].value;  //其他
                            rs4.type12 = data[i][12].value;  //合计
                        }
                        if (string.isEquals("鄂钢医院", data[i][0].value)) {
                            rs5.type1 = data[i][1].value;  //车祸外伤
                            rs5.type2 = data[i][2].value;  //其他外伤
                            rs5.type3 = data[i][3].value;  //心脑血管疾病
                            rs5.type4 = data[i][4].value;  //晕厥或昏迷
                            rs5.type5 = data[i][5].value;  //中毒
                            rs5.type6 = data[i][6].value;  //消化系统疾病
                            rs5.type7 = data[i][7].value;  //呼吸系统疾病
                            rs5.type8 = data[i][8].value;  //妇儿疾病
                            rs5.type9 = data[i][9].value;  //抽搐
                            rs5.type10 = data[i][10].value;  //中暑淹溺
                            rs5.type11 = data[i][11].value;  //其他
                            rs5.type12 = data[i][12].value;  //合计
                        }
                        if (string.isEquals("二医院", data[i][0].value)) {
                            rs6.type1 = data[i][1].value;  //车祸外伤
                            rs6.type2 = data[i][2].value;  //其他外伤
                            rs6.type3 = data[i][3].value;  //心脑血管疾病
                            rs6.type4 = data[i][4].value;  //晕厥或昏迷
                            rs6.type5 = data[i][5].value;  //中毒
                            rs6.type6 = data[i][6].value;  //消化系统疾病
                            rs6.type7 = data[i][7].value;  //呼吸系统疾病
                            rs6.type8 = data[i][8].value;  //妇儿疾病
                            rs6.type9 = data[i][9].value;  //抽搐
                            rs6.type10 = data[i][10].value;  //中暑淹溺
                            rs6.type11 = data[i][11].value;  //其他
                            rs6.type12 = data[i][12].value;  //合计
                        }
                        if (string.isEquals("中医院", data[i][0].value)) {
                            rs7.type1 = data[i][1].value;  //车祸外伤
                            rs7.type2 = data[i][2].value;  //其他外伤
                            rs7.type3 = data[i][3].value;  //心脑血管疾病
                            rs7.type4 = data[i][4].value;  //晕厥或昏迷
                            rs7.type5 = data[i][5].value;  //中毒
                            rs7.type6 = data[i][6].value;  //消化系统疾病
                            rs7.type7 = data[i][7].value;  //呼吸系统疾病
                            rs7.type8 = data[i][8].value;  //妇儿疾病
                            rs7.type9 = data[i][9].value;  //抽搐
                            rs7.type10 = data[i][10].value;  //中暑淹溺
                            rs7.type11 = data[i][11].value;  //其他
                            rs7.type12 = data[i][12].value;  //合计
                        }
                    }
                } //end结果集4
                if (j == 4) { //第五个sql语句查询结果 (合计)
                    data = results[j];
                    for (var i = 0; i < data.length; i++) {
                        if (string.isEquals("合计", data[i][0].value)) {
                            rs8.type1 = data[i][1].value;  //车祸外伤
                            rs8.type2 = data[i][2].value;  //其他外伤
                            rs8.type3 = data[i][3].value;  //心脑血管疾病
                            rs8.type4 = data[i][4].value;  //晕厥或昏迷
                            rs8.type5 = data[i][5].value;  //中毒
                            rs8.type6 = data[i][6].value;  //消化系统疾病
                            rs8.type7 = data[i][7].value;  //呼吸系统疾病
                            rs8.type8 = data[i][8].value;  //妇儿疾病
                            rs8.type9 = data[i][9].value;  //抽搐
                            rs8.type10 = data[i][10].value;  //中暑淹溺
                            rs8.type11 = data[i][11].value;  //其他
                            rs8.type12 = data[i][12].value;  //合计
                        }
                    }
                } //end结果集5
            }

            //算结果2（救治人数）-其他人数-以及所占比例
            rs1.type11 = parseFloat(rs1.type12) - parseFloat(rs1.type10) - parseFloat(rs1.type9) - parseFloat(rs1.type8) - parseFloat(rs1.type7) - parseFloat(rs1.type6) - parseFloat(rs1.type5) - parseFloat(rs1.type4) - parseFloat(rs1.type3) - parseFloat(rs1.type2) - parseFloat(rs1.type1);
            rs2.type11 = parseFloat(rs2.type12) - parseFloat(rs2.type10) - parseFloat(rs2.type9) - parseFloat(rs2.type8) - parseFloat(rs2.type7) - parseFloat(rs2.type6) - parseFloat(rs2.type5) - parseFloat(rs2.type4) - parseFloat(rs2.type3) - parseFloat(rs2.type2) - parseFloat(rs2.type1);
            rs3.type11 = parseFloat(rs3.type12) - parseFloat(rs3.type10) - parseFloat(rs3.type9) - parseFloat(rs3.type8) - parseFloat(rs3.type7) - parseFloat(rs3.type6) - parseFloat(rs3.type5) - parseFloat(rs3.type4) - parseFloat(rs3.type3) - parseFloat(rs3.type2) - parseFloat(rs3.type1);
            rs4.type11 = parseFloat(rs4.type12) - parseFloat(rs4.type10) - parseFloat(rs4.type9) - parseFloat(rs4.type8) - parseFloat(rs4.type7) - parseFloat(rs4.type6) - parseFloat(rs4.type5) - parseFloat(rs4.type4) - parseFloat(rs4.type3) - parseFloat(rs4.type2) - parseFloat(rs4.type1);
            rs5.type11 = parseFloat(rs5.type12) - parseFloat(rs5.type10) - parseFloat(rs5.type9) - parseFloat(rs5.type8) - parseFloat(rs5.type7) - parseFloat(rs5.type6) - parseFloat(rs5.type5) - parseFloat(rs5.type4) - parseFloat(rs5.type3) - parseFloat(rs5.type2) - parseFloat(rs5.type1);
            rs6.type11 = parseFloat(rs6.type12) - parseFloat(rs6.type10) - parseFloat(rs6.type9) - parseFloat(rs6.type8) - parseFloat(rs6.type7) - parseFloat(rs6.type6) - parseFloat(rs6.type5) - parseFloat(rs6.type4) - parseFloat(rs6.type3) - parseFloat(rs6.type2) - parseFloat(rs6.type1);
            rs7.type11 = parseFloat(rs7.type12) - parseFloat(rs7.type10) - parseFloat(rs7.type9) - parseFloat(rs7.type8) - parseFloat(rs7.type7) - parseFloat(rs7.type6) - parseFloat(rs7.type5) - parseFloat(rs7.type4) - parseFloat(rs7.type3) - parseFloat(rs7.type2) - parseFloat(rs7.type1);
            rs8.type11 = parseFloat(rs8.type12) - parseFloat(rs8.type10) - parseFloat(rs8.type9) - parseFloat(rs8.type8) - parseFloat(rs8.type7) - parseFloat(rs8.type6) - parseFloat(rs8.type5) - parseFloat(rs8.type4) - parseFloat(rs8.type3) - parseFloat(rs8.type2) - parseFloat(rs8.type1);
            //算所占比例--救治人数
            rs9.type1 = util.calculateRate(rs8.type12, rs8.type1);
            rs9.type2 = util.calculateRate(rs8.type12, rs8.type2);
            rs9.type3 = util.calculateRate(rs8.type12, rs8.type3);
            rs9.type4 = util.calculateRate(rs8.type12, rs8.type4);
            rs9.type5 = util.calculateRate(rs8.type12, rs8.type5);
            rs9.type6 = util.calculateRate(rs8.type12, rs8.type6);
            rs9.type7 = util.calculateRate(rs8.type12, rs8.type7);
            rs9.type8 = util.calculateRate(rs8.type12, rs8.type8);
            rs9.type9 = util.calculateRate(rs8.type12, rs8.type9);
            rs9.type10 = util.calculateRate(rs8.type12, rs8.type10);
            rs9.type11 = util.calculateRate(rs8.type12, rs8.type11);
            rs9.type12 = util.calculateRate(rs8.type12, rs8.type12);
            //结果集2计算--end
            //算合计--结果集1
            result12.emptyTask1 = parseFloat(result1.emptyTask1) + parseFloat(result2.emptyTask1) + parseFloat(result3.emptyTask1) + parseFloat(result4.emptyTask1) + parseFloat(result6.emptyTask1) + parseFloat(result8.emptyTask1) + parseFloat(result10.emptyTask1);
            result12.emptyTask2 = parseFloat(result1.emptyTask2) + parseFloat(result2.emptyTask2) + parseFloat(result3.emptyTask2) + parseFloat(result4.emptyTask2) + parseFloat(result6.emptyTask2) + parseFloat(result8.emptyTask2) + parseFloat(result10.emptyTask2);
            result12.emptyTask3 = parseFloat(result1.emptyTask3) + parseFloat(result2.emptyTask3) + parseFloat(result3.emptyTask3) + parseFloat(result4.emptyTask3) + parseFloat(result6.emptyTask3) + parseFloat(result8.emptyTask3) + parseFloat(result10.emptyTask3);
            result12.emptyTask4 = parseFloat(result1.emptyTask4) + parseFloat(result2.emptyTask4) + parseFloat(result3.emptyTask4) + parseFloat(result4.emptyTask4) + parseFloat(result6.emptyTask4) + parseFloat(result8.emptyTask4) + parseFloat(result10.emptyTask4);
            result12.emptyTaskTotal = parseFloat(result1.emptyTaskTotal) + parseFloat(result2.emptyTaskTotal) + parseFloat(result3.emptyTaskTotal) + parseFloat(result4.emptyTaskTotal) + parseFloat(result6.emptyTaskTotal) + parseFloat(result8.emptyTaskTotal) + parseFloat(result10.emptyTaskTotal);
            result12.stopTask1 = parseFloat(result1.stopTask1) + parseFloat(result2.stopTask1) + parseFloat(result3.stopTask1) + parseFloat(result4.stopTask1) + parseFloat(result6.stopTask1) + parseFloat(result8.stopTask1) + parseFloat(result10.stopTask1);
            result12.stopTask2 = parseFloat(result1.stopTask2) + parseFloat(result2.stopTask2) + parseFloat(result3.stopTask2) + parseFloat(result4.stopTask2) + parseFloat(result6.stopTask2) + parseFloat(result8.stopTask2) + parseFloat(result10.stopTask2);
            result12.stopTask3 = parseFloat(result1.stopTask3) + parseFloat(result2.stopTask3) + parseFloat(result3.stopTask3) + parseFloat(result4.stopTask3) + parseFloat(result6.stopTask3) + parseFloat(result8.stopTask3) + parseFloat(result10.stopTask3);
            result12.stopTaskTotal = parseFloat(result1.stopTaskTotal) + parseFloat(result2.stopTaskTotal) + parseFloat(result3.stopTaskTotal) + parseFloat(result4.stopTaskTotal) + parseFloat(result6.stopTaskTotal) + parseFloat(result8.stopTaskTotal) + parseFloat(result10.stopTaskTotal);
            result12.validPhones = parseFloat(result1.validPhones) + parseFloat(result2.validPhones) + parseFloat(result3.validPhones) + parseFloat(result4.validPhones) + parseFloat(result6.validPhones) + parseFloat(result8.validPhones) + parseFloat(result10.validPhones);
            result12.receivePersons = parseFloat(result1.receivePersons) + parseFloat(result2.receivePersons) + parseFloat(result3.receivePersons) + parseFloat(result4.receivePersons) + parseFloat(result6.receivePersons) + parseFloat(result8.receivePersons) + parseFloat(result10.receivePersons);
            result12.normalTasks = parseFloat(result1.normalTasks) + parseFloat(result2.normalTasks) + parseFloat(result3.normalTasks) + parseFloat(result4.normalTasks) + parseFloat(result6.normalTasks) + parseFloat(result8.normalTasks) + parseFloat(result10.normalTasks);
            result12.outCars = parseFloat(result1.outCars) + parseFloat(result2.outCars) + parseFloat(result3.outCars) + parseFloat(result4.outCars) + parseFloat(result6.outCars) + parseFloat(result8.outCars) + parseFloat(result10.outCars);
            //计算中心医院，太和站，高速站，华容站所占比例
            result5.emptyTask1 = util.calculateRate(result12.emptyTask1, parseFloat(result1.emptyTask1) + parseFloat(result2.emptyTask1) + parseFloat(result3.emptyTask1) + parseFloat(result4.emptyTask1));
            result5.emptyTask2 = util.calculateRate(result12.emptyTask2, parseFloat(result1.emptyTask2) + parseFloat(result2.emptyTask2) + parseFloat(result3.emptyTask2) + parseFloat(result4.emptyTask2));
            result5.emptyTask3 = util.calculateRate(result12.emptyTask3, parseFloat(result1.emptyTask3) + parseFloat(result2.emptyTask3) + parseFloat(result3.emptyTask3) + parseFloat(result4.emptyTask3));
            result5.emptyTask4 = util.calculateRate(result12.emptyTask4, parseFloat(result1.emptyTask4) + parseFloat(result2.emptyTask4) + parseFloat(result3.emptyTask4) + parseFloat(result4.emptyTask4));
            result5.emptyTaskTotal = util.calculateRate(result12.emptyTaskTotal, parseFloat(result1.emptyTaskTotal) + parseFloat(result2.emptyTaskTotal) + parseFloat(result3.emptyTaskTotal) + parseFloat(result4.emptyTaskTotal));
            result5.stopTask1 = util.calculateRate(result12.stopTask1, parseFloat(result1.stopTask1) + parseFloat(result2.stopTask1) + parseFloat(result3.stopTask1) + parseFloat(result4.stopTask1));
            result5.stopTask2 = util.calculateRate(result12.stopTask2, parseFloat(result1.stopTask2) + parseFloat(result2.stopTask2) + parseFloat(result3.stopTask2) + parseFloat(result4.stopTask2));
            result5.stopTask3 = util.calculateRate(result12.stopTask3, parseFloat(result1.stopTask3) + parseFloat(result2.stopTask3) + parseFloat(result3.stopTask3) + parseFloat(result4.stopTask3));
            result5.stopTaskTotal = util.calculateRate(result12.stopTaskTotal, parseFloat(result1.stopTaskTotal) + parseFloat(result2.stopTaskTotal) + parseFloat(result3.stopTaskTotal));
            result5.validPhones = util.calculateRate(result12.validPhones, parseFloat(result1.validPhones) + parseFloat(result2.validPhones) + parseFloat(result3.validPhones) + parseFloat(result4.validPhones));
            result5.receivePersons = util.calculateRate(result12.receivePersons, parseFloat(result1.receivePersons) + parseFloat(result2.receivePersons) + parseFloat(result3.receivePersons) + parseFloat(result4.receivePersons));
            result5.normalTasks = util.calculateRate(result12.normalTasks, parseFloat(result1.normalTasks) + parseFloat(result2.normalTasks) + parseFloat(result3.normalTasks) + parseFloat(result4.normalTasks));
            result5.outCars = util.calculateRate(result12.outCars, parseFloat(result1.outCars) + parseFloat(result2.outCars) + parseFloat(result3.outCars) + parseFloat(result4.outCars));
            //计算鄂钢医院所占比例
            result7.emptyTask1 = util.calculateRate(result12.emptyTask1, parseFloat(result6.emptyTask1));
            result7.emptyTask2 = util.calculateRate(result12.emptyTask2, parseFloat(result6.emptyTask2));
            result7.emptyTask3 = util.calculateRate(result12.emptyTask3, parseFloat(result6.emptyTask3));
            result7.emptyTask4 = util.calculateRate(result12.emptyTask4, parseFloat(result6.emptyTask4));
            result7.emptyTaskTotal = util.calculateRate(result12.emptyTaskTotal, parseFloat(result6.emptyTaskTotal));
            result7.stopTask1 = util.calculateRate(result12.stopTask1, parseFloat(result6.stopTask1));
            result7.stopTask2 = util.calculateRate(result12.stopTask2, parseFloat(result6.stopTask2));
            result7.stopTask3 = util.calculateRate(result12.stopTask3, parseFloat(result6.stopTask3));
            result7.stopTaskTotal = util.calculateRate(result12.stopTaskTotal, parseFloat(result6.stopTaskTotal));
            result7.validPhones = util.calculateRate(result12.validPhones, parseFloat(result6.validPhones));
            result7.receivePersons = util.calculateRate(result12.receivePersons, parseFloat(result6.receivePersons));
            result7.normalTasks = util.calculateRate(result12.normalTasks, parseFloat(result6.normalTasks));
            result7.outCars = util.calculateRate(result12.outCars, parseFloat(result6.outCars));
            //计算二医院所占比例
            result9.emptyTask1 = util.calculateRate(result12.emptyTask1, parseFloat(result8.emptyTask1));
            result9.emptyTask2 = util.calculateRate(result12.emptyTask2, parseFloat(result8.emptyTask2));
            result9.emptyTask3 = util.calculateRate(result12.emptyTask3, parseFloat(result8.emptyTask3));
            result9.emptyTask4 = util.calculateRate(result12.emptyTask4, parseFloat(result8.emptyTask4));
            result9.emptyTaskTotal = util.calculateRate(result12.emptyTaskTotal, parseFloat(result8.emptyTaskTotal));
            result9.stopTask1 = util.calculateRate(result12.stopTask1, parseFloat(result8.stopTask1));
            result9.stopTask2 = util.calculateRate(result12.stopTask2, parseFloat(result8.stopTask2));
            result9.stopTask3 = util.calculateRate(result12.stopTask3, parseFloat(result8.stopTask3));
            result9.stopTaskTotal = util.calculateRate(result12.stopTaskTotal, parseFloat(result8.stopTaskTotal));
            result9.validPhones = util.calculateRate(result12.validPhones, parseFloat(result8.validPhones));
            result9.receivePersons = util.calculateRate(result12.receivePersons, parseFloat(result8.receivePersons));
            result9.normalTasks = util.calculateRate(result12.normalTasks, parseFloat(result8.normalTasks));
            result9.outCars = util.calculateRate(result12.outCars, parseFloat(result8.outCars));
            //计算中医医院所占比例
            result11.emptyTask1 = util.calculateRate(result12.emptyTask1, parseFloat(result10.emptyTask1));
            result11.emptyTask2 = util.calculateRate(result12.emptyTask2, parseFloat(result10.emptyTask2));
            result11.emptyTask3 = util.calculateRate(result12.emptyTask3, parseFloat(result10.emptyTask3));
            result11.emptyTask4 = util.calculateRate(result12.emptyTask4, parseFloat(result10.emptyTask4));
            result11.emptyTaskTotal = util.calculateRate(result12.emptyTaskTotal, parseFloat(result10.emptyTaskTotal));
            result11.stopTask1 = util.calculateRate(result12.stopTask1, parseFloat(result10.stopTask1));
            result11.stopTask2 = util.calculateRate(result12.stopTask2, parseFloat(result10.stopTask2));
            result11.stopTask3 = util.calculateRate(result12.stopTask3, parseFloat(result10.stopTask3));
            result11.stopTaskTotal = util.calculateRate(result12.stopTaskTotal, parseFloat(result10.stopTaskTotal));
            result11.validPhones = util.calculateRate(result12.validPhones, parseFloat(result10.validPhones));
            result11.receivePersons = util.calculateRate(result12.receivePersons, parseFloat(result10.receivePersons));
            result11.normalTasks = util.calculateRate(result12.normalTasks, parseFloat(result10.normalTasks));
            result11.outCars = util.calculateRate(result12.outCars, parseFloat(result10.outCars));
            //添加结果集1
            result.push(result1);
            result.push(result2);
            result.push(result3);
            result.push(result4);
            result.push(result5);
            result.push(result6);
            result.push(result7);
            result.push(result8);
            result.push(result9);
            result.push(result10);
            result.push(result11);
            result.push(result12);
            //添加结果集1--end
            //添加结果集2
            table2.push(rs1);
            table2.push(rs2);
            table2.push(rs3);
            table2.push(rs4);
            table2.push(rs5);
            table2.push(rs6);
            table2.push(rs7);
            table2.push(rs8);
            table2.push(rs9);
            //添加结果集2--end
            res.json({"rs": result, "numbers": data3[0].phoneNumbers, "rs2": table2});
        }
    });
};

/**
 * 日报表1
 * @param req
 * @param res
 */
exports.getCenterDay = function (req, res) {
    var startTime = req.body.startTime;
    var endTime = req.body.endTime;
    var type = req.query.type; //日报表类型 2时表示日报表2，区别日报表电话判断，日报表2医生诊断
    var params = [{"name": "startTime", "value": startTime, "type": "varchar"}, {
        "name": "endTime", "value": endTime, "type": "varchar"
    }];
    var sqlBatch = [];//批查询
    var sql;
    if (string.isEquals('2', type)) {
        sql = "select convert(varchar(20),a.派车时刻,120) ,convert(varchar(20),t.出车时刻,120) ,convert(varchar(20),t.完成时刻,120) ,    " +
            "s.分站名称,am.实际标识,t.司机,t.随车医生,t.随车护士,a.呼救电话,a.联系电话,a.现场地址,pc.医生诊断,tr.NameM,t.送往地点,        " +
            "DATEDIFF(SECOND,a.派车时刻,t.出车时刻) ,DATEDIFF(SECOND,t.出车时刻,t.到达现场时刻) ,dls.NameM,m.姓名,DATEDIFF(SECOND,a.开始受理时刻,a.结束受理时刻)    " +
            "from ausp120.tb_EventV e left outer join ausp120.tb_AcceptDescriptV a on e.事件编码=a.事件编码    " +
            "left outer join ausp120.tb_TaskV t on t.事件编码=a.事件编码 and t.受理序号=a.受理序号    left outer join ausp120.tb_Station s on s.分站编码=t.分站编码    " +
            "left outer join ausp120.tb_DTaskResult tr on tr.Code=t.结果编码    left outer join ausp120.tb_DLinkSource dls on dls.Code=e.联动来源编码    " +
            "left outer join ausp120.tb_MrUser m on m.工号=t.调度员编码    left outer join ausp120.tb_Ambulance am on am.车辆编码=t.车辆编码 " +
            "left outer join ausp120.tb_PatientCase pc on pc.车辆标识=am.实际标识 and pc.任务编码=t.任务编码 and pc.序号=1  " +
            "where e.事件性质编码=1 and a.类型编码 not in (2,4) and a.开始受理时刻 between @startTime and @endTime     order by a.开始受理时刻    ";
    } else {
        sql = "select convert(varchar(20),a.派车时刻,120) ,convert(varchar(20),t.出车时刻,120) ,convert(varchar(20),t.完成时刻,120) ,    " +
            "s.分站名称,am.实际标识,t.司机,t.随车医生,t.随车护士,a.呼救电话,a.联系电话,a.现场地址,a.初步判断,tr.NameM,t.送往地点,        " +
            "DATEDIFF(SECOND,a.派车时刻,t.出车时刻) ,DATEDIFF(SECOND,t.出车时刻,t.到达现场时刻) ,dls.NameM,m.姓名,DATEDIFF(SECOND,a.开始受理时刻,a.结束受理时刻)    " +
            "from ausp120.tb_EventV e left outer join ausp120.tb_AcceptDescriptV a on e.事件编码=a.事件编码    " +
            "left outer join ausp120.tb_TaskV t on t.事件编码=a.事件编码 and t.受理序号=a.受理序号    left outer join ausp120.tb_Station s on s.分站编码=t.分站编码    " +
            "left outer join ausp120.tb_DTaskResult tr on tr.Code=t.结果编码    left outer join ausp120.tb_DLinkSource dls on dls.Code=e.联动来源编码    " +
            "left outer join ausp120.tb_MrUser m on m.工号=t.调度员编码    left outer join ausp120.tb_Ambulance am on am.车辆编码=t.车辆编码    " +
            "where e.事件性质编码=1 and a.类型编码 not in (2,4) and a.开始受理时刻 between @startTime and @endTime    order by a.开始受理时刻    ";
    }
    var sqlData = {
        statement: sql,
        params: params
    };
    sqlBatch.push(sqlData);

    sql = "select COUNT(*) 总数,SUM(case when t.结果编码=4 then 1 else 0 end) 正常,SUM(case when t.结果编码=2 then 1 else 0 end) 中止,    " +
        "SUM(case when t.结果编码=3 then 1 else 0 end) 空车    from ausp120.tb_EventV e left outer join ausp120.tb_AcceptDescriptV a on e.事件编码=a.事件编码    " +
        "left outer join ausp120.tb_TaskV t on t.事件编码=a.事件编码 and t.受理序号=a.受理序号    " +
        "where e.事件性质编码=1 and a.类型编码 not in (2,4) and a.开始受理时刻 between  @startTime and @endTime   ";
    sqlBatch.push({
        statement: sql,
        params: params
    });

    db.selectSerial(sqlBatch, function (err, results) {
        if (err) {
            console.log(results);
        } else {
            var resultBatch = [];//往前台返回的结果
            var result = []; //查询1的结果
            var summary = [];//统计结果
            var data; //存储查询结果
            for (var j = 0; j < results.length; j++) {
                if (j == 0) { //结果1处理
                    data = results[j];
                    for (var i = 0; i < data.length; i++) {
                        result.push({
                            "sendTime": data[i][0].value || '',
                            "outTime": data[i][1].value || '',
                            "completeTime": data[i][2].value || '',
                            "station": data[i][3].value || '',
                            "carIdentification": data[i][4].value || '',
                            "driver": data[i][5].value || '',
                            "doctor": data[i][6].value || '',
                            "nurse": data[i][7].value || '',
                            "alarmPhone": data[i][8].value || '',
                            "linkPhone": data[i][9].value || '',
                            "localAddr": data[i][10].value || '',
                            "phoneJudge": data[i][11].value || '',
                            "carResult": data[i][12].value || '',
                            "sendAddr": data[i][13].value || '',
                            "outTimes": util.formatSecond(data[i][14].value),
                            "arriveSpotTime": util.formatSecond(data[i][15].value),
                            "linkSource": data[i][16].value || '',
                            "dispatcher": data[i][17].value || '',
                            "dispatchTime": util.formatSecond(data[i][18].value)
                        });
                    }//结果1处理结束

                }

                if (j == 1) { //结果2处理
                    data = results[j];
                    for (var i = 0; i < data.length; i++) {
                        summary.push({
                            "total": data[i][0].value || 0,
                            "normal": data[i][1].value || 0,
                            "stopTask": data[i][2].value || 0,
                            "emptyTask": data[i][3].value || 0
                        });
                    }
                } //结果2处理结束

            }
            res.json({"result1": result, "summary": summary});
        }
    });
};

/**
 * 社会急救保障流水表
 * @param req
 * @param res
 */
exports.getEventTypeFlow = function (req, res) {
    var startTime = req.body.startTime;
    var endTime = req.body.endTime;
    var type = req.query.type; //type=2是 查询的是医疗保障和应急演练
    var params = [{"name": "startTime", "value": startTime, "type": "varchar"}, {
        "name": "endTime", "value": endTime, "type": "varchar"
    }];
    var sql;
    if (string.isEquals('2', type)) { //医疗保障和应急演练
        sql = "select CONVERT(varchar(20),a.开始受理时刻,120),CONVERT(varchar(20),t.完成时刻,120),s.分站名称,am.车牌号码,am.实际标识,t.司机,    " +
            "t.随车护士,a.联系电话,a.患者姓名,a.性别,a.年龄,a.现场地址,a.初步判断,t.送往地点,tr.NameM,et.NameM,dg.NameM,'0' 公里,t.人数,    " +
            "case when e.联动来源编码=2 then '是' else '否' end,m.姓名    from ausp120.tb_EventV e left outer join ausp120.tb_AcceptDescriptV a on a.事件编码=e.事件编码    " +
            "left outer join ausp120.tb_TaskV t on t.受理序号=a.受理序号 and t.事件编码=a.事件编码    left outer join ausp120.tb_Ambulance am on am.车辆编码=t.车辆编码    " +
            "left outer join ausp120.tb_MrUser m on m.工号=t.调度员编码    left outer join ausp120.tb_Station s on s.分站编码=t.分站编码    " +
            "left outer join ausp120.tb_DTaskResult tr on tr.Code=t.结果编码    left outer join ausp120.tb_DEventType et on et.Code=e.事件类型编码    " +
            "left outer join ausp120.tb_DGroAccidentLevel dg on dg.Code=e.事故种类编码    " +
            "where e.事件性质编码=1 and a.类型编码 not in (2,4) and e.事件类型编码 in (5,9) and a.开始受理时刻 between  @startTime and  @endTime   order by a.开始受理时刻   ";
    } else {
        sql = "select CONVERT(varchar(20),a.开始受理时刻,120),CONVERT(varchar(20),t.完成时刻,120),s.分站名称,am.车牌号码,am.实际标识,t.司机,    " +
            "t.随车护士,a.联系电话,a.患者姓名,a.性别,a.年龄,a.现场地址,a.初步判断,t.送往地点,tr.NameM,et.NameM,dg.NameM,'0' 公里,t.人数,    " +
            "case when e.联动来源编码=2 then '是' else '否' end,m.姓名    from ausp120.tb_EventV e left outer join ausp120.tb_AcceptDescriptV a on a.事件编码=e.事件编码    " +
            "left outer join ausp120.tb_TaskV t on t.受理序号=a.受理序号 and t.事件编码=a.事件编码    left outer join ausp120.tb_Ambulance am on am.车辆编码=t.车辆编码    " +
            "left outer join ausp120.tb_MrUser m on m.工号=t.调度员编码    left outer join ausp120.tb_Station s on s.分站编码=t.分站编码    " +
            "left outer join ausp120.tb_DTaskResult tr on tr.Code=t.结果编码    left outer join ausp120.tb_DEventType et on et.Code=e.事件类型编码    " +
            "left outer join ausp120.tb_DGroAccidentLevel dg on dg.Code=e.事故种类编码    " +
            "where e.事件性质编码=1 and a.类型编码 not in (2,4) and a.开始受理时刻 between  @startTime and  @endTime   order by a.开始受理时刻   ";
    }
    var sqlData = {
        statement: sql,
        params: params
    };

    db.select(sqlData, function (err, results) {
        if (err) {
            console.log(results);
        } else {
            var result = []; //查询的结果
            for (var i = 0; i < results.length; i++) {
                result.push({
                    "acceptTime": results[i][0].value || '',
                    "completeTime": results[i][1].value || '',
                    "station": results[i][2].value || '',
                    "carNo": results[i][3].value || '',
                    "carIdentification": results[i][4].value || '',
                    "driver": results[i][5].value || '',
                    "nurse": results[i][6].value || '',
                    "linkPhone": results[i][7].value || '',
                    "patientName": results[i][8].value || '',
                    "sex": results[i][9].value || '',
                    "age": results[i][10].value || '',
                    "localAddr": results[i][11].value || '',
                    "phoneJudge": results[i][12].value || '',
                    "sendAddr": results[i][13].value || '',
                    "taskResult": results[i][14].value || '',
                    "eventType": results[i][15].value || '',
                    "accidentType": results[i][16].value || '',
                    "distance": results[i][17].value || 0,
                    "numbers": results[i][18].value || 0,
                    "linkSourse": results[i][19].value || '',
                    "dispatcher": results[i][20].value || ''
                });

            }
            res.json(result);
        }
    });

};

/**
 * 突发公卫事件
 * @param req
 * @param res
 */
exports.getAccident = function (req, res) {
    var startTime = req.body.startTime;
    var endTime = req.body.endTime;
    var params = [{"name": "startTime", "value": startTime, "type": "varchar"}, {
        "name": "endTime", "value": endTime, "type": "varchar"
    }];
    var sql;
    sql = "select CONVERT(varchar(20),e.受理时刻,120),ga.事发地点,ga.事故名称,s.分站名称,ga.出车总数,ga.抢救人数,ga.重伤人数,ga.中伤人数,ga.轻伤人数,ga.死亡人数," +
        "ga.送往地点,ga.向中心领导汇报情况,ga.调度员    from ausp120.tb_GroAccident ga left outer join ausp120.tb_EventV e on e.事件编码=ga.事件编码    " +
        "left outer join ausp120.tb_Station s on s.分站编码=ga.分站编码    where e.事件性质编码=1 and e.受理时刻 between  @startTime and  @endTime     ";
    var sqlData = {
        statement: sql,
        params: params
    };

    db.select(sqlData, function (err, results) {
        if (err) {
            console.log(results);
        } else {
            var result = []; //查询的结果
            for (var i = 0; i < results.length; i++) {
                result.push({
                    "acceptTime": results[i][0].value || '',
                    "localAddr": results[i][1].value || '',
                    "eventName": results[i][2].value || '',
                    "station": results[i][3].value || '',
                    "carNumbers": results[i][4].value || 0,
                    "rescuePersons": results[i][5].value || 0,
                    "heavyPersons": results[i][6].value || 0,
                    "mediumPersons": results[i][7].value || 0,
                    "lightPersons": results[i][8].value || 0,
                    "deathPerson": results[i][9].value || 0,
                    "sendAddr": results[i][10].value || '',
                    "report": results[i][11].value || '',
                    "dispatcher": results[i][12].value || ''
                });

            }
            res.json(result);
        }
    });
};

/**
 * 高速站出车
 * @param req
 * @param res
 */
exports.getGsStationOutCar = function (req, res) {
    var startTime = req.body.startTime;
    var endTime = req.body.endTime;
    var params = [{"name": "startTime", "value": startTime, "type": "varchar"}, {
        "name": "endTime", "value": endTime, "type": "varchar"
    }];
    var sql;
    sql = "select a.事件编码,a.受理序号,a.类型编码,a.开始受理时刻,case when a.现场地址 like '%武黄高速%' then '武黄高速路段出车'     " +
        "when a.现场地址 like '%汉鄂高速%' then '汉鄂高速路段出车'    when (not  a.现场地址  like '%汉鄂高速%' or a.现场地址 like '%武皇高速%') then '高速周边路段出车'  end 现场地址 into #temp1  " +
        "from ausp120.tb_AcceptDescript a    select a.现场地址,COUNT(*) 出车次数,SUM(case when t.结果编码=4 then 1 else 0 end) 接到次数,        " +
        "SUM(case when t.结果编码=4 then t.人数 else 0 end) 接到人数    from ausp120.tb_EventV e left outer join #temp1 a on a.事件编码=e.事件编码    " +
        "left outer join ausp120.tb_TaskV t on a.受理序号=t.受理序号 and a.事件编码=t.事件编码    " +
        "where e.事件性质编码=1 and a.类型编码 not in (2,4) and t.分站编码='006' and a.开始受理时刻 between  @startTime and  @endTime    group by a.现场地址    drop table #temp1    ";
    var sqlData = {
        statement: sql,
        params: params
    };
    var summary = {
        "project": "合计",
        "outCars": 0,
        "normals": 0,
        "receivePersons": 0
    };
    var data1 = {
        "project": "武黄高速路段出车",
        "outCars": 0,
        "normals": 0,
        "receivePersons": 0
    };
    var data2 = {
        "project": "汉鄂高速路段出车",
        "outCars": 0,
        "normals": 0,
        "receivePersons": 0
    };
    var data3 = {
        "project": "高速周边路段出车",
        "outCars": 0,
        "normals": 0,
        "receivePersons": 0
    };

    db.select(sqlData, function (err, results) {
        if (err) {
            console.log(results);
        } else {
            var result = []; //查询的结果
            for (var i = 0; i < results.length; i++) {
                if (string.isEquals(results[i][0].value, '武黄高速路段出车')) {
                    data1.outCars = results[i][1].value || '';
                    data1.normals = results[i][2].value || '';
                    data1.receivePersons = results[i][3].value || '';
                }
                if (string.isEquals(results[i][0].value, '汉鄂高速路段出车')) {
                    data2.outCars = results[i][1].value || '';
                    data2.normals = results[i][2].value || '';
                    data2.receivePersons = results[i][3].value || '';
                }
                if (string.isEquals(results[i][0].value, '高速周边路段出车')) {
                    data3.outCars = results[i][1].value || '';
                    data3.normals = results[i][2].value || '';
                    data3.receivePersons = results[i][3].value || '';
                }
            }
            summary.normals = parseInt(data1.normals) + parseInt(data2.normals) + parseInt(data3.normals);
            summary.outCars = parseInt(data1.outCars) + parseInt(data2.outCars) + parseInt(data3.outCars);
            summary.receivePersons = parseInt(data1.receivePersons) + parseInt(data2.receivePersons) + parseInt(data3.receivePersons);
            result.push(data1);
            result.push(data2);
            result.push(data3);
            result.push(summary);
            res.json(result);
        }
    });
};

/**
 * 急救站出车情况表
 * @param req
 * @param res
 */
exports.getStationOutCar = function (req, res) {
    var startTime = req.body.startTime;
    var endTime = req.body.endTime;
    var params = [{"name": "startTime", "value": startTime, "type": "varchar"}, {
        "name": "endTime", "value": endTime, "type": "varchar"
    }];
    var sqlBatch = [];//批查询
    var sql;
    sql = "select s.分站名称,convert(varchar(20),a.派车时刻,120) ,convert(varchar(20),t.出车时刻,120) ,convert(varchar(20),t.完成时刻,120) ,    " +
        "am.实际标识,t.司机,t.随车医生,t.随车护士,a.呼救电话,a.联系电话,a.现场地址,a.初步判断,tr.NameM,t.送往地点,        " +
        "DATEDIFF(SECOND,a.派车时刻,t.出车时刻) ,DATEDIFF(SECOND,t.出车时刻,t.到达现场时刻) ,dls.NameM,m.姓名,DATEDIFF(SECOND,a.开始受理时刻,a.结束受理时刻)    " +
        "from ausp120.tb_EventV e left outer join ausp120.tb_AcceptDescriptV a on e.事件编码=a.事件编码    " +
        "left outer join ausp120.tb_TaskV t on t.事件编码=a.事件编码 and t.受理序号=a.受理序号    left outer join ausp120.tb_Station s on s.分站编码=t.分站编码    " +
        "left outer join ausp120.tb_DTaskResult tr on tr.Code=t.结果编码    left outer join ausp120.tb_DLinkSource dls on dls.Code=e.联动来源编码    " +
        "left outer join ausp120.tb_MrUser m on m.工号=t.调度员编码    left outer join ausp120.tb_Ambulance am on am.车辆编码=t.车辆编码 " +
        "where e.事件性质编码=1 and a.类型编码 not in (2,4) and a.开始受理时刻 between @startTime and @endTime     order by a.开始受理时刻    ";
    var sqlData = {
        statement: sql,
        params: params
    };
    sqlBatch.push(sqlData);

    sql = "select COUNT(*) 总数,SUM(case when t.结果编码=4 then 1 else 0 end) 正常,SUM(case when t.结果编码=2 then 1 else 0 end) 中止,    " +
        "SUM(case when t.结果编码=3 then 1 else 0 end) 空车    from ausp120.tb_EventV e left outer join ausp120.tb_AcceptDescriptV a on e.事件编码=a.事件编码    " +
        "left outer join ausp120.tb_TaskV t on t.事件编码=a.事件编码 and t.受理序号=a.受理序号    " +
        "where e.事件性质编码=1 and a.类型编码 not in (2,4) and a.开始受理时刻 between  @startTime and @endTime   ";
    sqlBatch.push({
        statement: sql,
        params: params
    });

    db.selectSerial(sqlBatch, function (err, results) {
        if (err) {
            console.log(results);
        } else {
            var resultBatch = [];//往前台返回的结果
            var result = []; //查询1的结果
            var summary = [];//统计结果
            var data; //存储查询结果
            for (var j = 0; j < results.length; j++) {
                if (j == 0) { //结果1处理
                    data = results[j];
                    for (var i = 0; i < data.length; i++) {
                        result.push({
                            "station": data[i][0].value || '',
                            "sendTime": data[i][1].value || '',
                            "outTime": data[i][2].value || '',
                            "completeTime": data[i][3].value || '',
                            "carIdentification": data[i][4].value || '',
                            "driver": data[i][5].value || '',
                            "doctor": data[i][6].value || '',
                            "nurse": data[i][7].value || '',
                            "alarmPhone": data[i][8].value || '',
                            "linkPhone": data[i][9].value || '',
                            "localAddr": data[i][10].value || '',
                            "phoneJudge": data[i][11].value || '',
                            "carResult": data[i][12].value || '',
                            "sendAddr": data[i][13].value || '',
                            "outTimes": util.formatSecond(data[i][14].value),
                            "arriveSpotTime": util.formatSecond(data[i][15].value),
                            "linkSource": data[i][16].value || '',
                            "dispatcher": data[i][17].value || '',
                            "dispatchTime": util.formatSecond(data[i][18].value)
                        });
                    }//结果1处理结束

                }

                if (j == 1) { //结果2处理
                    data = results[j];
                    for (var i = 0; i < data.length; i++) {
                        summary.push({
                            "total": data[i][0].value || 0,
                            "normal": data[i][1].value || 0,
                            "stopTask": data[i][2].value || 0,
                            "emptyTask": data[i][3].value || 0
                        });
                    }
                } //结果2处理结束

            }
            res.json({"result1": result, "summary": summary});
        }
    });
};

/**
 * 三家医院出车反馈
 * @param req
 * @param res
 */
exports.getStationOutCarFeedback = function (req, res) {
    var time1 = req.body.time1;
    var time2 = req.body.time2;
    var time3 = req.body.time3;
    var station = req.body.station;
    var params = [{"name": "time1", "value": time1, "type": "varchar"}, {
        "name": "time2", "value": time2, "type": "varchar"
    }, {
        "name": "time3", "value": time3, "type": "varchar"
    }];
    var sqlBatch = [];//批查询
    var sql;
    var sqlComm = "select t.受理序号,t.出车时刻,t.事件编码,t.结果编码,t.分站编码,case when CONVERT(varchar(20),t.生成任务时刻,108) between '06:30:00' and '21:30:00' then '白天(6:30－21:30)'    " +
        "when CONVERT(varchar(20),t.生成任务时刻,108) not between '06:30:00' and '21:30:00' then '晚上(21:30-次日6:30)' end 时间  into #task    from ausp120.tb_TaskV t    " +
        "select t.时间,COUNT(*) 出车次数,SUM(case when DATEDIFF(S,a.派车时刻,t.出车时刻)<120 then 1 else 0 end) 未超时,        " +
        "SUM(case when DATEDIFF(S,a.派车时刻,t.出车时刻)<180 and DATEDIFF(S,a.派车时刻,t.出车时刻)>=120 then 1 else 0 end) 超2,        " +
        "SUM(case when DATEDIFF(S,a.派车时刻,t.出车时刻)<240 and DATEDIFF(S,a.派车时刻,t.出车时刻)>=180 then 1 else 0 end) 超3,        " +
        "SUM(case when DATEDIFF(S,a.派车时刻,t.出车时刻)<300 and DATEDIFF(S,a.派车时刻,t.出车时刻)>=240 then 1 else 0 end) 超4,        " +
        "SUM(case when DATEDIFF(S,a.派车时刻,t.出车时刻)<600 and DATEDIFF(S,a.派车时刻,t.出车时刻)>=300 then 1 else 0 end) 超5,        " +
        "SUM(case when  DATEDIFF(S,a.派车时刻,t.出车时刻)>=600 then 1 else 0 end) 超10,        " +
        "SUM(case when  DATEDIFF(S,a.派车时刻,t.出车时刻)>=120 then 1 else 0 end) 合计,'0' 比例    " +
        "from ausp120.tb_EventV e left outer join ausp120.tb_AcceptDescriptv a on a.事件编码=e.事件编码    " +
        "left outer join #task t on a.受理序号=t.受理序号 and a.事件编码=t.事件编码    " +
        "where e.事件性质编码=1 and a.类型编码 not in (2,4) and t.出车时刻 is not null    ";
    var sqlEnd = "	group by t.时间     drop table #task";
    if (string.isEquals('1', station)) { //中心医院四家医院
        sql = sqlComm + " and a.开始受理时刻 between  @time2 and @time3 and  t.分站编码 in ('001','004','005','006') " + sqlEnd;
    }
    if (string.isEquals('2', station)) { //鄂钢医院医院
        sql = sqlComm + " and a.开始受理时刻 between  @time2 and @time3 and  t.分站编码 ='003' " + sqlEnd;
    }
    if (string.isEquals('3', station)) { //二医院医院
        sql = sqlComm + " and a.开始受理时刻 between  @time2 and @time3 and  t.分站编码 ='002' " + sqlEnd;
    }
    var sqlData = {
        statement: sql,
        params: params
    };
    sqlBatch.push(sqlData);


    if (string.isEquals('1', station)) { //中心医院四家医院
        sql = sqlComm + " and a.开始受理时刻 between  @time1 and @time2 and  t.分站编码 in ('001','004','005','006') " + sqlEnd;
    }
    if (string.isEquals('2', station)) { //鄂钢医院医院
        sql = sqlComm + " and a.开始受理时刻 between  @time1 and @time2 and  t.分站编码 ='003' " + sqlEnd;
    }
    if (string.isEquals('3', station)) { //二医院医院
        sql = sqlComm + " and a.开始受理时刻 between  @time1 and @time2 and  t.分站编码 ='002' " + sqlEnd;
    }
    sqlBatch.push({
        statement: sql,
        params: params
    });
    var rs1_1 = {
        "project": '白天(6:30－21:30)',
        "outCars": '0',
        "noPass": '0',
        "pass2": '0',
        "pass3": '0',
        "pass4": '0',
        "pass5": '0',
        "pass10": '0',
        "total": '0',
        "ratio": '0'
    };
    var rs1_2 = {
        "project": '晚上(21:30-次日6:30)',
        "outCars": '0',
        "noPass": '0',
        "pass2": '0',
        "pass3": '0',
        "pass4": '0',
        "pass5": '0',
        "pass10": '0',
        "total": '0',
        "ratio": '0'
    };
    var summary1 = {
        "project": '合计',
        "outCars": '0',
        "noPass": '0',
        "pass2": '0',
        "pass3": '0',
        "pass4": '0',
        "pass5": '0',
        "pass10": '0',
        "total": '0',
        "ratio": '0'
    };
    var rs2_1 = {
        "project": '白天(6:30－21:30)',
        "outCars": '0',
        "noPass": '0',
        "pass2": '0',
        "pass3": '0',
        "pass4": '0',
        "pass5": '0',
        "pass10": '0',
        "total": '0',
        "ratio": '0'
    };
    var rs2_2 = {
        "project": '晚上(21:30-次日6:30)',
        "outCars": '0',
        "noPass": '0',
        "pass2": '0',
        "pass3": '0',
        "pass4": '0',
        "pass5": '0',
        "pass10": '0',
        "total": '0',
        "ratio": '0'
    };
    var summary2 = {
        "project": '合计',
        "outCars": '0',
        "noPass": '0',
        "pass2": '0',
        "pass3": '0',
        "pass4": '0',
        "pass5": '0',
        "pass10": '0',
        "total": '0',
        "ratio": '0'
    };

    db.selectSerial(sqlBatch, function (err, results) {
        if (err) {
            console.log(results);
        } else {
            var resultBatch = [];//往前台返回的结果
            var result1 = []; //查询1的结果
            var result2 = [];//查询2的结果
            var data; //存储查询结果
            for (var j = 0; j < results.length; j++) {
                if (j == 0) { //结果1处理
                    data = results[j];
                    for (var i = 0; i < data.length; i++) {
                        if (string.isEquals('白天(6:30－21:30)', data[i][0].value)) {
                            rs1_1.outCars = data[i][1].value || 0;
                            rs1_1.noPass = data[i][2].value || 0;
                            rs1_1.pass2 = data[i][3].value || 0;
                            rs1_1.pass3 = data[i][4].value || 0;
                            rs1_1.pass4 = data[i][5].value || 0;
                            rs1_1.pass5 = data[i][6].value || 0;
                            rs1_1.pass10 = data[i][7].value || 0;
                            rs1_1.total = data[i][8].value || 0;
                            rs1_1.ratio = util.calculateRate(data[i][1].value, data[i][8].value);
                        }
                        if (string.isEquals('晚上(21:30-次日6:30)', data[i][0].value)) {
                            rs1_2.outCars = data[i][1].value || 0;
                            rs1_2.noPass = data[i][2].value || 0;
                            rs1_2.pass2 = data[i][3].value || 0;
                            rs1_2.pass3 = data[i][4].value || 0;
                            rs1_2.pass4 = data[i][5].value || 0;
                            rs1_2.pass5 = data[i][6].value || 0;
                            rs1_2.pass10 = data[i][7].value || 0;
                            rs1_2.total = data[i][8].value || 0;
                            rs1_2.ratio = util.calculateRate(data[i][1].value, data[i][8].value);
                        }
                    }//结果1处理结束
                }

                if (j == 1) { //结果2处理
                    data = results[j];
                    for (var i = 0; i < data.length; i++) {
                        if (string.isEquals('白天(6:30－21:30)', data[i][0].value)) {
                            rs2_1.outCars = data[i][1].value || 0;
                            rs2_1.noPass = data[i][2].value || 0;
                            rs2_1.pass2 = data[i][3].value || 0;
                            rs2_1.pass3 = data[i][4].value || 0;
                            rs2_1.pass4 = data[i][5].value || 0;
                            rs2_1.pass5 = data[i][6].value || 0;
                            rs2_1.pass10 = data[i][7].value || 0;
                            rs2_1.total = data[i][8].value || 0;
                            rs2_1.ratio = util.calculateRate(data[i][1].value, data[i][8].value);
                        }
                        if (string.isEquals('晚上(21:30-次日6:30)', data[i][0].value)) {
                            rs2_2.outCars = data[i][1].value || 0;
                            rs2_2.noPass = data[i][2].value || 0;
                            rs2_2.pass2 = data[i][3].value || 0;
                            rs2_2.pass3 = data[i][4].value || 0;
                            rs2_2.pass4 = data[i][5].value || 0;
                            rs2_2.pass5 = data[i][6].value || 0;
                            rs2_2.pass10 = data[i][7].value || 0;
                            rs2_2.total = data[i][8].value || 0;
                            rs2_2.ratio = util.calculateRate(data[i][1].value, data[i][8].value);
                        }
                    }
                } //结果2处理结束
            }
            summary1.outCars = parseInt(rs1_1.outCars) + parseInt(rs1_2.outCars);
            summary1.noPass = parseInt(rs1_1.noPass) + parseInt(rs1_2.noPass);
            summary1.pass2 = parseInt(rs1_1.pass2) + parseInt(rs1_2.pass2);
            summary1.pass3 = parseInt(rs1_1.pass3) + parseInt(rs1_2.pass3);
            summary1.pass4 = parseInt(rs1_1.pass4) + parseInt(rs1_2.pass4);
            summary1.pass5 = parseInt(rs1_1.pass5) + parseInt(rs1_2.pass5);
            summary1.pass10 = parseInt(rs1_1.pass10) + parseInt(rs1_2.pass10);
            summary1.total = parseInt(rs1_1.total) + parseInt(rs1_2.total);
            summary1.ratio = util.calculateRate(summary1.outCars, summary1.total);

            summary2.outCars = parseInt(rs2_1.outCars) + parseInt(rs2_2.outCars);
            summary2.noPass = parseInt(rs2_1.noPass) + parseInt(rs2_2.noPass);
            summary2.pass2 = parseInt(rs2_1.pass2) + parseInt(rs2_2.pass2);
            summary2.pass3 = parseInt(rs2_1.pass3) + parseInt(rs2_2.pass3);
            summary2.pass4 = parseInt(rs2_1.pass4) + parseInt(rs2_2.pass4);
            summary2.pass5 = parseInt(rs2_1.pass5) + parseInt(rs2_2.pass5);
            summary2.pass10 = parseInt(rs2_1.pass10) + parseInt(rs2_2.pass10);
            summary2.total = parseInt(rs2_1.total) + parseInt(rs2_2.total);
            summary2.ratio = util.calculateRate(summary2.outCars, summary2.total);

            result1.push(rs1_1);
            result1.push(rs1_2);
            result1.push(summary1);
            result2.push(rs2_1);
            result2.push(rs2_2);
            result2.push(summary2);

            res.json({"result1": result1, "result2": result2});
        }
    });
};

/**
 * 三家医院出车反馈
 * @param req
 * @param res
 */
exports.getThreeStationOutCar = function (req, res) {
    var startTime = req.body.startTime;
    var endTime = req.body.endTime;
    var params = [{"name": "startTime", "value": startTime, "type": "varchar"}, {
        "name": "endTime", "value": endTime, "type": "varchar"
    }];
    var sql = "select t.受理序号,t.出车时刻,t.事件编码,t.结果编码,t.分站编码,case when CONVERT(varchar(20),t.生成任务时刻,108) between '06:30:00' and '21:30:00' then '白天'    " +
        "when CONVERT(varchar(20),t.生成任务时刻,108) not between '06:30:00' and '21:30:00' then '晚上' end 时间,case when t.分站编码 in ('001','004','005','006') then '中心医院' " +
        "when t.分站编码='003' then '鄂钢医院'    when  t.分站编码='002' then '二医院' end 分站  into #task    from ausp120.tb_TaskV t    " +
        "select t.分站,t.时间,COUNT(*) 出车次数,SUM(case when DATEDIFF(S,a.派车时刻,t.出车时刻)<120 then 1 else 0 end) 未超时,        " +
        "SUM(case when DATEDIFF(S,a.派车时刻,t.出车时刻)<180 and DATEDIFF(S,a.派车时刻,t.出车时刻)>=120 then 1 else 0 end) 超2,        " +
        "SUM(case when DATEDIFF(S,a.派车时刻,t.出车时刻)<240 and DATEDIFF(S,a.派车时刻,t.出车时刻)>=180 then 1 else 0 end) 超3,        " +
        "SUM(case when DATEDIFF(S,a.派车时刻,t.出车时刻)<300 and DATEDIFF(S,a.派车时刻,t.出车时刻)>=240 then 1 else 0 end) 超4,        " +
        "SUM(case when DATEDIFF(S,a.派车时刻,t.出车时刻)<600 and DATEDIFF(S,a.派车时刻,t.出车时刻)>=300 then 1 else 0 end) 超5,        " +
        "SUM(case when  DATEDIFF(S,a.派车时刻,t.出车时刻)>=600 then 1 else 0 end) 超10,        " +
        "SUM(case when  DATEDIFF(S,a.派车时刻,t.出车时刻)>=120 then 1 else 0 end) 合计,'0' 比例    " +
        "from ausp120.tb_EventV e left outer join ausp120.tb_AcceptDescriptv a on a.事件编码=e.事件编码    " +
        "left outer join #task t on a.受理序号=t.受理序号 and a.事件编码=t.事件编码    " +
        "where e.事件性质编码=1 and a.类型编码 not in (2,4) and t.出车时刻 is not null and a.开始受理时刻 between  @startTime and @endTime   group by t.时间,t.分站     drop table #task ";
    var sqlData = {
        statement: sql,
        params: params
    };

    var rs1_1 = {
        "station": '中心医院',
        "project": '白天',
        "outCars": '0',
        "noPass": '0',
        "pass2": '0',
        "pass3": '0',
        "pass4": '0',
        "pass5": '0',
        "pass10": '0',
        "total": '0',
        "ratio": '0'
    };
    var rs1_2 = {
        "station": '中心医院',
        "project": '晚上',
        "outCars": '0',
        "noPass": '0',
        "pass2": '0',
        "pass3": '0',
        "pass4": '0',
        "pass5": '0',
        "pass10": '0',
        "total": '0',
        "ratio": '0'
    };
    var rs1_3 = {
        "station": '中心医院',
        "project": '合计',
        "outCars": '0',
        "noPass": '0',
        "pass2": '0',
        "pass3": '0',
        "pass4": '0',
        "pass5": '0',
        "pass10": '0',
        "total": '0',
        "ratio": '0'
    };

    var rs2_1 = {
        "station": '鄂钢医院',
        "project": '白天',
        "outCars": '0',
        "noPass": '0',
        "pass2": '0',
        "pass3": '0',
        "pass4": '0',
        "pass5": '0',
        "pass10": '0',
        "total": '0',
        "ratio": '0'
    };
    var rs2_2 = {
        "station": '鄂钢医院',
        "project": '晚上',
        "outCars": '0',
        "noPass": '0',
        "pass2": '0',
        "pass3": '0',
        "pass4": '0',
        "pass5": '0',
        "pass10": '0',
        "total": '0',
        "ratio": '0'
    };
    var rs2_3 = {
        "station": '鄂钢医院',
        "project": '合计',
        "outCars": '0',
        "noPass": '0',
        "pass2": '0',
        "pass3": '0',
        "pass4": '0',
        "pass5": '0',
        "pass10": '0',
        "total": '0',
        "ratio": '0'
    };
    var rs3_1 = {
        "station": '二医院',
        "project": '白天',
        "outCars": '0',
        "noPass": '0',
        "pass2": '0',
        "pass3": '0',
        "pass4": '0',
        "pass5": '0',
        "pass10": '0',
        "total": '0',
        "ratio": '0'
    };
    var rs3_2 = {
        "station": '二医院',
        "project": '晚上',
        "outCars": '0',
        "noPass": '0',
        "pass2": '0',
        "pass3": '0',
        "pass4": '0',
        "pass5": '0',
        "pass10": '0',
        "total": '0',
        "ratio": '0'
    };
    var rs3_3 = {
        "station": '二医院',
        "project": '合计',
        "outCars": '0',
        "noPass": '0',
        "pass2": '0',
        "pass3": '0',
        "pass4": '0',
        "pass5": '0',
        "pass10": '0',
        "total": '0',
        "ratio": '0'
    };
    var summary = {
        "project": '总计',
        "outCars": '0',
        "noPass": '0',
        "pass2": '0',
        "pass3": '0',
        "pass4": '0',
        "pass5": '0',
        "pass10": '0',
        "total": '0',
        "ratio": '0'
    };

    db.select(sqlData, function (err, results) {
        if (err) {
            console.log(results);
        } else {
            var result = []; //查询的结果
            for (var i = 0; i < results.length; i++) {
                if (string.isEquals('中心医院', results[i][0].value) && string.isEquals('白天', results[i][1].value)) {
                    rs1_1.outCars = results[i][2].value || 0;
                    rs1_1.noPass = results[i][3].value || 0;
                    rs1_1.pass2 = results[i][4].value || 0;
                    rs1_1.pass3 = results[i][5].value || 0;
                    rs1_1.pass4 = results[i][6].value || 0;
                    rs1_1.pass5 = results[i][7].value || 0;
                    rs1_1.pass10 = results[i][8].value || 0;
                    rs1_1.total = results[i][9].value || 0;
                    rs1_1.ratio = util.calculateRate(results[i][2].value, results[i][9].value);
                }
                if (string.isEquals('中心医院', results[i][0].value) && string.isEquals('晚上', results[i][1].value)) {
                    rs1_2.outCars = results[i][2].value || 0;
                    rs1_2.noPass = results[i][3].value || 0;
                    rs1_2.pass2 = results[i][4].value || 0;
                    rs1_2.pass3 = results[i][5].value || 0;
                    rs1_2.pass4 = results[i][6].value || 0;
                    rs1_2.pass5 = results[i][7].value || 0;
                    rs1_2.pass10 = results[i][8].value || 0;
                    rs1_2.total = results[i][9].value || 0;
                    rs1_2.ratio = util.calculateRate(results[i][2].value, results[i][9].value);
                }
                if (string.isEquals('鄂钢医院', results[i][0].value) && string.isEquals('白天', results[i][1].value)) {
                    rs2_1.outCars = results[i][2].value || 0;
                    rs2_1.noPass = results[i][3].value || 0;
                    rs2_1.pass2 = results[i][4].value || 0;
                    rs2_1.pass3 = results[i][5].value || 0;
                    rs2_1.pass4 = results[i][6].value || 0;
                    rs2_1.pass5 = results[i][7].value || 0;
                    rs2_1.pass10 = results[i][8].value || 0;
                    rs2_1.total = results[i][9].value || 0;
                    rs2_1.ratio = util.calculateRate(results[i][2].value, results[i][9].value);
                }
                if (string.isEquals('鄂钢医院', results[i][0].value) && string.isEquals('晚上', results[i][1].value)) {
                    rs2_2.outCars = results[i][2].value || 0;
                    rs2_2.noPass = results[i][3].value || 0;
                    rs2_2.pass2 = results[i][4].value || 0;
                    rs2_2.pass3 = results[i][5].value || 0;
                    rs2_2.pass4 = results[i][6].value || 0;
                    rs2_2.pass5 = results[i][7].value || 0;
                    rs2_2.pass10 = results[i][8].value || 0;
                    rs2_2.total = results[i][9].value || 0;
                    rs2_2.ratio = util.calculateRate(results[i][2].value, results[i][9].value);
                }
                if (string.isEquals('二医院', results[i][0].value) && string.isEquals('白天', results[i][1].value)) {
                    rs3_1.outCars = results[i][2].value || 0;
                    rs3_1.noPass = results[i][3].value || 0;
                    rs3_1.pass2 = results[i][4].value || 0;
                    rs3_1.pass3 = results[i][5].value || 0;
                    rs3_1.pass4 = results[i][6].value || 0;
                    rs3_1.pass5 = results[i][7].value || 0;
                    rs3_1.pass10 = results[i][8].value || 0;
                    rs3_1.total = results[i][9].value || 0;
                    rs3_1.ratio = util.calculateRate(results[i][2].value, results[i][9].value);
                }
                if (string.isEquals('二医院', results[i][0].value) && string.isEquals('晚上', results[i][1].value)) {
                    rs3_2.outCars = results[i][2].value || 0;
                    rs3_2.noPass = results[i][3].value || 0;
                    rs3_2.pass2 = results[i][4].value || 0;
                    rs3_2.pass3 = results[i][5].value || 0;
                    rs3_2.pass4 = results[i][6].value || 0;
                    rs3_2.pass5 = results[i][7].value || 0;
                    rs3_2.pass10 = results[i][8].value || 0;
                    rs3_2.total = results[i][9].value || 0;
                    rs3_2.ratio = util.calculateRate(results[i][2].value, results[i][9].value);
                }
            }

            //算中心医院合计
            rs1_3.outCars = parseInt(rs1_1.outCars) + parseInt(rs1_2.outCars);
            rs1_3.noPass = parseInt(rs1_1.noPass) + parseInt(rs1_2.noPass);
            rs1_3.pass2 = parseInt(rs1_1.pass2) + parseInt(rs1_2.pass2);
            rs1_3.pass3 = parseInt(rs1_1.pass3) + parseInt(rs1_2.pass3);
            rs1_3.pass4 = parseInt(rs1_1.pass4) + parseInt(rs1_2.pass4);
            rs1_3.pass5 = parseInt(rs1_1.pass5) + parseInt(rs1_2.pass5);
            rs1_3.pass10 = parseInt(rs1_1.pass10) + parseInt(rs1_2.pass10);
            rs1_3.total = parseInt(rs1_1.total) + parseInt(rs1_2.total);
            rs1_3.ratio = util.calculateRate(rs1_3.outCars, rs1_3.total);
            //算鄂钢医院合计
            rs2_3.outCars = parseInt(rs2_1.outCars) + parseInt(rs2_2.outCars);
            rs2_3.noPass = parseInt(rs2_1.noPass) + parseInt(rs2_2.noPass);
            rs2_3.pass2 = parseInt(rs2_1.pass2) + parseInt(rs2_2.pass2);
            rs2_3.pass3 = parseInt(rs2_1.pass3) + parseInt(rs2_2.pass3);
            rs2_3.pass4 = parseInt(rs2_1.pass4) + parseInt(rs2_2.pass4);
            rs2_3.pass5 = parseInt(rs2_1.pass5) + parseInt(rs2_2.pass5);
            rs2_3.pass10 = parseInt(rs2_1.pass10) + parseInt(rs2_2.pass10);
            rs2_3.total = parseInt(rs2_1.total) + parseInt(rs2_2.total);
            rs2_3.ratio = util.calculateRate(rs2_3.outCars, rs2_3.total);
            //算二医院医院合计
            rs3_3.outCars = parseInt(rs3_1.outCars) + parseInt(rs3_2.outCars);
            rs3_3.noPass = parseInt(rs3_1.noPass) + parseInt(rs3_2.noPass);
            rs3_3.pass2 = parseInt(rs3_1.pass2) + parseInt(rs3_2.pass2);
            rs3_3.pass3 = parseInt(rs3_1.pass3) + parseInt(rs3_2.pass3);
            rs3_3.pass4 = parseInt(rs3_1.pass4) + parseInt(rs3_2.pass4);
            rs3_3.pass5 = parseInt(rs3_1.pass5) + parseInt(rs3_2.pass5);
            rs3_3.pass10 = parseInt(rs3_1.pass10) + parseInt(rs3_2.pass10);
            rs3_3.total = parseInt(rs3_1.total) + parseInt(rs3_2.total);
            rs3_3.ratio = util.calculateRate(rs3_3.outCars, rs3_3.total);
            //算总计
            summary.outCars = parseInt(rs1_3.outCars) + parseInt(rs2_3.outCars) + parseInt(rs3_3.outCars);
            summary.noPass = parseInt(rs1_3.noPass) + parseInt(rs2_3.noPass) + parseInt(rs3_3.noPass);
            summary.pass2 = parseInt(rs1_3.pass2) + parseInt(rs2_3.pass2) + parseInt(rs3_3.pass2);
            summary.pass3 = parseInt(rs1_3.pass3) + parseInt(rs2_3.pass3) + parseInt(rs3_3.pass3);
            summary.pass4 = parseInt(rs1_3.pass4) + parseInt(rs2_3.pass4) + parseInt(rs3_3.pass4);
            summary.pass5 = parseInt(rs1_3.pass5) + parseInt(rs2_3.pass5) + parseInt(rs3_3.pass5);
            summary.pass10 = parseInt(rs1_3.pass10) + parseInt(rs2_3.pass10) + parseInt(rs3_3.pass10);
            summary.total = parseInt(rs1_3.total) + parseInt(rs2_3.total) + parseInt(rs3_3.total);
            summary.ratio = util.calculateRate(summary.outCars, summary.total);

            result.push(rs1_1);
            result.push(rs1_2);
            result.push(rs1_3);
            result.push(rs2_1);
            result.push(rs2_2);
            result.push(rs2_3);
            result.push(rs3_1);
            result.push(rs3_2);
            result.push(rs3_3);
            result.push(summary);

            res.json({"result": result});
        }
    });
};

/**
 * 中心医院四分站月季年
 * @param req
 * @param res
 */
exports.getCenterFourStationOutCar = function (req, res) {
    var startTime = req.body.startTime;
    var endTime = req.body.endTime;
    var params = [{"name": "startTime", "value": startTime, "type": "varchar"}, {
        "name": "endTime", "value": endTime, "type": "varchar"
    }];
    var sql = "select t.受理序号,t.出车时刻,t.事件编码,t.结果编码,t.分站编码,case when CONVERT(varchar(20),t.生成任务时刻,108) between '06:30:00' and '21:30:00' then '白天'    " +
        "when CONVERT(varchar(20),t.生成任务时刻,108) not between '06:30:00' and '21:30:00' then '晚上' end 时间,case when t.分站编码='001' then '中心站' " +
        "when t.分站编码='004' then '华容站'    when  t.分站编码='005' then '太和站' when t.分站编码='006' then '高速站' end 分站  into #task    " +
        "from ausp120.tb_TaskV t where t.分站编码 in ('001','004','005','006')   " +
        "select t.分站,t.时间,COUNT(*) 出车次数,SUM(case when DATEDIFF(S,a.派车时刻,t.出车时刻)<120 then 1 else 0 end) 未超时,        " +
        "SUM(case when DATEDIFF(S,a.派车时刻,t.出车时刻)<180 and DATEDIFF(S,a.派车时刻,t.出车时刻)>=120 then 1 else 0 end) 超2,        " +
        "SUM(case when DATEDIFF(S,a.派车时刻,t.出车时刻)<240 and DATEDIFF(S,a.派车时刻,t.出车时刻)>=180 then 1 else 0 end) 超3,        " +
        "SUM(case when DATEDIFF(S,a.派车时刻,t.出车时刻)<300 and DATEDIFF(S,a.派车时刻,t.出车时刻)>=240 then 1 else 0 end) 超4,        " +
        "SUM(case when DATEDIFF(S,a.派车时刻,t.出车时刻)<600 and DATEDIFF(S,a.派车时刻,t.出车时刻)>=300 then 1 else 0 end) 超5,        " +
        "SUM(case when  DATEDIFF(S,a.派车时刻,t.出车时刻)>=600 then 1 else 0 end) 超10,        " +
        "SUM(case when  DATEDIFF(S,a.派车时刻,t.出车时刻)>=120 then 1 else 0 end) 合计,'0' 比例    " +
        "from ausp120.tb_EventV e left outer join ausp120.tb_AcceptDescriptv a on a.事件编码=e.事件编码    " +
        "left outer join #task t on a.受理序号=t.受理序号 and a.事件编码=t.事件编码    " +
        "where e.事件性质编码=1 and a.类型编码 not in (2,4) and t.出车时刻 is not null and a.开始受理时刻 between  @startTime and @endTime   group by t.时间,t.分站     drop table #task ";
    var sqlData = {
        statement: sql,
        params: params
    };

    var rs1_1 = {
        "station": '中心站',
        "project": '白天',
        "outCars": '0',
        "noPass": '0',
        "pass2": '0',
        "pass3": '0',
        "pass4": '0',
        "pass5": '0',
        "pass10": '0',
        "total": '0',
        "ratio": '0'
    };
    var rs1_2 = {
        "station": '中心站',
        "project": '晚上',
        "outCars": '0',
        "noPass": '0',
        "pass2": '0',
        "pass3": '0',
        "pass4": '0',
        "pass5": '0',
        "pass10": '0',
        "total": '0',
        "ratio": '0'
    };
    var rs1_3 = {
        "station": '中心站',
        "project": '合计',
        "outCars": '0',
        "noPass": '0',
        "pass2": '0',
        "pass3": '0',
        "pass4": '0',
        "pass5": '0',
        "pass10": '0',
        "total": '0',
        "ratio": '0'
    };

    var rs2_1 = {
        "station": '华容站',
        "project": '白天',
        "outCars": '0',
        "noPass": '0',
        "pass2": '0',
        "pass3": '0',
        "pass4": '0',
        "pass5": '0',
        "pass10": '0',
        "total": '0',
        "ratio": '0'
    };
    var rs2_2 = {
        "station": '华容站',
        "project": '晚上',
        "outCars": '0',
        "noPass": '0',
        "pass2": '0',
        "pass3": '0',
        "pass4": '0',
        "pass5": '0',
        "pass10": '0',
        "total": '0',
        "ratio": '0'
    };
    var rs2_3 = {
        "station": '华容站',
        "project": '合计',
        "outCars": '0',
        "noPass": '0',
        "pass2": '0',
        "pass3": '0',
        "pass4": '0',
        "pass5": '0',
        "pass10": '0',
        "total": '0',
        "ratio": '0'
    };
    var rs3_1 = {
        "station": '太和站',
        "project": '白天',
        "outCars": '0',
        "noPass": '0',
        "pass2": '0',
        "pass3": '0',
        "pass4": '0',
        "pass5": '0',
        "pass10": '0',
        "total": '0',
        "ratio": '0'
    };
    var rs3_2 = {
        "station": '太和站',
        "project": '晚上',
        "outCars": '0',
        "noPass": '0',
        "pass2": '0',
        "pass3": '0',
        "pass4": '0',
        "pass5": '0',
        "pass10": '0',
        "total": '0',
        "ratio": '0'
    };
    var rs3_3 = {
        "station": '太和站',
        "project": '合计',
        "outCars": '0',
        "noPass": '0',
        "pass2": '0',
        "pass3": '0',
        "pass4": '0',
        "pass5": '0',
        "pass10": '0',
        "total": '0',
        "ratio": '0'
    };
    var rs4_1 = {
        "station": '高速站',
        "project": '白天',
        "outCars": '0',
        "noPass": '0',
        "pass2": '0',
        "pass3": '0',
        "pass4": '0',
        "pass5": '0',
        "pass10": '0',
        "total": '0',
        "ratio": '0'
    };
    var rs4_2 = {
        "station": '高速站',
        "project": '晚上',
        "outCars": '0',
        "noPass": '0',
        "pass2": '0',
        "pass3": '0',
        "pass4": '0',
        "pass5": '0',
        "pass10": '0',
        "total": '0',
        "ratio": '0'
    };
    var rs4_3 = {
        "station": '高速站',
        "project": '合计',
        "outCars": '0',
        "noPass": '0',
        "pass2": '0',
        "pass3": '0',
        "pass4": '0',
        "pass5": '0',
        "pass10": '0',
        "total": '0',
        "ratio": '0'
    };
    var summary = {
        "project": '总计',
        "outCars": '0',
        "noPass": '0',
        "pass2": '0',
        "pass3": '0',
        "pass4": '0',
        "pass5": '0',
        "pass10": '0',
        "total": '0',
        "ratio": '0'
    };

    db.select(sqlData, function (err, results) {
        if (err) {
            console.log(results);
        } else {
            var result = []; //查询的结果
            for (var i = 0; i < results.length; i++) {
                if (string.isEquals('中心站', results[i][0].value) && string.isEquals('白天', results[i][1].value)) {
                    rs1_1.outCars = results[i][2].value || 0;
                    rs1_1.noPass = results[i][3].value || 0;
                    rs1_1.pass2 = results[i][4].value || 0;
                    rs1_1.pass3 = results[i][5].value || 0;
                    rs1_1.pass4 = results[i][6].value || 0;
                    rs1_1.pass5 = results[i][7].value || 0;
                    rs1_1.pass10 = results[i][8].value || 0;
                    rs1_1.total = results[i][9].value || 0;
                    rs1_1.ratio = util.calculateRate(results[i][2].value, results[i][9].value);
                }
                if (string.isEquals('中心站', results[i][0].value) && string.isEquals('晚上', results[i][1].value)) {
                    rs1_2.outCars = results[i][2].value || 0;
                    rs1_2.noPass = results[i][3].value || 0;
                    rs1_2.pass2 = results[i][4].value || 0;
                    rs1_2.pass3 = results[i][5].value || 0;
                    rs1_2.pass4 = results[i][6].value || 0;
                    rs1_2.pass5 = results[i][7].value || 0;
                    rs1_2.pass10 = results[i][8].value || 0;
                    rs1_2.total = results[i][9].value || 0;
                    rs1_2.ratio = util.calculateRate(results[i][2].value, results[i][9].value);
                }
                if (string.isEquals('华容站', results[i][0].value) && string.isEquals('白天', results[i][1].value)) {
                    rs2_1.outCars = results[i][2].value || 0;
                    rs2_1.noPass = results[i][3].value || 0;
                    rs2_1.pass2 = results[i][4].value || 0;
                    rs2_1.pass3 = results[i][5].value || 0;
                    rs2_1.pass4 = results[i][6].value || 0;
                    rs2_1.pass5 = results[i][7].value || 0;
                    rs2_1.pass10 = results[i][8].value || 0;
                    rs2_1.total = results[i][9].value || 0;
                    rs2_1.ratio = util.calculateRate(results[i][2].value, results[i][9].value);
                }
                if (string.isEquals('华容站', results[i][0].value) && string.isEquals('晚上', results[i][1].value)) {
                    rs2_2.outCars = results[i][2].value || 0;
                    rs2_2.noPass = results[i][3].value || 0;
                    rs2_2.pass2 = results[i][4].value || 0;
                    rs2_2.pass3 = results[i][5].value || 0;
                    rs2_2.pass4 = results[i][6].value || 0;
                    rs2_2.pass5 = results[i][7].value || 0;
                    rs2_2.pass10 = results[i][8].value || 0;
                    rs2_2.total = results[i][9].value || 0;
                    rs2_2.ratio = util.calculateRate(results[i][2].value, results[i][9].value);
                }
                if (string.isEquals('太和站', results[i][0].value) && string.isEquals('白天', results[i][1].value)) {
                    rs3_1.outCars = results[i][2].value || 0;
                    rs3_1.noPass = results[i][3].value || 0;
                    rs3_1.pass2 = results[i][4].value || 0;
                    rs3_1.pass3 = results[i][5].value || 0;
                    rs3_1.pass4 = results[i][6].value || 0;
                    rs3_1.pass5 = results[i][7].value || 0;
                    rs3_1.pass10 = results[i][8].value || 0;
                    rs3_1.total = results[i][9].value || 0;
                    rs3_1.ratio = util.calculateRate(results[i][2].value, results[i][9].value);
                }
                if (string.isEquals('太和站', results[i][0].value) && string.isEquals('晚上', results[i][1].value)) {
                    rs3_2.outCars = results[i][2].value || 0;
                    rs3_2.noPass = results[i][3].value || 0;
                    rs3_2.pass2 = results[i][4].value || 0;
                    rs3_2.pass3 = results[i][5].value || 0;
                    rs3_2.pass4 = results[i][6].value || 0;
                    rs3_2.pass5 = results[i][7].value || 0;
                    rs3_2.pass10 = results[i][8].value || 0;
                    rs3_2.total = results[i][9].value || 0;
                    rs3_2.ratio = util.calculateRate(results[i][2].value, results[i][9].value);
                }
                if (string.isEquals('高速站', results[i][0].value) && string.isEquals('白天', results[i][1].value)) {
                    rs4_1.outCars = results[i][2].value || 0;
                    rs4_1.noPass = results[i][3].value || 0;
                    rs4_1.pass2 = results[i][4].value || 0;
                    rs4_1.pass3 = results[i][5].value || 0;
                    rs4_1.pass4 = results[i][6].value || 0;
                    rs4_1.pass5 = results[i][7].value || 0;
                    rs4_1.pass10 = results[i][8].value || 0;
                    rs4_1.total = results[i][9].value || 0;
                    rs4_1.ratio = util.calculateRate(results[i][2].value, results[i][9].value);
                }
                if (string.isEquals('高速站', results[i][0].value) && string.isEquals('晚上', results[i][1].value)) {
                    rs4_2.outCars = results[i][2].value || 0;
                    rs4_2.noPass = results[i][3].value || 0;
                    rs4_2.pass2 = results[i][4].value || 0;
                    rs4_2.pass3 = results[i][5].value || 0;
                    rs4_2.pass4 = results[i][6].value || 0;
                    rs4_2.pass5 = results[i][7].value || 0;
                    rs4_2.pass10 = results[i][8].value || 0;
                    rs4_2.total = results[i][9].value || 0;
                    rs4_2.ratio = util.calculateRate(results[i][2].value, results[i][9].value);
                }
            }

            //算中心站合计
            rs1_3.outCars = parseInt(rs1_1.outCars) + parseInt(rs1_2.outCars);
            rs1_3.noPass = parseInt(rs1_1.noPass) + parseInt(rs1_2.noPass);
            rs1_3.pass2 = parseInt(rs1_1.pass2) + parseInt(rs1_2.pass2);
            rs1_3.pass3 = parseInt(rs1_1.pass3) + parseInt(rs1_2.pass3);
            rs1_3.pass4 = parseInt(rs1_1.pass4) + parseInt(rs1_2.pass4);
            rs1_3.pass5 = parseInt(rs1_1.pass5) + parseInt(rs1_2.pass5);
            rs1_3.pass10 = parseInt(rs1_1.pass10) + parseInt(rs1_2.pass10);
            rs1_3.total = parseInt(rs1_1.total) + parseInt(rs1_2.total);
            rs1_3.ratio = util.calculateRate(rs1_3.outCars, rs1_3.total);
            //算华容站合计
            rs2_3.outCars = parseInt(rs2_1.outCars) + parseInt(rs2_2.outCars);
            rs2_3.noPass = parseInt(rs2_1.noPass) + parseInt(rs2_2.noPass);
            rs2_3.pass2 = parseInt(rs2_1.pass2) + parseInt(rs2_2.pass2);
            rs2_3.pass3 = parseInt(rs2_1.pass3) + parseInt(rs2_2.pass3);
            rs2_3.pass4 = parseInt(rs2_1.pass4) + parseInt(rs2_2.pass4);
            rs2_3.pass5 = parseInt(rs2_1.pass5) + parseInt(rs2_2.pass5);
            rs2_3.pass10 = parseInt(rs2_1.pass10) + parseInt(rs2_2.pass10);
            rs2_3.total = parseInt(rs2_1.total) + parseInt(rs2_2.total);
            rs2_3.ratio = util.calculateRate(rs2_3.outCars, rs2_3.total);
            //算太和站合计
            rs3_3.outCars = parseInt(rs3_1.outCars) + parseInt(rs3_2.outCars);
            rs3_3.noPass = parseInt(rs3_1.noPass) + parseInt(rs3_2.noPass);
            rs3_3.pass2 = parseInt(rs3_1.pass2) + parseInt(rs3_2.pass2);
            rs3_3.pass3 = parseInt(rs3_1.pass3) + parseInt(rs3_2.pass3);
            rs3_3.pass4 = parseInt(rs3_1.pass4) + parseInt(rs3_2.pass4);
            rs3_3.pass5 = parseInt(rs3_1.pass5) + parseInt(rs3_2.pass5);
            rs3_3.pass10 = parseInt(rs3_1.pass10) + parseInt(rs3_2.pass10);
            rs3_3.total = parseInt(rs3_1.total) + parseInt(rs3_2.total);
            rs3_3.ratio = util.calculateRate(rs3_3.outCars, rs3_3.total);
            //算高速站合计
            rs4_3.outCars = parseInt(rs4_1.outCars) + parseInt(rs4_2.outCars);
            rs4_3.noPass = parseInt(rs4_1.noPass) + parseInt(rs4_2.noPass);
            rs4_3.pass2 = parseInt(rs4_1.pass2) + parseInt(rs4_2.pass2);
            rs4_3.pass3 = parseInt(rs4_1.pass3) + parseInt(rs4_2.pass3);
            rs4_3.pass4 = parseInt(rs4_1.pass4) + parseInt(rs4_2.pass4);
            rs4_3.pass5 = parseInt(rs4_1.pass5) + parseInt(rs4_2.pass5);
            rs4_3.pass10 = parseInt(rs4_1.pass10) + parseInt(rs4_2.pass10);
            rs4_3.total = parseInt(rs4_1.total) + parseInt(rs4_2.total);
            rs4_3.ratio = util.calculateRate(rs4_3.outCars, rs4_3.total);
            //算总计
            summary.outCars = parseInt(rs1_3.outCars) + parseInt(rs2_3.outCars) + parseInt(rs3_3.outCars) + parseInt(rs4_3.outCars);
            summary.noPass = parseInt(rs1_3.noPass) + parseInt(rs2_3.noPass) + parseInt(rs3_3.noPass) + parseInt(rs4_3.noPass);
            summary.pass2 = parseInt(rs1_3.pass2) + parseInt(rs2_3.pass2) + parseInt(rs3_3.pass2) + parseInt(rs4_3.pass2);
            summary.pass3 = parseInt(rs1_3.pass3) + parseInt(rs2_3.pass3) + parseInt(rs3_3.pass3) + parseInt(rs4_3.pass3);
            summary.pass4 = parseInt(rs1_3.pass4) + parseInt(rs2_3.pass4) + parseInt(rs3_3.pass4) + parseInt(rs4_3.pass4);
            summary.pass5 = parseInt(rs1_3.pass5) + parseInt(rs2_3.pass5) + parseInt(rs3_3.pass5) + parseInt(rs4_3.pass5);
            summary.pass10 = parseInt(rs1_3.pass10) + parseInt(rs2_3.pass10) + parseInt(rs3_3.pass10) + parseInt(rs4_3.pass10);
            summary.total = parseInt(rs1_3.total) + parseInt(rs2_3.total) + parseInt(rs3_3.total) + parseInt(rs4_3.total);
            summary.ratio = util.calculateRate(summary.outCars, summary.total);

            result.push(rs4_1);
            result.push(rs4_2);
            result.push(rs4_3);
            result.push(rs1_1);
            result.push(rs1_2);
            result.push(rs1_3);
            result.push(rs2_1);
            result.push(rs2_2);
            result.push(rs2_3);
            result.push(rs3_1);
            result.push(rs3_2);
            result.push(rs3_3);
            result.push(summary);

            res.json({"result": result});
        }
    });
};

/**
 * 网内转送月季年
 * @param req
 * @param res
 */
exports.getStationTransfer = function (req, res) {
    var startTime = req.body.startTime;
    var endTime = req.body.endTime;
    var params = [{"name": "startTime", "value": startTime, "type": "varchar"}, {
        "name": "endTime", "value": endTime, "type": "varchar"
    }];
    var sql = "select t.结果编码,t.受理序号,t.事件编码,t.人数,case when t.分站编码 in ('001','004','005','006') then '一医'    " +
        "when t.分站编码='002' then '二医' when t.分站编码='003' then '鄂钢' end 分站,    case when t.送往地点 in ('华容医院','太和医院','高速站','中心医院') then '一医'    " +
        "when t.送往地点='二医院' then '二医' when t.送往地点='鄂钢医院' then '鄂钢' end 送往地点 into #task from ausp120.tb_TaskV t    " +
        "where t.出车时刻 is not null and t.送往地点 in ('中心医院','二医院','鄂钢医院','华容医院','太和医院','高速站')    " +
        "select t.分站,t.送往地点,COUNT(*) 出车次数,SUM(case when t.结果编码=4 then t.人数 else 0 end) 人数    " +
        "from ausp120.tb_EventV e left outer join ausp120.tb_AcceptDescriptv a on a.事件编码=e.事件编码    " +
        "left outer join #task t on a.受理序号=t.受理序号 and a.事件编码=t.事件编码    " +
        "where e.事件性质编码=1 and a.类型编码 not in (2,4)  and t.分站<>t.送往地点    and a.开始受理时刻 between @startTime and @endTime    " +
        "group by t.分站,t.送往地点    order by t.分站,t.送往地点    drop table #task ";
    var sqlData = {
        statement: sql,
        params: params
    };

    db.select(sqlData, function (err, results) {
        if (err) {
            console.log(results);
        } else {
            var result = []; //查询的结果
            for (var i = 0; i < results.length; i++) {
                result.push({
                    "project": results[i][0].value,
                    "outCars": results[i][1].value || 0,
                    "persons": results[i][2].value || 0
                });
            }


            res.json({"result": result});
        }
    });
};

/**
 * 未按辖区流水表
 * @param req
 * @param res
 */
exports.getNoAreaFlow = function (req, res) {
    var startTime = req.body.startTime;
    var endTime = req.body.endTime;
    var params = [{"name": "startTime", "value": startTime, "type": "varchar"}, {
        "name": "endTime", "value": endTime, "type": "varchar"
    }];
    var sql = "select CONVERT(varchar(20),a.开始受理时刻,120),a.现场地址,a.备注,m.姓名,a.备注    " +
        "from ausp120.tb_EventV e left outer join ausp120.tb_AcceptDescriptv a on a.事件编码=e.事件编码    " +
        "left outer join ausp120.tb_TaskV t on a.受理序号=t.受理序号 and a.事件编码=t.事件编码    left outer join ausp120.tb_MrUser m on m.工号=t.调度员编码    " +
        "where e.事件性质编码=1 and a.类型编码 not in (2,4) and a.备注 like '%按%派%。%'    and a.开始受理时刻  between @startTime and @endTime    ";
    var sqlData = {
        statement: sql,
        params: params
    };

    db.select(sqlData, function (err, results) {
        if (err) {
            console.log(results);
        } else {
            var result = []; //查询的结果
            for (var i = 0; i < results.length; i++) {
                var remark = results[i][2].value.substr(0, results[i][2].value.indexOf('。'));
                var station = remark.split('按')[0];
                var sendAddr = remark.split('按')[1].split('派')[1];
                var judge = remark.split('按')[1].split('派')[0];
                var patientAsk = string.isEquals('病人意愿', judge) ? '是' : '否';
                var noCar = string.isEquals('辖区无车', judge) ? '是' : '否';
                var patientIll = string.isEquals('病情考虑', judge) ? '是' : '否';
                var reinforce = string.isEquals('增援派车', judge) ? '是' : '否';
                var other = string.isEquals('其他', judge) ? '是' : '否';
                result.push({
                    "datetime": results[i][0].value,
                    "localAddr": results[i][1].value,
                    "station": station,
                    "sendAddr": sendAddr,
                    "patientAsk": patientAsk,
                    "noCar": noCar,
                    "patientIll": patientIll,
                    "reinforce": reinforce,
                    "other": other,
                    "dispatcher": results[i][3].value,
                    "remark": results[i][4].value
                });
            }
            res.json(result);
        }
    });
};

/**
 * 未按辖区月季年
 * @param req
 * @param res
 */
exports.getNoAreaStatistics = function (req, res) {
    var startTime = req.body.startTime;
    var endTime = req.body.endTime;
    var params = [{"name": "startTime", "value": startTime, "type": "varchar"}, {
        "name": "endTime", "value": endTime, "type": "varchar"
    }];
    var sql = "select CONVERT(varchar(20),a.开始受理时刻,120),a.现场地址,a.备注,m.姓名,a.备注    " +
        "from ausp120.tb_EventV e left outer join ausp120.tb_AcceptDescriptv a on a.事件编码=e.事件编码    " +
        "left outer join ausp120.tb_TaskV t on a.受理序号=t.受理序号 and a.事件编码=t.事件编码    left outer join ausp120.tb_MrUser m on m.工号=t.调度员编码    " +
        "where e.事件性质编码=1 and a.类型编码 not in (2,4) and a.备注 like '%按%派%。%'    and a.开始受理时刻  between @startTime and @endTime    ";
    var sqlData = {
        statement: sql,
        params: params
    };
    var rs1 = {
        "project": '一医派二医',
        "patientAsk": '0',
        "noCar": '0',
        "patientIll": '0',
        "reinforce": '0',
        "total": '0'
    };
    var rs2 = {
        "project": '一医派鄂钢',
        "patientAsk": '0',
        "noCar": '0',
        "patientIll": '0',
        "reinforce": '0',
        "total": '0'
    };
    var rs3 = {
        "project": '二医派一医',
        "patientAsk": '0',
        "noCar": '0',
        "patientIll": '0',
        "reinforce": '0',
        "total": '0'
    };
    var rs4 = {
        "project": '二医派鄂钢',
        "patientAsk": '0',
        "noCar": '0',
        "patientIll": '0',
        "reinforce": '0',
        "total": '0'
    };
    var rs5 = {
        "project": '鄂钢派一医',
        "patientAsk": '0',
        "noCar": '0',
        "patientIll": '0',
        "reinforce": '0',
        "total": '0'
    };
    var rs6 = {
        "project": '鄂钢派二医',
        "patientAsk": '0',
        "noCar": '0',
        "patientIll": '0',
        "reinforce": '0',
        "total": '0'
    };

    db.select(sqlData, function (err, results) {
        if (err) {
            console.log(results);
        } else {
            var result = []; //查询的结果
            for (var i = 0; i < results.length; i++) {
                var remark = results[i][2].value.substr(0, results[i][2].value.indexOf('。'));
                var station = remark.split('按')[0];
                var sendAddr = remark.split('按')[1].split('派')[1];
                var judge = remark.split('按')[1].split('派')[0];
                var patientAsk = string.isEquals('病人意愿', judge) ? '是' : '否';
                var noCar = string.isEquals('辖区无车', judge) ? '是' : '否';
                var patientIll = string.isEquals('病情考虑', judge) ? '是' : '否';
                var reinforce = string.isEquals('增援派车', judge) ? '是' : '否';
                var other = string.isEquals('其他', judge) ? '是' : '否';

                if (station.indexOf('一医') != -1 && sendAddr.indexOf('二医') != -1) { //一医派二医
                    if (string.isEquals('是', patientAsk)) {
                        rs1.patientAsk = parseInt(rs1.patientAsk) + 1;
                    }
                    if (string.isEquals('是', noCar)) {
                        rs1.noCar = parseInt(rs1.noCar) + 1;
                    }
                    if (string.isEquals('是', patientIll)) {
                        rs1.patientIll = parseInt(rs1.patientIll) + 1;
                    }
                    if (string.isEquals('是', reinforce)) {
                        rs1.reinforce = parseInt(rs1.reinforce) + 1;
                    }
                }

                if (station.indexOf('一医') != -1 && sendAddr.indexOf('鄂钢') != -1) { //一医派鄂钢
                    if (string.isEquals('是', patientAsk)) {
                        rs2.patientAsk = parseInt(rs2.patientAsk) + 1;
                    }
                    if (string.isEquals('是', noCar)) {
                        rs2.noCar = parseInt(rs2.noCar) + 1;
                    }
                    if (string.isEquals('是', patientIll)) {
                        rs2.patientIll = parseInt(rs2.patientIll) + 1;
                    }
                    if (string.isEquals('是', reinforce)) {
                        rs2.reinforce = parseInt(rs2.reinforce) + 1;
                    }
                }
                if (station.indexOf('二医') != -1 && sendAddr.indexOf('一医') != -1) { //二医派一医
                    if (string.isEquals('是', patientAsk)) {
                        rs3.patientAsk = parseInt(rs3.patientAsk) + 1;
                    }
                    if (string.isEquals('是', noCar)) {
                        rs3.noCar = parseInt(rs3.noCar) + 1;
                    }
                    if (string.isEquals('是', patientIll)) {
                        rs3.patientIll = parseInt(rs3.patientIll) + 1;
                    }
                    if (string.isEquals('是', reinforce)) {
                        rs3.reinforce = parseInt(rs3.reinforce) + 1;
                    }
                }
                if (station.indexOf('二医') != -1 && sendAddr.indexOf('鄂钢') != -1) { //二医派鄂钢
                    if (string.isEquals('是', patientAsk)) {
                        rs4.patientAsk = parseInt(rs4.patientAsk) + 1;
                    }
                    if (string.isEquals('是', noCar)) {
                        rs4.noCar = parseInt(rs4.noCar) + 1;
                    }
                    if (string.isEquals('是', patientIll)) {
                        rs4.patientIll = parseInt(rs4.patientIll) + 1;
                    }
                    if (string.isEquals('是', reinforce)) {
                        rs4.reinforce = parseInt(rs4.reinforce) + 1;
                    }
                }
                if (station.indexOf('鄂钢') != -1 && sendAddr.indexOf('一医') != -1) { //鄂钢派一医
                    if (string.isEquals('是', patientAsk)) {
                        rs5.patientAsk = parseInt(rs5.patientAsk) + 1;
                    }
                    if (string.isEquals('是', noCar)) {
                        rs5.noCar = parseInt(rs5.noCar) + 1;
                    }
                    if (string.isEquals('是', patientIll)) {
                        rs5.patientIll = parseInt(rs5.patientIll) + 1;
                    }
                    if (string.isEquals('是', reinforce)) {
                        rs5.reinforce = parseInt(rs5.reinforce) + 1;
                    }
                }
                if (station.indexOf('鄂钢') != -1 && sendAddr.indexOf('二医') != -1) { //鄂钢派二医
                    if (string.isEquals('是', patientAsk)) {
                        rs6.patientAsk = parseInt(rs6.patientAsk) + 1;
                    }
                    if (string.isEquals('是', noCar)) {
                        rs6.noCar = parseInt(rs6.noCar) + 1;
                    }
                    if (string.isEquals('是', patientIll)) {
                        rs6.patientIll = parseInt(rs6.patientIll) + 1;
                    }
                    if (string.isEquals('是', reinforce)) {
                        rs6.reinforce = parseInt(rs6.reinforce) + 1;
                    }
                }
            }
            //算合计
            rs1.total = parseInt(rs1.noCar) + parseInt(rs1.patientAsk) + parseInt(rs1.patientIll) + parseInt(rs1.reinforce);
            rs2.total = parseInt(rs2.noCar) + parseInt(rs2.patientAsk) + parseInt(rs2.patientIll) + parseInt(rs2.reinforce);
            rs3.total = parseInt(rs3.noCar) + parseInt(rs3.patientAsk) + parseInt(rs3.patientIll) + parseInt(rs3.reinforce);
            rs4.total = parseInt(rs4.noCar) + parseInt(rs4.patientAsk) + parseInt(rs4.patientIll) + parseInt(rs4.reinforce);
            rs5.total = parseInt(rs5.noCar) + parseInt(rs5.patientAsk) + parseInt(rs5.patientIll) + parseInt(rs5.reinforce);
            rs6.total = parseInt(rs6.noCar) + parseInt(rs6.patientAsk) + parseInt(rs6.patientIll) + parseInt(rs6.reinforce);

            result.push(rs1);
            result.push(rs2);
            result.push(rs3);
            result.push(rs4);
            result.push(rs5);
            result.push(rs6);
            res.json(result);
        }
    });
};

/**
 * 未按辖区流水表
 * @param req
 * @param res
 */
exports.getTwentyFourAccept = function (req, res) {
    var startTime = req.body.startTime;
    var endTime = req.body.endTime;
    var params = [{"name": "startTime", "value": startTime, "type": "varchar"}, {
        "name": "endTime", "value": endTime, "type": "varchar"
    }];
    var sql = "select count(*) total,SUM(case when DATEPART(HH,tr.振铃时刻)=0 then 1 else 0 end) '0-1',    " +
        "SUM(case when DATEPART(HH,tr.振铃时刻)=1 then 1 else 0 end) '1-2',        SUM(case when DATEPART(HH,tr.振铃时刻)=2 then 1 else 0 end) '2-3',        " +
        "SUM(case when DATEPART(HH,tr.振铃时刻)=3 then 1 else 0 end) '3-4',        SUM(case when DATEPART(HH,tr.振铃时刻)=4 then 1 else 0 end) '4-5',       " +
        "SUM(case when DATEPART(HH,tr.振铃时刻)=5 then 1 else 0 end) '5-6',        SUM(case when DATEPART(HH,tr.振铃时刻)=6 then 1 else 0 end) '6-7',        " +
        "SUM(case when DATEPART(HH,tr.振铃时刻)=7 then 1 else 0 end) '7-8',        SUM(case when DATEPART(HH,tr.振铃时刻)=8 then 1 else 0 end) '8-9',        " +
        "SUM(case when DATEPART(HH,tr.振铃时刻)=9 then 1 else 0 end) '9-10',        SUM(case when DATEPART(HH,tr.振铃时刻)=10 then 1 else 0 end) '10-11',        " +
        "SUM(case when DATEPART(HH,tr.振铃时刻)=11 then 1 else 0 end) '11-12',        SUM(case when DATEPART(HH,tr.振铃时刻)=12 then 1 else 0 end) '12-13',        " +
        "SUM(case when DATEPART(HH,tr.振铃时刻)=13 then 1 else 0 end) '13-14',        SUM(case when DATEPART(HH,tr.振铃时刻)=14 then 1 else 0 end) '14-15',        " +
        "SUM(case when DATEPART(HH,tr.振铃时刻)=15 then 1 else 0 end) '15-16',        SUM(case when DATEPART(HH,tr.振铃时刻)=16 then 1 else 0 end) '16-17',        " +
        "SUM(case when DATEPART(HH,tr.振铃时刻)=17 then 1 else 0 end) '17-18',        SUM(case when DATEPART(HH,tr.振铃时刻)=18 then 1 else 0 end) '18-19',        " +
        "SUM(case when DATEPART(HH,tr.振铃时刻)=19 then 1 else 0 end) '19-20',        SUM(case when DATEPART(HH,tr.振铃时刻)=20 then 1 else 0 end) '20-21',        " +
        "SUM(case when DATEPART(HH,tr.振铃时刻)=21 then 1 else 0 end) '21-22',        SUM(case when DATEPART(HH,tr.振铃时刻)=22 then 1 else 0 end) '22-23',        " +
        "SUM(case when DATEPART(HH,tr.振铃时刻)=23 then 1 else 0 end) '23-24'    " +
        "from ausp120.tb_TeleRecordV tr where tr.记录类型编码 in (1,2,3,5,8) and tr.振铃时刻 is not null and tr.振铃时刻  between @startTime and @endTime    ";
    var sqlData = {
        statement: sql,
        params: params
    };

    db.select(sqlData, function (err, results) {
        if (err) {
            console.log(results);
        } else {
            var result = []; //查询的结果
            for (var i = 0; i < results.length; i++) {
                result.push({
                    "total": results[i][0].value || 0,
                    "time1": results[i][1].value || 0,
                    "time2": results[i][2].value || 0,
                    "time3": results[i][3].value || 0,
                    "time4": results[i][4].value || 0,
                    "time5": results[i][5].value || 0,
                    "time6": results[i][6].value || 0,
                    "time7": results[i][7].value || 0,
                    "time8": results[i][8].value || 0,
                    "time9": results[i][9].value || 0,
                    "time10": results[i][10].value || 0,
                    "time11": results[i][11].value || 0,
                    "time12": results[i][12].value || 0,
                    "time13": results[i][13].value || 0,
                    "time14": results[i][14].value || 0,
                    "time15": results[i][15].value || 0,
                    "time16": results[i][16].value || 0,
                    "time17": results[i][17].value || 0,
                    "time18": results[i][18].value || 0,
                    "time19": results[i][19].value || 0,
                    "time20": results[i][20].value || 0,
                    "time21": results[i][21].value || 0,
                    "time22": results[i][22].value || 0,
                    "time23": results[i][23].value || 0,
                    "time24": results[i][24].value || 0
                });
            }
            res.json(result);
        }
    });
};

/**
 * 电话判断疾病分类表
 * @param req
 * @param res
 */
exports.getPhoneJudgeDiseaseClass = function (req, res) {
    var startTime = req.body.startTime;
    var endTime = req.body.endTime;
    var params = [{"name": "startTime", "value": startTime, "type": "varchar"}, {
        "name": "endTime", "value": endTime, "type": "varchar"
    }];
    var sql = "select a.事件编码,a.受理序号,a.开始受理时刻,case when a.初步判断 like '%外伤1%' then '车祸外伤'     " +
        "when (a.初步判断 like '%外伤%' or a.初步判断 like '%骨折%' or a.初步判断 like '%坠落伤%' or a.初步判断 like '%摔伤%') and a.初步判断 not like '%外伤1%' then '其他外伤'    " +
        "when a.初步判断 like '%心脏聚停%' or a.初步判断 like '%高血压%' or a.初步判断 like '%风湿性心脏病%' or a.初步判断 like '%急性冠脉综合征%' or a.初步判断 like '%心肌梗塞%' or a.初步判断 like '%心率失常%' or a.初步判断 like '%心包压塞%' or a.初步判断 like '%蛛网膜下腔出血%' or a.初步判断 like '%脑出血%' or a.初步判断 like '%脑梗塞%' or a.初步判断 like '%脑血管意外后遗症%' or a.初步判断 like '%低血压%' or a.初步判断 like '%心力衰竭%' or a.初步判断 like '%心源性休克%' or a.初步判断 like '%其他心脑血管疾病%' or a.初步判断 like '%心脏不适%' or a.初步判断 like '%心动过速%' or a.初步判断 like '%心动过缓%' then '心脑血管疾病'    " +
        "when a.初步判断 like '%晕厥%' or a.初步判断 like '%昏迷%' then '晕厥或昏迷'    " +
        "when a.初步判断 like '%中毒%' then '中毒'    " +
        "when a.初步判断 like '%急腹症%' or a.初步判断 like '%消化性溃疡%' or a.初步判断 like '%胃出血%' or a.初步判断 like '%上消化道出血%' or a.初步判断 like '%阑尾炎%' or a.初步判断 like '%腹股沟疝%' or a.初步判断 like '%急性胃肠炎%' or a.初步判断 like '%肠梗阻%' or a.初步判断 like '%腹膜炎%' or a.初步判断 like '%肝硬化%' or a.初步判断 like '%胆囊炎%' or a.初步判断 like '%胰腺炎%' or a.初步判断 like '%急性肝脏衰竭%' or a.初步判断 like '%便血%' or a.初步判断 like '%肠套叠%' or a.初步判断 like '%其他消化系统疾病%' then '消化系统疾病'    " +
        "when a.初步判断 like '%上呼吸道感染%' or a.初步判断 like '%感冒%' or a.初步判断 like '%支气管炎%' or a.初步判断 like '%肺炎%' or a.初步判断 like '%ARDS%' or a.初步判断 like '%肺气肿%' or a.初步判断 like '%哮喘%' or a.初步判断 like '%支气管扩张%' or a.初步判断 like '%COPD%' or a.初步判断 like '%血、气胸%' or a.初步判断 like '%肺栓塞%' or a.初步判断 like '%呼吸衰竭%' or a.初步判断 like '%其他呼吸系统疾病%' then '呼吸系统疾病'    " +
        "when a.初步判断 like '%盆腔炎%' or a.初步判断 like '%痛经%' or a.初步判断 like '%功能性子宫出血%' or a.初步判断 like '%阴道出血%' or a.初步判断 like '%卵巢囊肿剃扭转%' or a.初步判断 like '%宫外孕%' or a.初步判断 like '%自然流产%' or a.初步判断 like '%羊水栓塞%' or a.初步判断 like '%妊高症%' or a.初步判断 like '%先兆子痫%' or a.初步判断 like '%先兆流产%' or a.初步判断 like '%胎膜早破%' or a.初步判断 like '%前置胎盘%' or a.初步判断 like '%胎盘早剥%' or a.初步判断 like '%早产%' or a.初步判断 like '%产后出血%' or a.初步判断 like '%子宫破裂%' or a.初步判断 like '%临产%' or a.初步判断 like '%其他妇产科疾病%' or a.初步判断 like '%早产儿%' or a.初步判断 like '%新生儿窒息%' or a.初步判断 like '%新生儿黄疸%' or a.初步判断 like '%新生儿败血症%' or a.初步判断 like '%其他新生儿疾病%' then '妇儿疾病'    when a.初步判断 like '%抽搐%' then '抽搐'    " +
        "when a.初步判断 like '%中暑%' or a.初步判断 like '%淹溺%' then '中暑淹溺'    else '其他' end '分类',a.初步判断 into #accept    from ausp120.tb_AcceptDescriptV a where a.类型编码 not in (2,4)    " +
        "select a.分类,a.初步判断,COUNT(*) 数量,'' 百分比    from ausp120.tb_EventV e left outer join #accept a on a.事件编码=e.事件编码    " +
        "left outer join ausp120.tb_TaskV t on a.受理序号=t.受理序号 and a.事件编码=t.事件编码    left outer join ausp120.tb_MrUser m on m.工号=t.调度员编码    " +
        "where e.事件性质编码=1 and a.开始受理时刻 between @startTime and @endTime    group by a.分类,a.初步判断    order by a.分类    drop table #accept       ";
    var sqlData = {
        statement: sql,
        params: params
    };

    var summary = { //合计
        "project": '合计',
        "phoneJudge": '',
        "numbers": 0,
        "percent": '100%'
    };

    db.select(sqlData, function (err, results) {
        if (err) {
            console.log(results);
        } else {
            var result = []; //查询的结果
            var numbers;
            for (var i = 0; i < results.length; i++) {
                numbers = results[i][2].value || 0;
                summary.numbers = parseInt(summary.numbers) + parseInt(numbers);
                result.push({
                    "project": results[i][0].value || '',
                    "phoneJudge": results[i][1].value || '',
                    "numbers": results[i][2].value || 0,
                    "percent": results[i][3].value || 0
                });
            }

            for (var j = 0; j < result.length; j++) {//算分比
                result[j].percent = util.calculateRate(summary.numbers, result[j].numbers)
            }

            result.push(summary);
            res.json(result);
        }
    });
};

/**
 * 鄂州市医疗紧急救援中心病员流向表
 * @param req
 * @param res
 */
exports.getPatientFlowDirection = function (req, res) {
    var startTime = req.body.startTime;
    var endTime = req.body.endTime;
    var params = [{"name": "startTime", "value": startTime, "type": "varchar"}, {
        "name": "endTime", "value": endTime, "type": "varchar"
    }];
    var sql = "select a.开始受理时刻,s.分站名称,a.事件编码,case when a.初步判断 like '%外伤1%' then '车祸外伤'     " +
        "when (a.初步判断 like '%外伤%' or a.初步判断 like '%骨折%' or a.初步判断 like '%坠落伤%' or a.初步判断 like '%摔伤%') and a.初步判断 not like '%外伤1%' then '其他外伤'    " +
        "when a.初步判断 like '%心脏聚停%' or a.初步判断 like '%高血压%' or a.初步判断 like '%风湿性心脏病%' or a.初步判断 like '%急性冠脉综合征%' or a.初步判断 like '%心肌梗塞%' or a.初步判断 like '%心率失常%' or a.初步判断 like '%心包压塞%' or a.初步判断 like '%蛛网膜下腔出血%' or a.初步判断 like '%脑出血%' or a.初步判断 like '%脑梗塞%' or a.初步判断 like '%脑血管意外后遗症%' or a.初步判断 like '%低血压%' or a.初步判断 like '%心力衰竭%' or a.初步判断 like '%心源性休克%' or a.初步判断 like '%其他心脑血管疾病%' or a.初步判断 like '%心脏不适%' or a.初步判断 like '%心动过速%' or a.初步判断 like '%心动过缓%' then '心脑血管疾病'    " +
        "when a.初步判断 like '%晕厥%' or a.初步判断 like '%昏迷%' then '晕厥或昏迷'    " +
        "when a.初步判断 like '%中毒%' then '中毒'    when a.初步判断 like '%急腹症%' or a.初步判断 like '%消化性溃疡%' or a.初步判断 like '%胃出血%' or a.初步判断 like '%上消化道出血%' or a.初步判断 like '%阑尾炎%' or a.初步判断 like '%腹股沟疝%' or a.初步判断 like '%急性胃肠炎%' or a.初步判断 like '%肠梗阻%' or a.初步判断 like '%腹膜炎%' or a.初步判断 like '%肝硬化%' or a.初步判断 like '%胆囊炎%' or a.初步判断 like '%胰腺炎%' or a.初步判断 like '%急性肝脏衰竭%' or a.初步判断 like '%便血%' or a.初步判断 like '%肠套叠%' or a.初步判断 like '%其他消化系统疾病%' then '消化系统疾病'    " +
        "when a.初步判断 like '%上呼吸道感染%' or a.初步判断 like '%感冒%' or a.初步判断 like '%支气管炎%' or a.初步判断 like '%肺炎%' or a.初步判断 like '%ARDS%' or a.初步判断 like '%肺气肿%' or a.初步判断 like '%哮喘%' or a.初步判断 like '%支气管扩张%' or a.初步判断 like '%COPD%' or a.初步判断 like '%血、气胸%' or a.初步判断 like '%肺栓塞%' or a.初步判断 like '%呼吸衰竭%' or a.初步判断 like '%其他呼吸系统疾病%' then '呼吸系统疾病'    " +
        "when a.初步判断 like '%盆腔炎%' or a.初步判断 like '%痛经%' or a.初步判断 like '%功能性子宫出血%' or a.初步判断 like '%阴道出血%' or a.初步判断 like '%卵巢囊肿剃扭转%' or a.初步判断 like '%宫外孕%' or a.初步判断 like '%自然流产%' or a.初步判断 like '%羊水栓塞%' or a.初步判断 like '%妊高症%' or a.初步判断 like '%先兆子痫%' or a.初步判断 like '%先兆流产%' or a.初步判断 like '%胎膜早破%' or a.初步判断 like '%前置胎盘%' or a.初步判断 like '%胎盘早剥%' or a.初步判断 like '%早产%' or a.初步判断 like '%产后出血%' or a.初步判断 like '%子宫破裂%' or a.初步判断 like '%临产%' or a.初步判断 like '%其他妇产科疾病%' or a.初步判断 like '%早产儿%' or a.初步判断 like '%新生儿窒息%' or a.初步判断 like '%新生儿黄疸%' or a.初步判断 like '%新生儿败血症%' or a.初步判断 like '%其他新生儿疾病%' then '妇儿疾病'    " +
        "when a.初步判断 like '%抽搐%' then '抽搐'    when a.初步判断 like '%中暑%' or a.初步判断 like '%淹溺%' then '中暑淹溺'    else '其他' end '分类'," +
        "a.初步判断,case when t.送往地点 in ('中心医院','华容医院','太和医院','高速站') then '中心医院'    when t.送往地点 like '%鄂钢医院%' then '鄂钢医院' when t.送往地点 like '%二医院%' then '二医院'    when t.送往地点 like '%中医医院%' or t.送往地点 like '%中医院%' then '中医医院' when t.送往地点 like '%妇幼保健院%' then '妇幼保健院'    when t.送往地点 like '%三医院%' then '三医院'  " +
        "when t.送往地点 like '%太和卫生院%' then '太和卫生院'    when t.送往地点 like '%华容人民医院%' then '华容人民医院' when t.结果编码 in (2,3,1,5) then '跑空' else '其他医院' end 送往地点 into #at    " +
        "from ausp120.tb_AcceptDescriptV a    left outer join ausp120.tb_TaskV t on a.受理序号=t.受理序号 and a.事件编码=t.事件编码    " +
        "left outer join ausp120.tb_MrUser m on m.工号=t.调度员编码    left outer join ausp120.tb_Station s on s.分站编码=t.分站编码    where a.类型编码 not in (2,4)    " +
        "select at.送往地点,at.分站名称,at.分类,COUNT(*) 数量,'' 百分比    from ausp120.tb_EventV e left outer join #at at on at.事件编码=e.事件编码    " +
        "where e.事件性质编码=1 and at.开始受理时刻 between @startTime and @endTime    " +
        "group by at.送往地点,at.分站名称,at.分类    order by at.送往地点,at.分站名称,at.分类    drop table #at    ";
    var sqlData = {
        statement: sql,
        params: params
    };

    var summary = { //总计
        "sendAddr": '总计',
        "numbers": 0,
        "percent": '100%'
    };

    db.select(sqlData, function (err, results) {
        if (err) {
            console.log(results);
        } else {
            var result = []; //查询的结果
            var numbers;
            var num1 = 0, num2 = 0;
            var columnValue1;//上一个值
            var columnValue;//当前值
            var columnSubValue;
            var columnSubValue1;
            for (var i = 0; i < results.length; i++) {
                numbers = results[i][3].value || 0;
                summary.numbers = parseInt(summary.numbers) + parseInt(numbers);
                columnSubValue1 = columnSubValue;
                columnSubValue = results[i][0].value + results[i][1].value;
                if ((columnSubValue != columnSubValue1) && !string.isBlankOrEmpty(columnSubValue1)) {
                    result.push({
                        "sendAddr": results[i - 1][0].value,
                        "station": '小计',
                        "patientClass": '',
                        "numbers": num2,
                        "percent": ''
                    });
                    num2 = 0;
                }
                columnValue1 = columnValue;
                columnValue = results[i][0].value;
                if ((columnValue != columnValue1) && !string.isBlankOrEmpty(columnValue1)) {
                    result.push({
                        "sendAddr": '合计',
                        "numbers": num1,
                        "percent": ''
                    });
                    num1 = 0;
                }
                num1 = parseInt(num1) + parseInt(numbers);
                num2 = parseInt(num2) + parseInt(numbers);
                result.push({
                    "sendAddr": results[i][0].value || '',
                    "station": results[i][1].value || '',
                    "patientClass": results[i][2].value || '',
                    "numbers": results[i][3].value || 0,
                    "percent": results[i][4].value
                });
            }
            if (results.length > 1) {
                result.push({
                    "sendAddr": results[results.length - 1][0].value,
                    "station": '小计',
                    "patientClass": '',
                    "numbers": num2,
                    "percent": ''
                });
                result.push({
                    "sendAddr": '合计',
                    "numbers": num1,
                    "percent": ''
                });
            }

            for (var j = 0; j < result.length; j++) {//算分比
                result[j].percent = util.calculateRate(summary.numbers, result[j].numbers)
            }

            result.push(summary);
            res.json(result);
        }
    });
};

/**
 * 鄂州市医疗紧急救援中心病员流向表
 * @param req
 * @param res
 */
exports.getPatientFlowDirectionStatistics = function (req, res) {
    var startTime = req.body.startTime;
    var endTime = req.body.endTime;
    var params = [{"name": "startTime", "value": startTime, "type": "varchar"}, {
        "name": "endTime", "value": endTime, "type": "varchar"
    }];
    var sql = "select convert(varchar(20),a.开始受理时刻,120) ,s.分站名称,t.司机,t.随车医生,t.随车护士,a.现场地址,pc.医生诊断,t.送往地点, am.实际标识 ,dls.NameM   " +
        "from ausp120.tb_EventV e left outer join ausp120.tb_AcceptDescriptV a on e.事件编码=a.事件编码    " +
        "left outer join ausp120.tb_TaskV t on t.事件编码=a.事件编码 and t.受理序号=a.受理序号    left outer join ausp120.tb_Station s on s.分站编码=t.分站编码    " +
        "left outer join ausp120.tb_DLinkSource dls on dls.Code=e.联动来源编码  left outer join ausp120.tb_Ambulance am on am.车辆编码=t.车辆编码 " +
        "left outer join ausp120.tb_PatientCase pc on pc.车辆标识=am.实际标识 and pc.任务编码=t.任务编码 and pc.序号=1  " +
        "where e.事件性质编码=1 and a.类型编码 not in (2,4) and a.开始受理时刻 between @startTime and @endTime     order by a.开始受理时刻    ";
    var sqlData = {
        statement: sql,
        params: params
    };


    db.select(sqlData, function (err, results) {
        if (err) {
            console.log(results);
        } else {
            var result = []; //查询的结果
            for (var i = 0; i < results.length; i++) {
                result.push({
                    "dateTime": results[i][0].value || '',
                    "station": results[i][1].value || '',
                    "driver": results[i][2].value || '',
                    "nurse": results[i][3].value || '',
                    "doctor": results[i][4].value || '',
                    "localAddr": results[i][5].value || '',
                    "diagnose": results[i][6].value || '',
                    "sendAddr": results[i][7].value || '',
                    "carIdentification": results[i][8].value || '',
                    "linkSource": results[i][9].value || ''
                });
            }
            res.json(result);
        }
    });
};

/**
 * 鄂州市医疗紧急救援中心病员流向表
 * @param req
 * @param res
 */
exports.getAreaPatientClassFlow = function (req, res) {
    var startTime = req.body.startTime;
    var endTime = req.body.endTime;
    var params = [{"name": "startTime", "value": startTime, "type": "varchar"}, {
        "name": "endTime", "value": endTime, "type": "varchar"
    }];
    var sql = "select a.开始受理时刻,a.现场地址,a.受理序号,a.事件编码,a.类型编码,a.年龄,a.性别,a.患者姓名,a.初步判断,    " +
        "case when a.现场地址 like '%杜山镇%' or a.现场地址 like '%长港镇%' or a.现场地址 like '%长农%' or a.现场地址 like '%新庙镇%' or a.现场地址 like '%燕矶镇%' or a.现场地址 like '%沙窝乡%' or a.现场地址 like '%泽林镇%' or a.现场地址 like '%碧石镇%' or a.现场地址 like '%汀祖镇%' or a.现场地址 like '%花湖镇%' or a.现场地址 like '%杨叶镇%' then '鄂城区'    " +
        "when a.现场地址 like '%临江乡%' or a.现场地址 like '%胡林%' or a.现场地址 like '%段店镇%' or a.现场地址 like '%泥矶%' or a.现场地址 like '%华容镇%' or a.现场地址 like '%蒲团乡%' or a.现场地址 like '%庙岭镇%'  then '华容区'    " +
        "when a.现场地址 like '%东沟镇%' or a.现场地址 like '%沼山镇%' or a.现场地址 like '%梁子岛%' or a.现场地址 like '%西长岭%' or a.现场地址 like '%太和镇%' or a.现场地址 like '%涂家垴镇%' or a.现场地址 like '%公友%' or a.现场地址 like '%涂镇%' then '梁子湖区'    " +
        "when a.现场地址 like '%葛店开发区%' or a.现场地址 like '%大湾%'  then '葛店开发区' else '城区' end 区域,    case when a.现场地址 like '%杜山镇%' then '杜山镇' when (a.现场地址 like '%长港镇%' or a.现场地址 like '%长农%') then '长港镇/长农'  " +
        "when a.现场地址 like '%新庙镇%' then '新庙镇' when a.现场地址 like '%燕矶镇%' then '燕矶镇' when a.现场地址 like '%沙窝乡%' then '沙窝乡' when a.现场地址 like '%泽林镇%' then '泽林镇' when a.现场地址 like '%碧石镇%' then '碧石镇'    when a.现场地址 like '%汀祖镇%' then '汀祖镇' " +
        "when a.现场地址 like '%花湖镇%' then '花湖镇' when a.现场地址 like '%杨叶镇%' then '杨叶镇' 	when (a.现场地址 like '%临江乡%' or a.现场地址 like '%胡林%') then '临江乡/胡林' when (a.现场地址 like '%段店镇%' or a.现场地址 like '%泥矶%') then '段店镇/泥矶' " +
        "when a.现场地址 like '%华容镇%' then '华容镇'    when a.现场地址 like '%蒲团乡%' then '蒲团乡' when a.现场地址 like '%庙岭镇%'  then '庙岭镇' when a.现场地址 like '%东沟镇%' then '东沟镇' when a.现场地址 like '%沼山镇%' then '沼山镇' " +
        "when (a.现场地址 like '%梁子岛%' or a.现场地址 like '%西长岭%') then '梁子岛/西长岭' when a.现场地址 like '%太和镇%' then '太和镇'    " +
        "when (a.现场地址 like '%涂家垴镇%' or a.现场地址 like '%公友%' or a.现场地址 like '%涂镇%') then '涂家垴镇/公友/涂镇' " +
        "when (a.现场地址 like '%葛店开发区%' or a.现场地址 like '%大湾%')  then '葛店开发区/大湾' else '城区' end 乡镇    into #accept from ausp120.tb_AcceptDescriptV a    " +
        "select convert(varchar(20),a.开始受理时刻,120),et.NameM,a.区域,a.现场地址,pc.病人主诉,a.初步判断,a.患者姓名,a.性别,a.年龄    " +
        "from ausp120.tb_EventV e left outer join #accept a on e.事件编码=a.事件编码    left outer join ausp120.tb_TaskV t on t.事件编码=a.事件编码 and t.受理序号=a.受理序号    " +
        "left outer join ausp120.tb_DEventType et on et.Code=e.事件类型编码    left outer join ausp120.tb_Ambulance am on am.车辆编码=t.车辆编码    " +
        "left outer join ausp120.tb_PatientCase pc on pc.车辆标识=am.实际标识 and pc.任务编码=t.任务编码 and pc.序号=1    " +
        "where e.事件性质编码=1 and a.类型编码 not in (2,4) and a.开始受理时刻 between @startTime and @endTime  order by a.开始受理时刻    drop table #accept    ";
    var sqlData = {
        statement: sql,
        params: params
    };


    db.select(sqlData, function (err, results) {
        if (err) {
            console.log(results);
        } else {
            var result = []; //查询的结果
            for (var i = 0; i < results.length; i++) {
                result.push({
                    "dateTime": results[i][0].value || '',
                    "eventType": results[i][1].value || '',
                    "area": results[i][2].value || '',
                    "localAddr": results[i][3].value || '',
                    "chief": results[i][4].value || '',
                    "phoneJudge": results[i][5].value || '',
                    "patientName": results[i][6].value || '',
                    "sex": results[i][7].value || '',
                    "age": results[i][8].value || ''
                });
            }
            res.json(result);
        }
    });
};

/**
 * 呼救区域统计表
 * @param req
 * @param res
 */
exports.getAreaPatientClassFlowStatistics = function (req, res) {
    var startTime = req.body.startTime;
    var endTime = req.body.endTime;
    var params = [{"name": "startTime", "value": startTime, "type": "varchar"}, {
        "name": "endTime", "value": endTime, "type": "varchar"
    }];
    var sql = "select a.开始受理时刻,a.现场地址,a.受理序号,a.事件编码,a.年龄,a.性别,a.患者姓名,a.初步判断,a.类型编码,    " +
        "case when a.现场地址 like '%杜山镇%' or a.现场地址 like '%长港镇%' or a.现场地址 like '%长农%' or a.现场地址 like '%新庙镇%' or a.现场地址 like '%燕矶镇%' or a.现场地址 like '%沙窝乡%' or a.现场地址 like '%泽林镇%' or a.现场地址 like '%碧石镇%' or a.现场地址 like '%汀祖镇%' or a.现场地址 like '%花湖镇%' or a.现场地址 like '%杨叶镇%' then '鄂城区'    " +
        "when a.现场地址 like '%临江乡%' or a.现场地址 like '%胡林%' or a.现场地址 like '%段店镇%' or a.现场地址 like '%泥矶%' or a.现场地址 like '%华容镇%' or a.现场地址 like '%蒲团乡%' or a.现场地址 like '%庙岭镇%'  then '华容区'    " +
        "when a.现场地址 like '%东沟镇%' or a.现场地址 like '%沼山镇%' or a.现场地址 like '%梁子岛%' or a.现场地址 like '%西长岭%' or a.现场地址 like '%太和镇%' or a.现场地址 like '%涂家垴镇%' or a.现场地址 like '%公友%' or a.现场地址 like '%涂镇%' then '梁子湖区'    " +
        "when a.现场地址 like '%葛店开发区%' or a.现场地址 like '%大湾%'  then '葛店开发区' else '城区' end 区域,    " +
        "case when a.现场地址 like '%杜山镇%' then '杜山镇' when (a.现场地址 like '%长港镇%' or a.现场地址 like '%长农%') then '长港镇/长农'  when a.现场地址 like '%新庙镇%' then '新庙镇'" +
        "when a.现场地址 like '%燕矶镇%' then '燕矶镇' when a.现场地址 like '%沙窝乡%' then '沙窝乡' when a.现场地址 like '%泽林镇%' then '泽林镇' when a.现场地址 like '%碧石镇%' then '碧石镇'    " +
        "when a.现场地址 like '%汀祖镇%' then '汀祖镇' when a.现场地址 like '%花湖镇%' then '花湖镇' when a.现场地址 like '%杨叶镇%' then '杨叶镇' 	when (a.现场地址 like '%临江乡%' or a.现场地址 like '%胡林%') then '临江乡/胡林' " +
        "when (a.现场地址 like '%段店镇%' or a.现场地址 like '%泥矶%') then '段店镇/泥矶' when a.现场地址 like '%华容镇%' then '华容镇'    when a.现场地址 like '%蒲团乡%' then '蒲团乡' when a.现场地址 like '%庙岭镇%'  then '庙岭镇' " +
        "when a.现场地址 like '%东沟镇%' then '东沟镇' when a.现场地址 like '%沼山镇%' then '沼山镇' when (a.现场地址 like '%梁子岛%' or a.现场地址 like '%西长岭%') then '梁子岛/西长岭' when a.现场地址 like '%太和镇%' then '太和镇'    " +
        "when (a.现场地址 like '%涂家垴镇%' or a.现场地址 like '%公友%' or a.现场地址 like '%涂镇%') then '涂家垴镇/公友/涂镇' when (a.现场地址 like '%葛店开发区%' or a.现场地址 like '%大湾%')  then '葛店开发区/大湾' else '城区' end 乡镇,    " +
        "case when a.初步判断 like '%外伤1%' then '车祸外伤'    when (a.初步判断 like '%外伤%' or a.初步判断 like '%骨折%' or a.初步判断 like '%坠落伤%' or a.初步判断 like '%摔伤%') and a.初步判断 not like '%外伤1%' then '其他外伤'    " +
        "when a.初步判断 like '%心脏聚停%' or a.初步判断 like '%高血压%' or a.初步判断 like '%风湿性心脏病%' or a.初步判断 like '%急性冠脉综合征%' or a.初步判断 like '%心肌梗塞%' or a.初步判断 like '%心率失常%' or a.初步判断 like '%心包压塞%' or a.初步判断 like '%蛛网膜下腔出血%' or a.初步判断 like '%脑出血%' or a.初步判断 like '%脑梗塞%' or a.初步判断 like '%脑血管意外后遗症%' or a.初步判断 like '%低血压%' or a.初步判断 like '%心力衰竭%' or a.初步判断 like '%心源性休克%' or a.初步判断 like '%其他心脑血管疾病%' or a.初步判断 like '%心脏不适%' or a.初步判断 like '%心动过速%' or a.初步判断 like '%心动过缓%' then '心脑血管疾病'    " +
        "when a.初步判断 like '%晕厥%' or a.初步判断 like '%昏迷%' then '晕厥或昏迷'    when a.初步判断 like '%中毒%' then '中毒'    " +
        "when a.初步判断 like '%急腹症%' or a.初步判断 like '%消化性溃疡%' or a.初步判断 like '%胃出血%' or a.初步判断 like '%上消化道出血%' or a.初步判断 like '%阑尾炎%' or a.初步判断 like '%腹股沟疝%' or a.初步判断 like '%急性胃肠炎%' or a.初步判断 like '%肠梗阻%' or a.初步判断 like '%腹膜炎%' or a.初步判断 like '%肝硬化%' or a.初步判断 like '%胆囊炎%' or a.初步判断 like '%胰腺炎%' or a.初步判断 like '%急性肝脏衰竭%' or a.初步判断 like '%便血%' or a.初步判断 like '%肠套叠%' or a.初步判断 like '%其他消化系统疾病%' then '消化系统疾病'    " +
        "when a.初步判断 like '%上呼吸道感染%' or a.初步判断 like '%感冒%' or a.初步判断 like '%支气管炎%' or a.初步判断 like '%肺炎%' or a.初步判断 like '%ARDS%' or a.初步判断 like '%肺气肿%' or a.初步判断 like '%哮喘%' or a.初步判断 like '%支气管扩张%' or a.初步判断 like '%COPD%' or a.初步判断 like '%血、气胸%' or a.初步判断 like '%肺栓塞%' or a.初步判断 like '%呼吸衰竭%' or a.初步判断 like '%其他呼吸系统疾病%' then '呼吸系统疾病'    " +
        "when a.初步判断 like '%盆腔炎%' or a.初步判断 like '%痛经%' or a.初步判断 like '%功能性子宫出血%' or a.初步判断 like '%阴道出血%' or a.初步判断 like '%卵巢囊肿剃扭转%' or a.初步判断 like '%宫外孕%' or a.初步判断 like '%自然流产%' or a.初步判断 like '%羊水栓塞%' or a.初步判断 like '%妊高症%' or a.初步判断 like '%先兆子痫%' or a.初步判断 like '%先兆流产%' or a.初步判断 like '%胎膜早破%' or a.初步判断 like '%前置胎盘%' or a.初步判断 like '%胎盘早剥%' or a.初步判断 like '%早产%' or a.初步判断 like '%产后出血%' or a.初步判断 like '%子宫破裂%' or a.初步判断 like '%临产%' or a.初步判断 like '%其他妇产科疾病%' or a.初步判断 like '%早产儿%' or a.初步判断 like '%新生儿窒息%' or a.初步判断 like '%新生儿黄疸%' or a.初步判断 like '%新生儿败血症%' or a.初步判断 like '%其他新生儿疾病%' then '妇儿疾病'    when a.初步判断 like '%抽搐%' then '抽搐'    " +
        "when a.初步判断 like '%中暑%' or a.初步判断 like '%淹溺%' then '中暑淹溺'    else '其他' end '分类'    into #accept from ausp120.tb_AcceptDescriptV a    " +
        "select a.区域,a.乡镇,a.分类,COUNT(*),'' 构成比    from ausp120.tb_EventV e left outer join #accept a on e.事件编码=a.事件编码    " +
        "left outer join ausp120.tb_TaskV t on t.事件编码=a.事件编码 and t.受理序号=a.受理序号    left outer join ausp120.tb_DEventType et on et.Code=e.事件类型编码    " +
        "left outer join ausp120.tb_Ambulance am on am.车辆编码=t.车辆编码    " +
        "left outer join ausp120.tb_PatientCase pc on pc.车辆标识=am.实际标识 and pc.任务编码=t.任务编码 and pc.序号=1    " +
        "where e.事件性质编码=1 and a.类型编码 not in (2,4) and a.开始受理时刻 between @startTime and @endTime    group by a.区域,a.乡镇,a.分类 order by a.区域,a.乡镇,a.分类    drop table #accept   ";
    var sqlData = {
        statement: sql,
        params: params
    };

    var summary = { //总计
        "area": '总计',
        "numbers": 0,
        "percent": '100%'
    };

    db.select(sqlData, function (err, results) {
        if (err) {
            console.log(results);
        } else {
            var result = []; //查询的结果
            var numbers;
            var num1 = 0, num2 = 0;
            var columnValue1;//上一个值
            var columnValue;//当前值
            var columnSubValue;
            var columnSubValue1;
            for (var i = 0; i < results.length; i++) {
                numbers = results[i][3].value || 0;
                summary.numbers = parseInt(summary.numbers) + parseInt(numbers);
                columnSubValue1 = columnSubValue;
                columnSubValue = results[i][0].value + results[i][1].value;
                if ((columnSubValue != columnSubValue1) && !string.isBlankOrEmpty(columnSubValue1)) {
                    result.push({
                        "area": results[i - 1][0].value,
                        "township": '小计',
                        "patientClass": '',
                        "numbers": num2,
                        "percent": ''
                    });
                    num2 = 0;
                }
                columnValue1 = columnValue;
                columnValue = results[i][0].value;
                if ((columnValue != columnValue1) && !string.isBlankOrEmpty(columnValue1)) {
                    result.push({
                        "area": '合计',
                        "numbers": num1,
                        "percent": ''
                    });
                    num1 = 0;
                }
                num1 = parseInt(num1) + parseInt(numbers);
                num2 = parseInt(num2) + parseInt(numbers);
                result.push({
                    "area": results[i][0].value || '',
                    "township": results[i][1].value || '',
                    "patientClass": results[i][2].value || '',
                    "numbers": results[i][3].value || 0,
                    "percent": results[i][4].value
                });
            }
            if (results.length > 1) {
                result.push({
                    "area": results[results.length - 1][0].value,
                    "township": '小计',
                    "patientClass": '',
                    "numbers": num2,
                    "percent": ''
                });
                result.push({
                    "area": '合计',
                    "numbers": num1,
                    "percent": ''
                });
            }


            for (var j = 0; j < result.length; j++) {//算分比
                result[j].percent = util.calculateRate(summary.numbers, result[j].numbers)
            }
            result.push(summary);
            res.json(result);
        }
    });
};

/**
 * 车辆出车情况统计表
 * @param req
 * @param res
 */
exports.getCarOutStatistics = function (req, res) {
    var startTime = req.body.startTime;
    var endTime = req.body.endTime;
    var params = [{"name": "startTime", "value": startTime, "type": "varchar"}, {
        "name": "endTime", "value": endTime, "type": "varchar"
    }];
    var sql = "select s.分站名称,isnull(t.司机,'') 司机,am.实际标识,am.车牌号码,SUM(case when CONVERT(varchar(20),t.生成任务时刻,108) between '06:30:00' and '21:30:00' then 1 else 0 end) 白班出车,    " +
        "SUM(case when CONVERT(varchar(20),t.生成任务时刻,108) not between '06:30:00' and '21:30:00' then 1 else 0 end) 夜班出车,        " +
        "SUM(case when CONVERT(varchar(20),t.生成任务时刻,108) between '06:30:00' and '21:30:00' and t.结果编码=4 then 1 else 0 end) 白班有效出车,        " +
        "SUM(case when CONVERT(varchar(20),t.生成任务时刻,108) not between '06:30:00' and '21:30:00' and t.结果编码=4 then 1 else 0 end) 夜班有效出车,    " +
        "COUNT(*) 出车小计,SUM(case when t.结果编码=4 then 1 else 0 end)  有效出车小计    from ausp120.tb_EventV e " +
        "left outer join ausp120.tb_AcceptDescriptV a on a.事件编码=e.事件编码    left outer join ausp120.tb_TaskV t on a.受理序号=t.受理序号 and a.事件编码=t.事件编码    " +
        "left outer join ausp120.tb_Station s on s.分站编码=t.分站编码    left outer join ausp120.tb_Ambulance am on am.车辆编码=t.车辆编码    " +
        "where e.事件性质编码=1 and a.类型编码 not in (2,4) and a.开始受理时刻 between @startTime and @endTime    " +
        "group by s.分站名称,t.司机,am.实际标识,am.车牌号码    order by s.分站名称,t.司机,am.实际标识,am.车牌号码";
    var sqlData = {
        statement: sql,
        params: params
    };

    var summary = { //总计
        "station": '总计',
        "num1": 0,
        "num2": 0,
        "num3": 0,
        "num4": 0,
        "num5": 0,
        "num6": 0
    };

    db.select(sqlData, function (err, results) {
        if (err) {
            console.log(results);
        } else {
            var result = []; //查询的结果
            var numbers1 = 0, numbers2 = 0, numbers3 = 0, numbers4 = 0, numbers5 = 0, numbers6 = 0;
            var num1 = 0, num2 = 0, num3 = 0, num4 = 0, num5 = 0, num6 = 0; //小计
            var gnum1 = 0, gnum2 = 0, gnum3 = 0, gnum4 = 0, gnum5 = 0, gnum6 = 0; //合计
            var columnValue1;//上一个值
            var columnValue;//当前值
            var columnSubValue;
            var columnSubValue1;
            for (var i = 0; i < results.length; i++) {
                numbers1 = results[i][4].value || 0;
                numbers2 = results[i][5].value || 0;
                numbers3 = results[i][6].value || 0;
                numbers4 = results[i][7].value || 0;
                numbers5 = results[i][8].value || 0;
                numbers6 = results[i][9].value || 0;

                summary.num1 = parseInt(summary.num1) + parseInt(numbers1);
                summary.num2 = parseInt(summary.num2) + parseInt(numbers2);
                summary.num3 = parseInt(summary.num3) + parseInt(numbers3);
                summary.num4 = parseInt(summary.num4) + parseInt(numbers4);
                summary.num5 = parseInt(summary.num5) + parseInt(numbers5);
                summary.num6 = parseInt(summary.num6) + parseInt(numbers6);

                columnSubValue1 = columnSubValue;
                columnSubValue = results[i][0].value + results[i][1].value;
                if ((columnSubValue != columnSubValue1) && !string.isBlankOrEmpty(columnSubValue1)) {
                    result.push({
                        "station": results[i - 1][0].value,
                        "driver": '小计',
                        "carIdentification": '',
                        "carNo": '',
                        "num1": num1,
                        "num2": num2,
                        "num3": num3,
                        "num4": num4,
                        "num5": num5,
                        "num6": num6
                    });
                    num1 = 0;
                    num2 = 0;
                    num3 = 0;
                    num4 = 0;
                    num5 = 0;
                    num6 = 0;
                }
                columnValue1 = columnValue;
                columnValue = results[i][0].value;
                if ((columnValue != columnValue1) && !string.isBlankOrEmpty(columnValue1)) {
                    result.push({
                        "station": '合计',
                        "carIdentification": '',
                        "carNo": '',
                        "num1": gnum1,
                        "num2": gnum2,
                        "num3": gnum3,
                        "num4": gnum4,
                        "num5": gnum5,
                        "num6": gnum6
                    });
                    gnum1 = 0;
                    gnum2 = 0;
                    gnum3 = 0;
                    gnum4 = 0;
                    gnum5 = 0;
                    gnum6 = 0;
                }
                num1 = parseInt(num1) + parseInt(numbers1);
                num2 = parseInt(num2) + parseInt(numbers2);
                num3 = parseInt(num3) + parseInt(numbers3);
                num4 = parseInt(num4) + parseInt(numbers4);
                num5 = parseInt(num5) + parseInt(numbers5);
                num6 = parseInt(num6) + parseInt(numbers6);

                gnum1 = parseInt(gnum1) + parseInt(numbers1);
                gnum2 = parseInt(gnum2) + parseInt(numbers2);
                gnum3 = parseInt(gnum3) + parseInt(numbers3);
                gnum4 = parseInt(gnum4) + parseInt(numbers4);
                gnum5 = parseInt(gnum5) + parseInt(numbers5);
                gnum6 = parseInt(gnum6) + parseInt(numbers6);
                result.push({
                    "station": results[i][0].value || '',
                    "driver": results[i][1].value || '',
                    "carIdentification": results[i][2].value || '',
                    "carNo": results[i][3].value || '',
                    "num1": results[i][4].value || 0,
                    "num2": results[i][5].value || 0,
                    "num3": results[i][6].value || 0,
                    "num4": results[i][7].value || 0,
                    "num5": results[i][8].value || 0,
                    "num6": results[i][4].value || 0
                });
            }
            if (results.length > 1) {
                result.push({
                    "station": results[results.length - 1][0].value,
                    "driver": '小计',
                    "carIdentification": '',
                    "carNo": '',
                    "num1": num1,
                    "num2": num2,
                    "num3": num3,
                    "num4": num4,
                    "num5": num5,
                    "num6": num6
                });
                result.push({
                    "station": '合计',
                    "num1": num1,
                    "num2": num2,
                    "num3": num3,
                    "num4": num4,
                    "num5": num5,
                    "num6": num6
                });
            }

            result.push(summary);
            res.json(result);
        }
    });
};


/**
 * 急救站出车反应速度统计表New
 * @param req
 * @param res
 */
exports.getStationOutCarReactionSpeed = function (req, res) {
    var startTime = req.body.startTime;
    var endTime = req.body.endTime;
    var params = [{"name": "startTime", "value": startTime, "type": "varchar"}, {
        "name": "endTime", "value": endTime, "type": "varchar"
    }];
    var sqlBatch = [];//批查询
    var sql;
    sql = "select s.分站名称,COUNT(*) 出车数,AVG(DATEDIFF(second,a.派车时刻,t.出车时刻)) 平均出车,   AVG(DATEDIFF(second,t.出车时刻,t.到达现场时刻)) 平均到达现场," +
        "AVG(DATEDIFF(second,t.出车时刻,t.到达医院时刻)) 平均到达医院,       AVG(DATEDIFF(second,t.出车时刻,t.完成时刻)) 平均完成    " +
        "from ausp120.tb_EventV e left outer join ausp120.tb_AcceptDescriptV a on a.事件编码=e.事件编码    " +
        "left outer join ausp120.tb_TaskV t on a.受理序号=t.受理序号 and a.事件编码=t.事件编码    left outer join ausp120.tb_Station s on s.分站编码=t.分站编码    " +
        "left outer join ausp120.tb_Ambulance am on am.车辆编码=t.车辆编码 where e.事件性质编码=1 and a.类型编码 not in (2,4) " +
        "and a.开始受理时刻 between @startTime and @endTime     group by s.分站名称 	order by s.分站名称   ";
    var sqlData = {
        statement: sql,
        params: params
    };
    sqlBatch.push(sqlData);

    sql = "select '合计',COUNT(*) 出车数,AVG(DATEDIFF(second,a.派车时刻,t.出车时刻)) 平均出车,   AVG(DATEDIFF(second,t.出车时刻,t.到达现场时刻)) 平均到达现场," +
        "AVG(DATEDIFF(second,t.出车时刻,t.到达医院时刻)) 平均到达医院,       AVG(DATEDIFF(second,t.出车时刻,t.完成时刻)) 平均完成    " +
        "from ausp120.tb_EventV e left outer join ausp120.tb_AcceptDescriptV a on a.事件编码=e.事件编码    " +
        "left outer join ausp120.tb_TaskV t on a.受理序号=t.受理序号 and a.事件编码=t.事件编码    left outer join ausp120.tb_Station s on s.分站编码=t.分站编码    " +
        "left outer join ausp120.tb_Ambulance am on am.车辆编码=t.车辆编码 where e.事件性质编码=1 and a.类型编码 not in (2,4) " +
        "and a.开始受理时刻 between @startTime and @endTime     ";
    sqlBatch.push({
        statement: sql,
        params: params
    });

    db.selectSerial(sqlBatch, function (err, results) {
        if (err) {
            console.log(results);
        } else {
            var result = []; //查询1的结果
            var data; //存储查询结果
            for (var j = 0; j < results.length; j++) {
                if (j == 0) { //结果1处理
                    data = results[j];
                    for (var i = 0; i < data.length; i++) {
                        result.push({
                            "station": data[i][0].value || '',
                            "outCars": data[i][1].value || 0,
                            "avgOutCarTime": data[i][2].value || 0,
                            "avgArriveSpotTime": data[i][3].value || 0,
                            "avgArriveHosTime": data[i][4].value || 0,
                            "avgCompleteTime": data[i][5].value || 0
                        });
                    }//结果1处理结束

                }

                if (j == 1) { //结果2处理
                    data = results[j];
                    for (var i = 0; i < data.length; i++) {
                        result.push({
                            "station": data[i][0].value || '',
                            "outCars": data[i][1].value || 0,
                            "avgOutCarTime": data[i][2].value || 0,
                            "avgArriveSpotTime": data[i][3].value || 0,
                            "avgArriveHosTime": data[i][4].value || 0,
                            "avgCompleteTime": data[i][5].value || 0
                        });
                    }
                } //结果2处理结束

            }
            for (var j = 0; j < result.length; j++) {
                result[j].avgArriveHosTime = util.formatSecond(result[j].avgArriveHosTime);
                result[j].avgArriveSpotTime = util.formatSecond(result[j].avgArriveSpotTime);
                result[j].avgCompleteTime = util.formatSecond(result[j].avgCompleteTime);
                result[j].avgOutCarTime = util.formatSecond(result[j].avgOutCarTime);
            }
            res.json(result);
        }
    });
};

/**
 * 司机出车反应速度统计表
 * @param req
 * @param res
 */
exports.getDriverOutCarReactionSpeed = function (req, res) {
    var startTime = req.body.startTime;
    var endTime = req.body.endTime;
    var params = [{"name": "startTime", "value": startTime, "type": "varchar"}, {
        "name": "endTime", "value": endTime, "type": "varchar"
    }];
    var sql;
    sql = "select t.司机,s.分站名称,COUNT(*) 出车数,AVG(DATEDIFF(second,a.派车时刻,t.出车时刻)) 平均出车,    AVG(DATEDIFF(second,t.出车时刻,t.到达现场时刻)) 平均到达现场,'0' orders    " +
        "from ausp120.tb_EventV e left outer join ausp120.tb_AcceptDescriptV a on a.事件编码=e.事件编码    " +
        "left outer join ausp120.tb_TaskV t on a.受理序号=t.受理序号 and a.事件编码=t.事件编码    left outer join ausp120.tb_Station s on s.分站编码=t.分站编码    " +
        "left outer join ausp120.tb_Ambulance am on am.车辆编码=t.车辆编码    where e.事件性质编码=1 and a.类型编码 not in (2,4) " +
        "and a.开始受理时刻 between @startTime and @endTime    group by t.司机,s.分站名称    union    " +
        "select t.司机,'合计' 分站名称,COUNT(*) 出车数,AVG(DATEDIFF(second,a.派车时刻,t.出车时刻)) 平均出车,       " +
        " AVG(DATEDIFF(second,t.出车时刻,t.到达现场时刻)) 平均到达现场,'1' orders    " +
        "from ausp120.tb_EventV e left outer join ausp120.tb_AcceptDescriptV a on a.事件编码=e.事件编码    " +
        "left outer join ausp120.tb_TaskV t on a.受理序号=t.受理序号 and a.事件编码=t.事件编码    left outer join ausp120.tb_Station s on s.分站编码=t.分站编码    " +
        "left outer join ausp120.tb_Ambulance am on am.车辆编码=t.车辆编码    " +
        "where e.事件性质编码=1 and a.类型编码 not in (2,4) and a.开始受理时刻 between @startTime and @endTime    group by t.司机	  order by t.司机,orders   ";
    var sqlData = {
        statement: sql,
        params: params
    };

    db.select(sqlData, function (err, results) {
        if (err) {
            console.log(results);
        } else {
            var result = []; //查询1的结果
            for (var i = 0; i < results.length; i++) {
                result.push({
                    "driver": results[i][0].value || '',
                    "station": results[i][1].value || '',
                    "outCars": results[i][2].value || 0,
                    "avgOutCarTime": results[i][3].value || 0,
                    "avgArriveSpotTime": results[i][4].value || 0
                });
            }
            for (var j = 0; j < result.length; j++) {
                result[j].avgArriveHosTime = util.formatSecond(result[j].avgArriveHosTime);
                result[j].avgArriveSpotTime = util.formatSecond(result[j].avgArriveSpotTime);
            }

            res.json(result);
        }

    });
};

/**
 * 暂停调用流水表
 * @param req
 * @param res
 */
exports.getPauseFlow = function (req, res) {
    var startTime = req.body.startTime;
    var endTime = req.body.endTime;
    var params = [{"name": "startTime", "value": startTime, "type": "varchar"}, {
        "name": "endTime", "value": endTime, "type": "varchar"
    }];
    var sql;
    sql = "select s.分站名称,am.实际标识 carCode,convert(varchar(20),rpr.操作时刻,120) 开始,convert(varchar(20),rpr.结束时刻,120) 结束,    " +
        "rpr.暂停调用原因 pauseReason,m.姓名,mm.姓名 恢复人,isnull(DATEDIFF(Second,rpr.操作时刻,rpr.结束时刻),0) pauseTimes,rpr.备注    " +
        "from AuSp120.tb_RecordPauseReason rpr	left outer join AuSp120.tb_Ambulance am on am.车辆编码=rpr.车辆编码    " +
        "left outer join AuSp120.tb_MrUser m on rpr.调度员编码=m.工号    left outer join AuSp120.tb_MrUser mm on rpr.操作人编码=mm.工号    " +
        "left outer join ausp120.tb_Station s on s.分站编码=rpr.分站编码    left outer join AuSp120.tb_DPauseReason dpr on dpr.NameM=rpr.暂停调用原因    " +
        "where rpr.操作时刻 between @startTime and @endTime    union    " +
        "select s.分站名称,am.实际标识 carCode,'小计' 开始,'' 结束,'' pauseReason,'' 姓名,'' 恢复人,SUM(DATEDIFF(Second,rpr.操作时刻,rpr.结束时刻)) pauseTimes,'' 备注    " +
        "from AuSp120.tb_RecordPauseReason rpr	left outer join AuSp120.tb_Ambulance am on am.车辆编码=rpr.车辆编码    " +
        "left outer join ausp120.tb_Station s on s.分站编码=rpr.分站编码 where rpr.操作时刻 between  @startTime and @endTime    group by s.分站名称,am.实际标识   ";
    var sqlData = {
        statement: sql,
        params: params
    };
    db.select(sqlData, function (err, results) {
        if (err) {
            console.log(results);
        } else {
            var result = []; //查询1的结果
            for (var i = 0; i < results.length; i++) {
                result.push({
                    "station": results[i][0].value || '',
                    "carIdentification": results[i][1].value || '',
                    "startTime": results[i][2].value || '',
                    "endTime": results[i][3].value || '',
                    "pauseReason": results[i][4].value || '',
                    "operatePerson": results[i][5].value || '',
                    "restorePerson": results[i][6].value || '',
                    "pauseTimes": results[i][7].value || '',
                    "remark": results[i][8].value || ''
                });
            }
            for (var j = 0; j < result.length; j++) {
                result[j].pauseTimes = util.formatSecond(result[j].pauseTimes);
            }
            res.json(result);
        }

    });
};

/**
 * 暂停调用统计表
 * @param req
 * @param res
 */
exports.getPauseStatistics = function (req, res) {
    var startTime = req.body.startTime;
    var endTime = req.body.endTime;
    var params = [{"name": "startTime", "value": startTime, "type": "varchar"}, {
        "name": "endTime", "value": endTime, "type": "varchar"
    }];
    var sql;
    sql = "select s.分站名称,rpr.司机,COUNT(*) 暂停次数,max(isnull(DATEDIFF(Second,rpr.操作时刻,rpr.结束时刻),0)) 最长,    " +
        "sum(isnull(DATEDIFF(Second,rpr.操作时刻,rpr.结束时刻),0)) 总暂停,avg(isnull(DATEDIFF(Second,rpr.操作时刻,rpr.结束时刻),0)) 平均暂停    " +
        "from AuSp120.tb_RecordPauseReason rpr	left outer join AuSp120.tb_Ambulance am on am.车辆编码=rpr.车辆编码    " +
        "left outer join ausp120.tb_Station s on s.分站编码=rpr.分站编码    where rpr.操作时刻 between @startTime and @endTime    group by s.分站名称,rpr.司机    " +
        "union    select '合计' 分站名称,'合计' 司机,COUNT(*) 暂停次数,max(isnull(DATEDIFF(Second,rpr.操作时刻,rpr.结束时刻),0)) 最长,        " +
        "sum(isnull(DATEDIFF(Second,rpr.操作时刻,rpr.结束时刻),0)) 总暂停,avg(isnull(DATEDIFF(Second,rpr.操作时刻,rpr.结束时刻),0)) 平均暂停    " +
        "from AuSp120.tb_RecordPauseReason rpr	left outer join AuSp120.tb_Ambulance am on am.车辆编码=rpr.车辆编码    " +
        "left outer join ausp120.tb_Station s on s.分站编码=rpr.分站编码 where rpr.操作时刻 between @startTime and @endTime  ";
    var sqlData = {
        statement: sql,
        params: params
    };
    db.select(sqlData, function (err, results) {
        if (err) {
            console.log(results);
        } else {
            var result = []; //查询1的结果
            for (var i = 0; i < results.length; i++) {
                result.push({
                    "station": results[i][0].value || '',
                    "driver": results[i][1].value || '',
                    "pauseTimes": results[i][2].value || 0,
                    "maxTimes": results[i][3].value || 0,
                    "sumTimes": results[i][4].value || 0,
                    "avgTimes": results[i][5].value || 0
                });
            }
            for (var j = 0; j < result.length; j++) {
                result[j].maxTimes = util.formatSecond(result[j].maxTimes);
                result[j].sumTimes = util.formatSecond(result[j].sumTimes);
                result[j].avgTimes = util.formatSecond(result[j].avgTimes);
            }
            res.json(result);
        }

    });
};

/**
 * 挂起流水表
 * @param req
 * @param res
 */
exports.getHungEventFlow = function (req, res) {
    var startTime = req.body.startTime;
    var endTime = req.body.endTime;
    var dispatcher = req.body.dispatcher;
    var params = [{"name": "startTime", "value": startTime, "type": "varchar"}, {
        "name": "endTime", "value": endTime, "type": "varchar"
    }, {
        "name": "dispatcher", "value": dispatcher, "type": "varchar"
    }];
    var sql;
    sql = "select CONVERT(varchar(20),a.开始受理时刻,120),CONVERT(varchar(20),a.结束受理时刻,120),et.NameM,e.事件来源,    " +
        "dls.NameM,dhr.NameM,a.患者姓名,a.性别,a.年龄,a.呼救电话,a.初步判断,a.现场地址,t.送往地点,m.姓名,    case when a.撤消原因编码 is null then '唤醒待派' " +
        "when a.类型编码 in (2,4) then dr.NameM  end    from ausp120.tb_EventV e left outer join ausp120.tb_AcceptDescriptV a on a.事件编码=e.事件编码    " +
        "left outer join ausp120.tb_TaskV t on a.受理序号=t.受理序号 and a.事件编码=t.事件编码    left outer join ausp120.tb_DEventType et on et.Code=e.事件类型编码   " +
        "left outer join ausp120.tb_DLinkSource dls on dls.Code=e.联动来源编码    left outer join ausp120.tb_DHangReason dhr on dhr.Code=a.挂起原因编码    " +
        "left outer join ausp120.tb_MrUser m on m.工号=a.调度员编码    " +
        "left outer join ausp120.tb_DDropReason dr on dr.Code=a.撤消原因编码    where e.事件性质编码=1 and a.类型编码 in (2,4) " +
        "and a.开始受理时刻 between @startTime and @endTime  ";
    if (!string.isBlankOrEmpty(dispatcher)) {
        sql += ' and a.调度员编码=@dispatcher';
    }
    sql += ' order by a.开始受理时刻';
    var sqlData = {
        statement: sql,
        params: params
    };
    db.select(sqlData, function (err, results) {
        if (err) {
            console.log(results);
        } else {
            var result = []; //查询1的结果
            for (var i = 0; i < results.length; i++) {
                result.push({
                    "startTime": results[i][0].value || '',
                    "endTime": results[i][1].value || '',
                    "eventType": results[i][2].value || '',
                    "eventSource": results[i][3].value || '',
                    "eventLink": results[i][4].value || '',
                    "HungReason": results[i][5].value || '',
                    "patientName": results[i][6].value || '',
                    "sex": results[i][7].value || '',
                    "age": results[i][8].value || '',
                    "alarmPhone": results[i][9].value || '',
                    "phoneJudge": results[i][10].value || '',
                    "localAddr": results[i][11].value || '',
                    "sendAddr": results[i][12].value || '',
                    "dispatcher": results[i][13].value || '',
                    "hungResult": results[i][14].value || ''
                });
            }
            res.json(result);
        }

    });
};

/**
 * 待派处理情况统计表
 * @param req
 * @param res
 */
exports.getHungEventHandle = function (req, res) {
    var startTime = req.body.startTime;
    var endTime = req.body.endTime;
    var dispatcher = req.body.dispatcher;
    var params = [{"name": "startTime", "value": startTime, "type": "varchar"}, {
        "name": "endTime", "value": endTime, "type": "varchar"
    }, {
        "name": "dispatcher", "value": dispatcher, "type": "varchar"
    }];
    var sql;
    sql = "select SUM(case when a.撤消原因编码 is null then 1 else 0 end),SUM(case when a.撤消原因编码=1 then 1 else 0 end),    " +
        "SUM(case when a.撤消原因编码=2 then 1 else 0 end),SUM(case when a.撤消原因编码 not in (1,2) then 1 else 0 end),COUNT(*)    " +
        "from ausp120.tb_EventV e left outer join ausp120.tb_AcceptDescriptV a on a.事件编码=e.事件编码    left outer join ausp120.tb_MrUser m on m.工号=a.调度员编码    " +
        "where e.事件性质编码=1 and a.类型编码 in (2,4) and a.开始受理时刻 between @startTime and @endTime  ";
    if (!string.isBlankOrEmpty(dispatcher)) {
        sql += ' and a.调度员编码=@dispatcher';
    }

    var sqlData = {
        statement: sql,
        params: params
    };
    db.select(sqlData, function (err, results) {
        if (err) {
            console.log(results);
        } else {
            var result = []; //查询1的结果
            for (var i = 0; i < results.length; i++) {
                result.push({
                    "wake": results[i][0].value || 0,
                    "dropTask": results[i][1].value || 0,
                    "backCar": results[i][2].value || 0,
                    "other": results[i][3].value || 0,
                    "total": results[i][4].value || 0
                });
            }
            res.json(result);
        }

    });
};

/**
 * 摘机时长流水表
 * @param req
 * @param res
 */
exports.getHookTimeFlow = function (req, res) {
    var startTime = req.body.startTime;
    var endTime = req.body.endTime;
    var params = [{"name": "startTime", "value": startTime, "type": "varchar"}, {
        "name": "endTime", "value": endTime, "type": "varchar"
    }];
    var sql;
    sql = "select dtrt.NameM,tr.电话号码,CONVERT(varchar(120),tr.产生时刻,120),tr.座席号,m.姓名,CONVERT(varchar(120),tr.振铃时刻,120),    " +
        "CONVERT(varchar(120),tr.通话开始时刻,120),CONVERT(varchar(120),tr.挂断时刻,120),DATEDIFF(S,tr.振铃时刻,tr.通话开始时刻),dtr.NameM    " +
        "from ausp120.tb_TeleRecordV tr    left outer join ausp120.tb_DTeleRecordResult dtr on dtr.Code=tr.结果编码    " +
        "left outer join ausp120.tb_DTeleRecordType dtrt on dtrt.Code=tr.记录类型编码    left outer join ausp120.tb_MrUser m on m.工号=tr.调度员编码    " +
        "where tr.产生时刻      between @startTime and @endTime  order by tr.产生时刻";

    var sqlData = {
        statement: sql,
        params: params
    };
    db.select(sqlData, function (err, results) {
        if (err) {
            console.log(results);
        } else {
            var result = []; //查询1的结果
            for (var i = 0; i < results.length; i++) {
                result.push({
                    "project": results[i][0].value || '',
                    "alarmPhone": results[i][1].value || '',
                    "produceTime": results[i][2].value || '',
                    "tableNo": results[i][3].value || '',
                    "dispatcher": results[i][4].value || '',
                    "ringTime": results[i][5].value || '',
                    "startTime": results[i][6].value || '',
                    "endTime": results[i][7].value || '',
                    "hungDuration": results[i][8].value || 0,
                    "result": results[i][9].value || ''
                });
            }
            for (var j = 0; j < result.length; j++) {
                result[j].hungDuration = util.formatSecond(result[j].hungDuration);
            }
            res.json(result);
        }
    });
};

/**
 * 受理人员摘机速度统计报表
 * @param req
 * @param res
 */
exports.getHookSpeedStatistics = function (req, res) {
    var startTime = req.body.startTime;
    var endTime = req.body.endTime;
    var params = [{"name": "startTime", "value": startTime, "type": "varchar"}, {
        "name": "endTime", "value": endTime, "type": "varchar"
    }];

    var sqlBatch = [];
    var sql;
    sql = "select m.姓名,AVG(ISNULL(datediff(S,振铃时刻,通话开始时刻),0)) 平均摘机时间     from ausp120.tb_TeleRecordV tr left outer join ausp120.tb_MrUser m on m.工号=tr.调度员编码    " +
        "where 调度员编码 is not null and 调度员编码<>'' and m.姓名<>'' and m.人员类型=0 and tr.产生时刻 between @startTime and @endTime  group by m.姓名";
    var sqlData = {
        statement: sql,
        params: params
    };
    sqlBatch.push(sqlData);
    sql = "select '平均摘机时间' avg,AVG(ISNULL(datediff(S,振铃时刻,通话开始时刻),0)) 平均摘机时间     from ausp120.tb_TeleRecordV tr left outer join ausp120.tb_MrUser m on m.工号=tr.调度员编码    " +
        "where 调度员编码 is not null and 调度员编码<>'' and m.姓名<>'' and m.人员类型=0 and tr.产生时刻 between @startTime and @endTime ";
    sqlBatch.push({
        statement: sql,
        params: params
    });

    db.selectSerial(sqlBatch, function (err, results) {
        if (err) {
            console.log(results);
        } else {
            var result = []; //查询1的结果
            var data;
            for (var j = 0; j < results.length; j++) {
                if (j == 0) {
                    data = results[j];
                    for (var i = 0; i < data.length; i++) {
                        result.push({
                            "username": data[i][0].value || '',
                            "avgTime": data[i][1].value || 0
                        });
                    }
                }//end
                if (j == 1) {
                    data = results[j];
                    for (var i = 0; i < data.length; i++) {
                        result.push({
                            "username": data[i][0].value || '',
                            "avgTime": data[i][1].value || 0
                        });
                    }
                }//end
            }

            res.json(result);
        }
    });
};

/**
 * 调度员工作量统计
 * @param req
 * @param res
 */
exports.getDispatcherWorkload = function (req, res) {
    var startTime = req.body.startTime;
    var endTime = req.body.endTime;
    var params = [{"name": "startTime", "value": startTime, "type": "varchar"}, {
        "name": "endTime", "value": endTime, "type": "varchar"
    }];
    var sqlBatch = [];
    var sql;
    sql = "select 调度员编码,SUM(case when 记录类型编码 in (1,2,3,5,8) then 1 else 0 end) 接电话数,AVG(ISNULL(datediff(S,通话开始时刻,挂断时刻),0)) 平均受理时间 into #tr   " +
        "from ausp120.tb_TeleRecordV where 调度员编码 is not null and 调度员编码<>'' and 产生时刻 between @startTime and @endTime  group by 调度员编码    " +
        "select a.调度员编码,COUNT(*) 受理数,SUM(case when a.类型编码 not in (2,4) then 1 else 0 end) 有效受理数, SUM(case when e.联动来源编码=2 then 1 else 0 end) 受理110," +
        "AVG(ISNULL(datediff(S,a.开始受理时刻,a.派车时刻),0)) 平均派车    into #ac from ausp120.tb_EventV e " +
        "left outer join ausp120.tb_AcceptDescriptV a on a.事件编码=e.事件编码    where e.事件性质编码=1 and a.开始受理时刻 between @startTime and @endTime   group by a.调度员编码    " +
        "select ac.调度员编码,m.姓名,tr.接电话数,ac.受理数,ac.有效受理数,ac.受理110,tr.平均受理时间,ac.平均派车,'' 受理比例    " +
        "from #ac ac left outer join #tr tr on ac.调度员编码=tr.调度员编码    left outer join ausp120.tb_MrUser m on ac.调度员编码=m.工号    drop table #tr,#ac";
    var sqlData = {
        statement: sql,
        params: params
    };
    sqlBatch.push(sqlData);

    sql = "select '合计' 调度员编码,SUM(case when 记录类型编码 in (1,2,3,5,8) then 1 else 0 end) 接电话数,AVG(ISNULL(datediff(S,通话开始时刻,挂断时刻),0)) 平均受理时间 into #tr   " +
        "from ausp120.tb_TeleRecordV where 调度员编码 is not null and 调度员编码<>'' and 产生时刻 between @startTime and @endTime      " +
        "select '合计' 调度员编码,COUNT(*) 受理数,SUM(case when a.类型编码 not in (2,4) then 1 else 0 end) 有效受理数, SUM(case when e.联动来源编码=2 then 1 else 0 end) 受理110," +
        "AVG(ISNULL(datediff(S,a.开始受理时刻,a.派车时刻),0)) 平均派车    into #ac from ausp120.tb_EventV e " +
        "left outer join ausp120.tb_AcceptDescriptV a on a.事件编码=e.事件编码    where e.事件性质编码=1 and a.开始受理时刻 between @startTime and @endTime     " +
        "select '合计' 调度员编码,'合计' 姓名,tr.接电话数,ac.受理数,ac.有效受理数,ac.受理110,tr.平均受理时间,ac.平均派车,'' 受理比例    " +
        "from #ac ac left outer join #tr tr on ac.调度员编码=tr.调度员编码       drop table #tr,#ac";
    sqlBatch.push({
        statement: sql,
        params: params
    });

    db.selectSerial(sqlBatch, function (err, results) {
        if (err) {
            console.log(results);
        } else {
            var result = []; //查询1的结果
            var data;
            for (var j = 0; j < results.length; j++) {
                if (j == 0) {//结果1
                    data = results[j];
                    for (var i = 0; i < data.length; i++) {
                        result.push({
                            "userId": data[i][0].value || '',
                            "username": data[i][1].value || '',
                            "phones": data[i][2].value || 0,
                            "acceptNumbers": data[i][3].value || 0,
                            "validAcceptNumbers": data[i][4].value || 0,
                            "acceptNumbers110": data[i][5].value || 0,
                            "avgAcceptTime": data[i][6].value || 0,
                            "avgSendCarTime": data[i][7].value || 0,
                            "ratio": data[i][8].value || ''
                        });
                    }
                }//end结果1
                if (j == 1) {//结果2
                    data = results[j];
                    for (var i = 0; i < data.length; i++) {
                        result.push({
                            "userId": data[i][0].value || '',
                            "username": data[i][1].value || '',
                            "phones": data[i][2].value || 0,
                            "acceptNumbers": data[i][3].value || 0,
                            "validAcceptNumbers": data[i][4].value || 0,
                            "acceptNumbers110": data[i][5].value || 0,
                            "avgAcceptTime": data[i][6].value || 0,
                            "avgSendCarTime": data[i][7].value || 0,
                            "ratio": data[i][8].value || ''
                        });
                    }
                }//end结果2
            }

            for (var j = 0; j < result.length; j++) {
                result[j].avgAcceptTime = util.formatSecond(result[j].avgAcceptTime);
                result[j].avgSendCarTime = util.formatSecond(result[j].avgSendCarTime);
                result[j].ratio = util.calculateRate(result[j].acceptNumbers, result[j].validAcceptNumbers);
            }
            res.json(result);
        }
    });
};

/**
 * 调度员工作效率统计
 * @param req
 * @param res
 */
exports.getDispatcherWorkEfficiency = function (req, res) {
    var startTime = req.body.startTime;
    var endTime = req.body.endTime;
    var params = [{"name": "startTime", "value": startTime, "type": "varchar"}, {
        "name": "endTime", "value": endTime, "type": "varchar"
    }];
    var sqlBatch = [];
    var sql;
    sql = "select 调度员编码,AVG(ISNULL(datediff(S,振铃时刻,通话开始时刻),0)) 平均摘机时间,    AVG(ISNULL(datediff(S,通话开始时刻,挂断时刻),0)) 平均受理时间 into #tr    " +
        "from ausp120.tb_TeleRecordV where 调度员编码 is not null and 调度员编码<>'' and 产生时刻  between @startTime and @endTime  group by 调度员编码    " +
        "select a.调度员编码,SUM(case when a.类型编码 not in (2,4) then 1 else 0 end) 有效派车,SUM(case when datediff(S,a.开始受理时刻,a.结束受理时刻) <=60 then 1 else 0 end) 小于等于1分钟,        " +
        "SUM(case when datediff(S,a.开始受理时刻,a.结束受理时刻) >60 then 1 else 0 end) 大于1分钟    into #ac from ausp120.tb_EventV e left outer join ausp120.tb_AcceptDescriptV a on a.事件编码=e.事件编码    " +
        "where e.事件性质编码=1 and a.类型编码 not in (2,4) and a.开始受理时刻 between @startTime and @endTime   group by a.调度员编码    " +
        "select ac.调度员编码,m.姓名,ac.有效派车,tr.平均摘机时间,tr.平均受理时间,ac.小于等于1分钟,'' ratio1,ac.大于1分钟,'' ratio2    " +
        "from #ac ac left outer join #tr tr on ac.调度员编码=tr.调度员编码    left outer join ausp120.tb_MrUser m on ac.调度员编码=m.工号    drop table #tr,#ac";
    var sqlData = {
        statement: sql,
        params: params
    };
    sqlBatch.push(sqlData);

    sql = "select '合计' 调度员编码,AVG(ISNULL(datediff(S,振铃时刻,通话开始时刻),0)) 平均摘机时间,    AVG(ISNULL(datediff(S,通话开始时刻,挂断时刻),0)) 平均受理时间 into #tr    " +
        "from ausp120.tb_TeleRecordV where 调度员编码 is not null and 调度员编码<>'' and 产生时刻  between @startTime and @endTime     " +
        "select '合计' 调度员编码,SUM(case when a.类型编码 not in (2,4) then 1 else 0 end) 有效派车,SUM(case when datediff(S,a.开始受理时刻,a.结束受理时刻) <=60 then 1 else 0 end) 小于等于1分钟,        " +
        "SUM(case when datediff(S,a.开始受理时刻,a.结束受理时刻) >60 then 1 else 0 end) 大于1分钟    into #ac from ausp120.tb_EventV e left outer join ausp120.tb_AcceptDescriptV a on a.事件编码=e.事件编码    " +
        "where e.事件性质编码=1 and a.类型编码 not in (2,4) and a.开始受理时刻 between @startTime and @endTime       " +
        "select '合计' 调度员编码,'合计' 姓名,ac.有效派车,tr.平均摘机时间,tr.平均受理时间,ac.小于等于1分钟,'' ratio1,ac.大于1分钟,'' ratio2    " +
        "from #ac ac left outer join #tr tr on ac.调度员编码=tr.调度员编码    left outer join ausp120.tb_MrUser m on ac.调度员编码=m.工号    drop table #tr,#ac";
    sqlBatch.push({
        statement: sql,
        params: params
    });

    db.selectSerial(sqlBatch, function (err, results) {
        if (err) {
            console.log(results);
        } else {
            var result = []; //查询1的结果
            var data;
            for (var j = 0; j < results.length; j++) {
                if (j == 0) {//结果1
                    data = results[j];
                    for (var i = 0; i < data.length; i++) {
                        result.push({
                            "userId": data[i][0].value || '',
                            "username": data[i][1].value || '',
                            "validSendCars": data[i][2].value || 0,
                            "avgOffhook": data[i][3].value || 0,
                            "avgAcceptTime": data[i][4].value || 0,
                            "acceptTimeLess1": data[i][5].value || 0,
                            "acceptTimeLess1Ratio": data[i][6].value || 0,
                            "acceptTimeMore1": data[i][7].value || 0,
                            "acceptTimeMore1Ratio": data[i][8].value || ''
                        });
                    }
                }//end结果1
                if (j == 1) {//结果2
                    data = results[j];
                    for (var i = 0; i < data.length; i++) {
                        result.push({
                            "userId": data[i][0].value || '',
                            "username": data[i][1].value || '',
                            "validSendCars": data[i][2].value || 0,
                            "avgOffhook": data[i][3].value || 0,
                            "avgAcceptTime": data[i][4].value || 0,
                            "acceptTimeLess1": data[i][5].value || 0,
                            "acceptTimeLess1Ratio": data[i][6].value || 0,
                            "acceptTimeMore1": data[i][7].value || 0,
                            "acceptTimeMore1Ratio": data[i][8].value || ''
                        });
                    }
                }//end结果2
            }

            for (var j = 0; j < result.length; j++) {
                result[j].avgOffhook = util.formatSecond(result[j].avgOffhook);
                result[j].avgAcceptTime = util.formatSecond(result[j].avgAcceptTime);
                result[j].acceptTimeLess1Ratio = util.calculateRate(result[j].validSendCars, result[j].acceptTimeLess1);
                result[j].acceptTimeMore1Ratio = util.calculateRate(result[j].validSendCars, result[j].acceptTimeMore1);
            }
            res.json(result);
        }
    });
};