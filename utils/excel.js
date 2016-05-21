/**
 * Created by Dell on 2015/9/14.
 */
var fs = require('fs');

var officegen = require('officegen');


exports.exportExcel = function (config, datas, res) {

    var filename = config.fileName + '.xlsx';

    res.writeHead(200, {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-disposition': 'attachment; filename=' + encodeURI(filename)
    });

    var xlsx = officegen('xlsx');

    xlsx.on('finalize', function (written) {
        console.log('Finish to create an Excel file.\nTotal bytes created: ' + written + '\n');
    });

    xlsx.on('error', function (err) {
        console.log(err);
    });
    
    sheet = xlsx.makeNewSheet();
    sheet.name = config.name;
    sheet.data = datas;

    res.charset = 'UTF-8';


    xlsx.generate(res);// 客户端导出excel

}


