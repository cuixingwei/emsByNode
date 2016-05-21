var CONFIG = require('../config/mysql.json');
var mysql = require('mysql');
var async = require('async');

var options = {
    'host': CONFIG.HOST,
    'port': CONFIG.PORT,
    'user': CONFIG.USER,
    'password': CONFIG.PASSWORD,
    'database': CONFIG.DATABASE,
    'connectionLimit': CONFIG.CONNECT,
    'supportBigNumbers': true,
    'bigNumberStrings': true,
    'timezone': 'local',
    'dateStrings': true,
    'charset': 'utf8'
};

//	数据库连接池
var pool = mysql.createPool(options);

//	执行查询
exports.select = function (trans, callback) {
    // 从链接池里得到connection
    this.getConnection(function (err, connection) {
        if (err) {
            console.error('mysql 链接失败');
            connection.release();
            return callback(true, '数据库连接失败！' + err);
        }

        var data = [];
        async.each(trans, function (item, cb) {
            var query = connection.query(item.statement, item.params, function (error, result) {
                if (trans.length > 1) {
                    data.push(result)
                } else {
                    data = result;
                }
                cb();
            });
            console.log(query.sql)
        }, function (err) {
            connection.release();
            callback(null, data)
        })
    });

}.bind(pool);

exports.querySeries = function (trans, callback) {
    // 从链接池里得到connection
    this.getConnection(function (err, connection) {
        if (err) {
            console.error('mysql 链接失败');
            connection.release();
            return callback(true, '数据库连接失败！' + err);
        }
        // 开始事务
        connection.beginTransaction(function (err) {
            if (err) {
                console.error('mysql beginTransaction error' + err);
                connection.release();
                return callback(true, err);
            }
            var data = [];
            async.eachSeries(trans, function (item, cb) {
                var query = connection.query(item.statement, item.params, function (error, result) {
                    if (error) {
                        cb(error)
                    } else {
                        data.push(result)

                        cb();
                    }
                });
                console.log(query.sql)
            }, function (err) {
                if (err) {
                    connection.rollback(function () {
                        console.log('star rollback')
                        callback(true, '回滚失败-' + err);
                    });
                } else {
                    connection.commit(function (err) {
                        if (err) {
                            connection.rollback(function () {
                                callback(true, '回滚失败-' + err);
                            });
                        }
                        callback(err, data)

                    });

                }
                connection.release();

            })

        });
    });
}.bind(pool);
exports.queryParallel = function (trans, callback) {
    // 从链接池里得到connection
    this.getConnection(function (err, connection) {
        if (err) {
            console.error('mysql 链接失败');
            connection.release();
            return callback(true, '数据库连接失败！' + err);
        }
        // 开始事务
        connection.beginTransaction(function (err) {
            if (err) {
                console.error('mysql beginTransaction error' + err);
                connection.release();
                return callback(true, err);
            }
            var data = [];
            async.each(trans, function (item, cb) {
                var query = connection.query(item.statement, item.params, function (error, result) {
                    if (error) {
                        cb(error)
                    } else {
                        data.push(result)
                        cb();
                    }
                });
                console.log(query.sql)
            }, function (err) {
                if (err) {
                    connection.rollback(function () {
                        console.log('star rollback')
                        callback(true, '回滚失败-' + err);
                    });
                } else {

                    connection.commit(function (err) {
                        if (err) {
                            connection.rollback(function () {
                                callback(true, '回滚失败-' + err);
                            });
                        }
                        callback(err, data)

                    });

                }
                connection.release();

            })

        });
    });
}.bind(pool);