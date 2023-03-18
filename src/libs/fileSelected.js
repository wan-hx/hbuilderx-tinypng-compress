const fs = require('fs');
const os = require('os');
const path = require('path');

const hx = require('hbuilderx');

const compress = require('./tinyPngApi.js');
const utils = require('./utils.js');

// 允许的图片后缀
const imageSuffix = ['.png', '.jpg', '.jpeg', '.webp'];


/**
 * @description 文件多选
 * @param {Object} param
 */
function MultiSelect(param) {
    return new Promise((resolve, reject) => {
        let isIncludeDirectory = false;
        let fileList = [];
        try {
            for (let v of param) {
                let fsPath = v.fsPath;
                let stats = fs.statSync(fsPath);
                if (stats.isDirectory()) {
                    isIncludeDirectory = true;
                } else {
                    let ext = path.extname(fsPath);
                    if (imageSuffix.includes(ext.toLowerCase())) {
                        let fsize = ((stats.size) / 1024).toFixed(2);
                        fileList.push({'fsPath': fsPath,'imgOriginalSize': fsize})
                    } else {
                        return hx.window.showErrorMessage('仅支持压缩png、jpg、webp格式的图片。',['我知道了']);
                    };
                };
            };
            resolve({isIncludeDirectory,fileList});
        } catch (e) {
            reject({isIncludeDirectory,fileList});
        }
    });
};


/**
 * @description 项目管理器：选中多个文件
 * @param {Object} tinyConfig
 * @param {Object} fileList
 */
async function operateMoreFile(tinyConfig, fileList) {
    if (fileList.length === 0) { return };
    let {tinyKey,tingyCompressedFilePostfix,tinyForceOverwrite} = tinyConfig;

    // print msg
    let msg = '当前选中的内容, 检测到 ' + fileList.length + ' 张图片, 开始压缩......';
    const remark1 = '注意: 受网络、tinypng服务器影响，如操作时间过长，请关闭后重试。\n'
    const remark2 = '备注：菜单【工具 - TinyPNG】，可以设置压缩完成后，是否强制覆盖本地原图。'
    utils.createOutputView(msg);
    utils.createOutputView(remark2, "warning");
    utils.createOutputView(remark1, "warning");

    for (let idx in fileList) {
        let {fsPath,imgOriginalSize} = fileList[idx];
        let imgExtname = path.extname(fsPath);
        let target = fsPath.slice(0, -imgExtname.length) + tingyCompressedFilePostfix + imgExtname;
        if (tinyForceOverwrite) {
            target = fsPath;
        };
        let info = await compress.tinypngFromFile(tinyKey, fsPath, imgOriginalSize, target);

        // break代表中止
        if (info == "break") break;

        info = Object.assign(info, {'imgOriginalSize':imgOriginalSize,'index':parseInt(idx) + 1});
        utils.formatOutputMsg(info);
    };
};

/**
 * @description 项目管理器：选择一个图片文件
 * @param {Object} tinyConfig
 * @param {Object} fsPath 文件绝对路径
 */
async function operateOneFile(tinyConfig, fsPath, fstate) {
    let {tinyKey,tingyCompressedFilePostfix,tinyForceOverwrite} = tinyConfig;
    const imgExtname = path.extname(fsPath);
    const imgOriginalSize = ((fstate.size) / 1024).toFixed(2);

    let target = fsPath.slice(0, -imgExtname.length) + tingyCompressedFilePostfix + imgExtname;
    if (tinyForceOverwrite) {
        target = fsPath;
    };
    let info = await compress.tinypngFromFile(tinyKey, fsPath, imgOriginalSize, target);

    // break代表中止
    if (info == "break") return;

    info = Object.assign(info, {"tinyForceOverwrite": tinyForceOverwrite, "imgOriginalSize": imgOriginalSize});
    utils.formatOutputMsg(info);
};


/**
 * @description 操作项目管理器选中的图片
 */
async function compressExplorer(param, tinyConfig) {
    // 本地图片压缩: 判断用户选择的数据
    if (param.constructor === Object) {
        let fsPath = param.fsPath;
        let stats = fs.statSync(fsPath);

        // 图片目录
        if (stats.isDirectory()) {
            const DirFileList = utils.walkSync(fsPath);
            if (DirFileList.length) {
                operateMoreFile(tinyConfig, DirFileList);
            } else {
                utils.createOutputView("警告：当前选择的目录下，没有找到图片、或没有找到可压缩的PNG、jpg、webp图片。", "error");
            };
        };

        // 单张图片
        if (stats.isFile()) {
            operateOneFile(tinyConfig, fsPath, stats);
        };

    } else if (param.constructor === Array) {
        let {isIncludeDirectory,fileList} = await MultiSelect(param);

        // 项目管理器：多选且包含目录，则询问用户操作
        if (isIncludeDirectory) {
            const msg =
                'TinyPNG: 多选的数据中，同时检测到目录和文件，如继续，将忽略目录。<p style="color:#787878;font-size:13px;">备注: 如需按目录压缩，请直接选中目录。</p><p></p>'
            hx.window.showErrorMessage(msg, ['继续', '停止']).then((result) => {
                if (result == '停止') {
                    return;
                } else {
                    operateMoreFile(tinyConfig, fileList);
                };
            });
        } else {
            operateMoreFile(tinyConfig, fileList);
        };
    } else {
        hx.window.showInformationMessage('选中一个文件或目录后再进行操作。', ['知道了']);
        return;
    };
}


module.exports = {
    operateOneFile,
    operateMoreFile,
    compressExplorer
};
