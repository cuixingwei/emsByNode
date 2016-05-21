var cxw = cxw || {};

/**
 * 更改easyui加载panel时的提示文字
 *
 * @author 崔兴伟
 *
 * @requires jQuery,EasyUI
 */
$.extend($.fn.panel.defaults, {
    loadingMessage: '加载中....'
});

/**
 * 更改easyui加载grid时的提示文字
 *
 * @author 崔兴伟
 *
 * @requires jQuery,EasyUI
 */
$.extend($.fn.datagrid.defaults, {
    loadMsg: '数据加载中....'
});

/**
 * panel关闭时回收内存，主要用于layout使用iframe嵌入网页时的内存泄漏问题
 *
 * @author 崔兴伟
 *
 * @requires jQuery,EasyUI
 *
 */
$.extend($.fn.panel.defaults, {
    onBeforeDestroy: function () {
        var frame = $('iframe', this);
        try {
            if (frame.length > 0) {
                for (var i = 0; i < frame.length; i++) {
                    frame[i].src = '';
                    frame[i].contentWindow.document.write('');
                    frame[i].contentWindow.close();
                }
                frame.remove();
                if (navigator.userAgent.indexOf("MSIE") > 0) {// IE特有回收内存方法
                    try {
                        CollectGarbage();
                    } catch (e) {
                    }
                }
            }
        } catch (e) {
        }
    }
});


/**
 * 扩展validatebox，添加新的验证功能
 *
 * @author 崔兴伟
 *
 * @requires jQuery,EasyUI
 */
$.extend($.fn.validatebox.defaults.rules, {
    eqPwd: {
        /* 验证两次密码是否一致功能 */
        validator: function (value, param) {
            return value == $(param[0]).val();
        },
        message: '密码不一致！'
    }
});

/**
 * 扩展tree和combotree，使其支持平滑数据格式
 *
 * @author 崔兴伟
 *
 * @requires jQuery,EasyUI
 *
 */
cxw.loadFilter = {
    loadFilter: function (data, parent) {
        var opt = $(this).data().tree.options;
        var idField, textField, parentField;
        if (opt.parentField) {
            idField = opt.idField || 'id';
            textField = opt.textField || 'text';
            parentField = opt.parentField || 'pid';
            var i, l, treeData = [], tmpMap = [];
            for (i = 0, l = data.length; i < l; i++) {
                tmpMap[data[i][idField]] = data[i];
            }
            for (i = 0, l = data.length; i < l; i++) {
                if (tmpMap[data[i][parentField]]
                    && data[i][idField] != data[i][parentField]) {
                    if (!tmpMap[data[i][parentField]]['children'])
                        tmpMap[data[i][parentField]]['children'] = [];
                    data[i]['text'] = data[i][textField];
                    tmpMap[data[i][parentField]]['children'].push(data[i]);
                } else {
                    data[i]['text'] = data[i][textField];
                    treeData.push(data[i]);
                }
            }
            return treeData;
        }
        return data;
    }
};
$.extend($.fn.combotree.defaults, cxw.loadFilter);
$.extend($.fn.tree.defaults, cxw.loadFilter);

/**
 * 扩展treegrid，使其支持平滑数据格式
 *
 * @author 崔兴伟
 *
 * @requires jQuery,EasyUI
 *
 */
$.extend($.fn.treegrid.defaults, {
    loadFilter: function (data, parentId) {
        var opt = $(this).data().treegrid.options;
        var idField, treeField, parentField;
        if (opt.parentField) {
            idField = opt.idField || 'id';
            treeField = opt.textField || 'text';
            parentField = opt.parentField || 'pid';
            var i, l, treeData = [], tmpMap = [];
            for (i = 0, l = data.length; i < l; i++) {
                tmpMap[data[i][idField]] = data[i];
            }
            for (i = 0, l = data.length; i < l; i++) {
                if (tmpMap[data[i][parentField]]
                    && data[i][idField] != data[i][parentField]) {
                    if (!tmpMap[data[i][parentField]]['children'])
                        tmpMap[data[i][parentField]]['children'] = [];
                    data[i]['text'] = data[i][treeField];
                    tmpMap[data[i][parentField]]['children'].push(data[i]);
                } else {
                    data[i]['text'] = data[i][treeField];
                    treeData.push(data[i]);
                }
            }
            return treeData;
        }
        return data;
    }
});

/**
 * 创建一个模式化的dialog
 *
 * @author 崔兴伟
 *
 * @requires jQuery,EasyUI
 *
 */
cxw.modalDialog = function (options) {
    var opts = $.extend({
        title: '&nbsp;',
        width: 800,
        height: 480,
        modal: true,
        onClose: function () {
            $(this).dialog('destroy');
        }
    }, options);
    opts.modal = true;// 强制此dialog为模式化，无视传递过来的modal参数
    if (options.url) {
        opts.content = '<iframe id="" src="'
            + options.url
            + '" allowTransparency="true" scrolling="auto" width="100%" height="98%" frameBorder="0" name=""></iframe>';
    }
    return $('<div id="dialog" />').dialog(opts);

};

/**
 * 更换主题
 *
 * @author 崔兴伟
 * @requires jQuery,EasyUI
 * @param themeName
 */
cxw.changeTheme = function (themeName) {
    var $easyuiTheme = $('#easyuiTheme');
    var url = $easyuiTheme.attr('href');
    var href = url.substring(0, url.indexOf('themes')) + 'themes/' + themeName
        + '/easyui.css';
    $easyuiTheme.attr('href', href);

    var $iframe = $('iframe');
    if ($iframe.length > 0) {
        for (var i = 0; i < $iframe.length; i++) {
            var ifr = $iframe[i];
            try {
                $(ifr).contents().find('#easyuiTheme').attr('href', href);
            } catch (e) {
                try {
                    ifr.contentWindow.document.getElementById('easyuiTheme').href = href;
                } catch (e) {
                }
            }
        }
    }

    cxw.cookie('easyuiTheme', themeName, {
        expires: 7
    });
};

/**
 * @author 崔兴伟
 * @date 2014-11-5 合并单元格扩展
 * @param {Object}  jq
 * @param {Object} fields
 * @memberOf {TypeName}
 * @return {TypeName}
 *
 */
$.extend($.fn.datagrid.methods, {
    autoMergeCells: function (jq, fields) {
        return jq.each(function () {
            var target = $(this);
            if (!fields) {
                fields = target.datagrid("getColumnFields");
            }
            var rows = target.datagrid("getRows");
            var i = 0, j = 0, temp = {};
            for (i; i < rows.length; i++) {
                var row = rows[i];
                j = 0;
                for (j; j < fields.length; j++) {
                    var field = fields[j];
                    var tf = temp[field];
                    if (!tf) {
                        tf = temp[field] = {};
                        tf[row[field]] = [i];
                    } else {
                        var tfv = tf[row[field]];
                        if (tfv) {
                            tfv.push(i);
                        } else {
                            tfv = tf[row[field]] = [i];
                        }
                    }
                }
            }
            $.each(temp, function (field, colunm) {
                $.each(colunm, function () {
                    var group = this;

                    if (group.length > 1) {
                        var before, after, megerIndex = group[0];
                        for (var i = 0; i < group.length; i++) {
                            before = group[i];
                            after = group[i + 1];
                            if (after && (after - before) == 1) {
                                continue;
                            }
                            var rowspan = before - megerIndex + 1;
                            if (rowspan > 1) {
                                target.datagrid('mergeCells', {
                                    index: megerIndex,
                                    field: field,
                                    rowspan: rowspan
                                });
                            }
                            if (after && (after - before) != 1) {
                                megerIndex = after;
                            }
                        }
                    }
                });
            });
        });
    }
});

/**
 * 验证开始时间小于结束时间
 */
cxw.checkStartTimeBeforeEndTime = function (startTime, endTime) {
    if ($(startTime).datebox('getValue') <= $(endTime).datebox('getValue')) {
        return true;
    } else {
        return false;
    }
}
/**
 * 验证一个数小于另一个数
 */
cxw.checkMinBeforeMax = function (min, max) {
    if ($(max).numberbox('getValue') == ""
        || ($(min).numberbox('getValue') <= $(max).numberbox('getValue'))) {
        return true;
    } else {
        return false;
    }
}
