const hx = require('hbuilderx');
const path = require('path');
const fs = require('fs');
const tinify = require('tinify');

/**
 *@description  get Tingypng Config
 */
function getTinyConfig() {
    let config = hx.workspace.getConfiguration();
    let tinyKey = config.get('TinyPng.ApiKey');
    let tingyCompressedFilePostfix = config.get('TinyPng.compressedFilePostfix');
    let tinyForceOverwrite = config.get('TinyPng.forceOverwrite');
    return {
        tinyKey,
        tingyCompressedFilePostfix,
        tinyForceOverwrite
    }
};

/**
 * @description tinypng compress
 * @param {Sting} imgPath 图片原路径
 * @param {Sting} target 目标图片路径
 * @param {Sting} tinyKey
 */
async function tinypngCompress(imgPath, imgOriginalSize, target, tinyKey) {
    tinify.key = tinyKey;
    hx.window.setStatusBarMessage('TinyPNG: 开始压缩, 可能需要数秒, 请耐心等待.',30000,'info');
    return tinify.fromFile(imgPath).toFile(target, error => {
        if (error) {
            hx.window.showErrorMessage("TingPNG:" + error.message);
        } else {
            hx.window.clearStatusBarMessage();
            let stats2 = fs.statSync(target);
            let afterSize = ((stats2.size)/1024).toFixed(2);
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
    });
};

/**
 * @description 压缩文件
 */
async function Main(param) {
    // get image path
    const fsPath = param.fsPath;
    const imgExtname = path.extname(fsPath);

    // get image info
    let stats = fs.statSync(fsPath);
    if (stats.isDirectory() || !['.png','.jpg','.jpeg', '.bmp', '.webp'].includes(imgExtname.toLowerCase())) {
        return hx.window.showErrorMessage("请选择一张png或jpg图片。",['我知道了']);
    };
    const imgOriginalSize = ((stats.size)/1024).toFixed(2);

    // get tinypng config
    let {tinyKey,tingyCompressedFilePostfix,tinyForceOverwrite} = getTinyConfig();
    if (tinyKey.replace(/\s*/g, "") == '' | tinyKey == undefined) {
        return hx.window.showErrorMessage("TinyPNG: 请在菜单【设置 - 插件设置】中填写有效的ApiKey");
    };
    if (tinyForceOverwrite && tingyCompressedFilePostfix.replace(/\s*/g, "") == '') {
        return hx.window.showErrorMessage("TinyPNG: 请填写压缩后的图片名称后缀，比如.min");
    };

    //  image target path
    let target = fsPath.slice(0, -imgExtname.length) + tingyCompressedFilePostfix + imgExtname;
    if (tinyForceOverwrite) {
        target = fsPath;
    };

    // start Compress
    await tinypngCompress(fsPath, imgOriginalSize, target, tinyKey);
};

module.exports = {
    Main
}
