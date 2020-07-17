const hx = require('hbuilderx');
const path = require('path');

/**
 * @description 右下角弹窗
 * @param {Object} info
 */
function showMsgBox(info) {
    let {success,message,imgOriginalSize,afterSize,target} = info;

    if (!success) {
        return hx.window.showErrorMessage("TingPNG:" + message);
    };

    let msg = "TinyPNG: 压缩成功, 原先 " + imgOriginalSize + "kb, 压缩后" + afterSize + "kb。";
    resultPromise = hx.window.showInformationMessage(msg, ["拷贝路径", "打开图片"]);
    resultPromise.then((result) => {
        if (result == '拷贝路径') {
            hx.env.clipboard.writeText(target);
        } else if (result === '打开图片') {
            hx.workspace.openTextDocument(target);
        }
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

    let msg = "TinyPNG: 您提供的网络url图片已压缩成功。"
    resultPromise = hx.window.showInformationMessage(msg, ["拷贝路径", "打开预览"]);
    resultPromise.then((result) => {
        if (result == '拷贝路径') {
            hx.env.clipboard.writeText(target);
        } else if (result === '打开预览') {
            hx.workspace.openTextDocument(target);
        }
    });
};


/**
 * @description 多个文件时，输出控制台
 */
function OutputChannel(info) {
    let {success,source,message,imgOriginalSize,afterSize,target,index} = info;

    // 创建控制台
    let outputChannel = hx.window.createOutputChannel('图片压缩');
    // 显示控制台
    outputChannel.show();
    // 输出内容

    let fname = path.basename(source);
    let msg = '第 ' + index + ' 张图片, ' + fname + ' ,';
    if (success) {
        msg = msg + " 压缩成功, 原 " + imgOriginalSize + "kb, 压缩后" + afterSize + "kb。" + "地址: " + target + "\n";
    } else {
        msg = msg + " 压缩失败, 原因: " + message;
    }
    outputChannel.appendLine(msg);
};


/**
 * @description 输出单条消息到控制台
 */
function OutputChannel2(msg) {
    // 创建控制台
    let outputChannel = hx.window.createOutputChannel('图片压缩');
    // 显示控制台
    outputChannel.show();
    // 输出内容
    outputChannel.appendLine(msg);
};

module.exports = {
    showMsgBox,
    showNetworkMsgBox,
    OutputChannel,
    OutputChannel2
}
