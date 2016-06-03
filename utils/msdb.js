/**
 * Created by Dell on 2016/3/25.
 */
var connectionConfig = require('../config/sql.json'); //加载连接配置

var ConnectionPool = require('tedious-connection-pool');
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
var async = require('async');

var poolConfig = {
    min: 2,
    max: 10,
    log: true
};

var pool = new ConnectionPool(poolConfig, connectionConfig);
//	执行查询
exports.select = function (trans, callback) {

    //acquire a connection
    pool.acquire(function (err, connection) {
        if (err) {
            console.error('sqlsever 链接失败!');
            return callback(true, '数据库连接失败!' + err);
        }
        console.log("数据库连接成功!");
        var result = [];
        //use the connection as normal
        var request = new Request(trans.statement, function (err, rowCount) {
            if (err) {
                console.error(err);
                connection.release();
                return callback(true, '执行操作失败!!' + err);
            }
            //release the connection back to the pool when finished
            connection.release();
            console.log('rowCount: ' + rowCount);
            callback(null, result);
        });

        //添加参数
        for (i = 0; i < trans.params.length; i++) {
            var data = trans.params[i];
            request.addParameter(data.name, TYPES.NVarChar, data.value);
        }

        request.on('row', function (columns) {
            result.push(columns);
        });
        connection.execSql(request);
    });
    pool.on('error', function (err) {
        console.error(err);
    });
};

/**
 * 串行批量查询
 * @param trans
 * @param callback
 */
exports.selectSerial = function (trans, callback) {
    //acquire a connection
    pool.acquire(function (err, connection) {
        if (err) {
            console.error('sqlsever 链接失败!');
            return callback(true, '数据库连接失败!' + err);
        }
        //开启事务
        connection.beginTransaction(function (err) {
            if (err) {
                console.log('sql beginTransaction err:' + err);
                connection.release();
                return callback(true, err);
            }
            var data = [];
            async.eachSeries(trans, function (item, cb) {
                //use the connection as normal
                var result = []; //每次查询出的结果
                var request = new Request(item.statement, function (err, rowCount) {
                    if (err) {
                        console.error(err);
                        cb(err);
                    }
                    data.push(result);
                    cb();
                });
                //添加参数
                for (i = 0; i < item.params.length; i++) {
                    var pm = item.params[i];
                    request.addParameter(pm.name, TYPES.NVarChar, pm.value);
                }

                request.on('row', function (columns) {
                    result.push(columns);
                });

                connection.execSql(request);
            }, function (err) {
                if (err) {
                    connection.rollbackTransaction(function (err) {
                        console.log('star rollback');
                        if (err) {
                            connection.release();
                            console.log('回滚失败');
                            callback(true, '回滚失败-' + err);
                        }
                    });
                } else {
                    connection.commitTransaction(function (err) {
                        if (err) {
                            connection.rollbackTransaction(function (err) {
                                callback(true, '回滚失败-' + err);
                            });
                        }
                    });
                    callback(err, data);
                }
                connection.release();
            });
        });

    });
    pool.on('error', function (err) {
        console.error(err);
    });
};

/**
 * 修改、插入、删除
 * @param trans
 * @param callback
 */
exports.change = function (trans, callback) {
    //acquire a connection
    pool.acquire(function (err, connection) {
        if (err) {
            console.error('sqlsever 链接失败!');
            return callback(true, '数据库连接失败!' + err);
        }
        console.log("数据库连接成功!");
        //use the connection as normal
        var request = new Request(trans.statement, function (err, rowCount) {
            if (err) {
                console.error(err);
                connection.release();
                return callback(true, '操作失败!!' + err);
            }
            console.log('改变行数 : ' + rowCount);
            //release the connection back to the pool when finished
            connection.release();
            callback(null, rowCount);
        });
        //添加参数
        for (i = 0; i < trans.params.length; i++) {
            var data = trans.params[i];
            switch (data.type) {
                case "tinyint":
                    request.addParameter(data.name, TYPES.TinyInt, data.value);
                    break;
                case "char":
                    request.addParameter(data.name, TYPES.Char, data.value);
                    break;
                case "int":
                    request.addParameter(data.name, TYPES.Int, data.value);
                    break;
                case "money":
                    request.addParameter(data.name, TYPES.Money, data.value);
                    break;
                default :
                    request.addParameter(data.name, TYPES.NVarChar, data.value);
            }
        }

        connection.execSql(request);
    });
    pool.on('error', function (err) {
        console.error(err);
    });
};
/**
 * 批量操作
 * @param trans
 * @param callback
 */
exports.changeSeries = function (trans, callback) {
    //acquire a connection
    pool.acquire(function (err, connection) {
        if (err) {
            console.error('sqlsever 链接失败!');
            return callback(true, '数据库连接失败!' + err);
        }
        //开启事务
        connection.beginTransaction(function (err) {
            if (err) {
                console.log('sql beginTransaction err:' + err);
                connection.release();
                return callback(true, err);
            }
            var result = [];
            async.eachSeries(trans, function (item, cb) {
                //use the connection as normal
                var request = new Request(item.statement, function (err, rowCount) {
                    if (err) {
                        console.error(err);
                        return cb(err);
                    }
                    result.push(rowCount);
                    cb();
                });
                //添加参数
                for (i = 0; i < item.params.length; i++) {
                    var data = item.params[i];
                    switch (data.type) {
                        case "tinyint":
                            request.addParameter(data.name, TYPES.TinyInt, data.value);
                            break;
                        case "char":
                            request.addParameter(data.name, TYPES.Char, data.value);
                            break;
                        case "int":
                            request.addParameter(data.name, TYPES.Int, data.value);
                            break;
                        case "money":
                            request.addParameter(data.name, TYPES.Money, data.value);
                            break;
                        default :
                            request.addParameter(data.name, TYPES.NVarChar, data.value);
                    }
                }

                connection.execSql(request);
            }, function (err) {
                if (err) {
                    connection.rollbackTransaction(function (err) {
                        console.log('star rollback');
                        connection.release();
                        console.log('回滚失败');
                        callback(true, '回滚失败-' + err);
                    });
                } else {
                    connection.commitTransaction(function (err) {
                        if (err) {
                            connection.rollbackTransaction(function (err) {
                                callback(true, '回滚失败-' + err);
                            });
                        }
                    });
                    callback(err, result);
                }
                connection.release();
            });
        });

    });
    pool.on('error', function (err) {
        console.error(err);
    });
};

