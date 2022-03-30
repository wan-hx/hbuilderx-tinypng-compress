const hx = require('hbuilderx');
const path = require('path');
const fs = require('fs');


/**
 * @description 右下角弹窗
 * @param {Object} info
 */
function showMsgBox(info) {
    let {success,message,imgOriginalSize,afterSize,target,tinyForceOverwrite} = info;

    if (!success) {
        return hx.window.showErrorMessage("TingPNG:" + message);
    };

    let msg = "TinyPNG: 压缩成功, 原先 " + imgOriginalSize + "kb, 压缩后" + afterSize + "kb。";
    if (tinyForceOverwrite) {
        msg = msg + "\n已强制覆盖本地原图，如不需要，请到插件设置中，进行修改。\n"
    } else {
        const basename = path.basename(target)
        msg = msg + `\n文件名：${basename} \n`;
    }
    resultPromise = hx.window.showInformationMessage(msg, ["拷贝路径", "打开", "关闭"]);
    resultPromise.then((result) => {
        if (result == '拷贝路径') {
            hx.env.clipboard.writeText(target);
        } else if (result === '打开') {
            hx.workspace.openTextDocument(target);
        };
    });
};


/**
 * @description 右下角弹窗, 网络图片压缩
 * @param {Object} info
 */
function showNetworkMsgBox(info) {
    let {success,message,target} = info;

    if (!success) {
        return hx.window.showErrorMessage("TingPNG:" + message);
    };

    let msg = "TinyPNG: 您提供的网络url图片已压缩成功，请到桌面查看。"
    resultPromise = hx.window.showInformationMessage(msg, ["拷贝路径", "打开", "关闭"]);
    resultPromise.then((result) => {
        if (result == '拷贝路径') {
            hx.env.clipboard.writeText(target);
        } else if (result === '打开') {
            hx.workspace.openTextDocument(target);
        }
    });
};


/**
 * @description 创建输出控制台
 * @param {String} msg
 * @param {String} msgLevel (warning | success | error | info), 控制文本颜色
 */
function createOutputView(msg, msgLevel = 'info') {
    let outputView = hx.window.createOutputView({ "id": "TinyPng", "title": "TinyPng" });
    outputView.show();

    outputView.appendLine({
        line: msg,
        level: msgLevel,
    });
};

/**
 * @description 创建输出控制台, 支持文件链接跳转
 * @param {String} msg
 * @param {String} msgLevel (warning | success | error | info), 控制文本颜色
 * @param {String} linkText 链接文本
 */
function createOutputViewForLink(msg, msgLevel = 'info', linkText) {
    let outputView = hx.window.createOutputView({ "id": "TinyPng", "title": "TinyPng" });
    outputView.show();

    let start;
    if (msg.includes(linkText) && linkText != undefined) {
        start = msg.indexOf(linkText);
    };

    outputView.appendLine({
        line: msg,
        level: msgLevel,
        hyperlinks: [
            {
                linkPosition: {
                    start: start,
                    end: start + linkText.length
                },
                onOpen: function () {
                    hx.workspace.openTextDocument(linkText);
                }
            }
        ]
    });
};


/**
 * @description 遍历目录下的图片
 * @param {Object} dir
 * @param {Object} filelist
 */

var fileList = [];
var walkSync = function (dir,filelist) {
    // 允许的图片后缀
    const imageSuffix = ['.png', '.jpg', '.jpeg', '.webp'];

    files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function(file) {
        let fpath = path.join(dir,file);
        let fstate = fs.statSync(fpath);
        if (fstate.isDirectory()) {
            filelist = walkSync(fpath, filelist);
        } else {
            let fext = path.extname(fpath);
            let fsize = ((fstate.size) / 1024).toFixed(2);
            if (imageSuffix.includes(fext.toLowerCase())) {
                filelist.push({
                    'fsPath': fpath,
                    'imgOriginalSize': fsize
                });
            };
        }
    });
    return filelist;
};

/**
 * @description 格式化消息
 */
function formatOutputMsg(info) {
    let {success,source,message,imgOriginalSize,afterSize,target,index} = info;

    let fname = path.basename(source);
    let msg = fname + "：";
    if (index) {
        msg = '第 ' + index + ' 张图片, ' + fname;
    };

    if (success) {
        msg = msg + " 压缩成功, 原 " + imgOriginalSize + "kb, 压缩后" + afterSize + "kb。" + "地址: " + target + "\n";
    } else {
        msg = msg + " 压缩失败, 原因: " + message;
    };
    createOutputViewForLink(msg, "info", target);
};

module.exports = {
    walkSync,
    showMsgBox,
    showNetworkMsgBox,
    createOutputView,
    createOutputViewForLink,
    formatOutputMsg
}
