const fs = require('fs');
const os = require('os');
const path = require('path');
const process = require('process')

const tinify = require('tinify');
const hx = require('hbuilderx');

const compress = require('./compress.js');
const notification = require('./notification.js');


// 允许的图片后缀
const imageSuffix = ['.png', '.jpg', '.jpeg'];


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
 * @description 遍历目录下的图片
 * @param {Object} dir
 * @param {Object} filelist
 */
var fileList = [];
var walkSync = function (dir,filelist) {
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
 * @description 操作一个文件
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

    info = Object.assign(info, {"tinyForceOverwrite": tinyForceOverwrite});
    notification.showMsgBox(info);
};


/**
 * @description 操作多个文件
 * @param {Object} tinyConfig
 * @param {Object} fileList
 */
async function operateMoreFile(tinyConfig, fileList) {
    if (fileList.length === 0) { return };
    let {tinyKey,tingyCompressedFilePostfix,tinyForceOverwrite} = tinyConfig;

    // print msg
    let msg = '当前选中的内容, 检测到 ' + fileList.length + ' 张图片, 开始压缩......';
    const remark = '备注: 受网络、tinypng服务器影响，如操作时间过长，请关闭后重试。\n'
    notification.OutputChannel2(msg);
    notification.OutputChannel2(remark);

    for (let idx in fileList) {
        let {fsPath,imgOriginalSize} = fileList[idx];
        let imgExtname = path.extname(fsPath);
        let target = fsPath.slice(0, -imgExtname.length) + tingyCompressedFilePostfix + imgExtname;
        if (tinyForceOverwrite) {
            target = fsPath;
        };
        let info = await compress.tinypngFromFile(tinyKey, fsPath, imgOriginalSize, target);
        info = Object.assign(info, {'imgOriginalSize':imgOriginalSize,'index':parseInt(idx) + 1});
        notification.OutputChannel(info);
    };
};


/**
 * @description 操作项目管理器选中的图片
 */
async function operateExplorer(param, tinyConfig) {
    // 本地图片压缩: 判断用户选择的数据
    if (param.constructor === Object) {
        let fsPath = param.fsPath;
        let stats = fs.statSync(fsPath);
        // 图片目录
        if (stats.isDirectory()) {
            const DirFileList = walkSync(fsPath);
            if (DirFileList.length) {
                operateMoreFile(tinyConfig, DirFileList);
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
                }
            });
        } else {
            operateMoreFile(tinyConfig, fileList);
        };
    } else {
        hx.window.showInformationMessage('选中一个文件或目录后再进行操作。', ['知道了']);
        return;
    };
}


/**
 * @description 操作剪切板中的图片
 */
function operateClipboard(tinyConfig) {
    let readPromise = hx.env.clipboard.readText();
    readPromise.then(function(text) {
        let localPath = text;
        if (localPath.substring(0, 7) == 'file://') {
            localPath = localPath.substring(7)
        }
        if (!fs.existsSync(localPath)) {
            return hx.window.showErrorMessage("剪切板中的图片路径不是有效的文件路径。",['关闭']);
        };
        const fstate = fs.statSync(localPath);
        if (fstate.isFile()) {
            let fext = path.extname(localPath);
            if (imageSuffix.includes(fext.toLowerCase())) {
                operateOneFile(tinyConfig,localPath,fstate);
            } else {
                return hx.window.showErrorMessage('请确保剪切板中的图片路径是png、jpg。',['我知道了']);
            };
        };
        if (fstate.isDirectory()){
            const DirFileList = walkSync(localPath);
            if (DirFileList.length) {
                operateMoreFile(tinyConfig, DirFileList);
            };
        };
    });
};


/**
 * @description 操作网络图片
 * @param {String} tinyKey
 */
function operateNetworkPictures(tinyKey) {
    // 存储路径
    let target = '';
    let timestamp = (new Date()).getTime();

    const env = process.env;
    const osName = os.platform();
    if (osName == 'darwin') {
        target = path.join(env.HOME,'Desktop',timestamp + '.png');
    } else {
        target = path.join(env.HOMEDRIVE,env.HOMEPATH,'Desktop',timestamp + '.png');
    };

    async function compressImgUrl(imgUrl) {
        let res = await compress.tinypngFromUrl(tinyKey,imgUrl,target);
        notification.showNetworkMsgBox(res);
    };

    let inputPromise = hx.window.showInputBox({
        prompt: "请输入网络图片URL"
    });
    inputPromise.then((imgUrl) => {
        if (imgUrl.trim() != '') {
            compressImgUrl(imgUrl);
        } else {
            hx.window.setStatusBarMessage('TinyPNG: 请输入网络地址',5000,'error');
        };
    })
};


/**
 * @param {Object} param
 */


/**
 * @description 操作编辑器选中的内容，比如markdown引入的图片、html引用的图片，选中后，直接压缩
 */
async function operateSelectedPictures(param, tinyConfig) {
    if (param == null) {
        return hx.window.showErrorMessage('TinyPng: 请在编辑器选中相应内容后再试。', ['我知道了']);
    };

    let fsPath;
    try{
        fsPath = path.dirname(param.document.uri.fsPath);
    }catch(e){
        hx.window.showErrorMessage('TinyPng: 请在编辑器选中相应内容后再试。', ['我知道了']);
        return;
    };

    let selected = await hx.window.getActiveTextEditor().then(function(editor) {
        let selection = editor.selection;
        let document = editor.document;
        let word = document.getText(selection);
        return word;
    });

    let imgPath = path.resolve(fsPath,selected);
    let state = fs.statSync(imgPath);
    if (!state.isFile()) {
        return hx.window.showErrorMessage('TinyPng: 光标选中的内容，图片路径不存在。', ['我知道了']);
    };

    try{
        operateOneFile(tinyConfig, imgPath, state);
    }catch(e){
        console.error(e);
        hx.window.showErrorMessage('TinyPng: 压缩出现异常, 菜单【帮助】【查看运行日志】，可查看错误日志。', ['我知道了']);
    };
};

/**
 * @description Main
 */
async function Main(type,param) {

    // get tinypng config
    let tinyConfig = getTinyConfig();
    let {tinyKey,tingyCompressedFilePostfix,tinyForceOverwrite} = tinyConfig;
    if (tinyKey.replace(/\s*/g, "") == '' | tinyKey == undefined) {
        return hx.window.showErrorMessage("TinyPNG: 请在菜单【设置 - 插件设置】中填写有效的ApiKey");
    };
    if (tinyForceOverwrite && tingyCompressedFilePostfix.replace(/\s*/g, "") == '') {
        return hx.window.showErrorMessage("TinyPNG: 请填写压缩后的图片名称后缀，比如.min");
    };

    switch (type){
        case "clipboard":
            // 剪切板本地图片/目录压缩
            operateClipboard(tinyConfig);
            break;
        case "network":
            // 网络地址图片压缩
            operateNetworkPictures(tinyKey);
            break;
        case "Selected":
            // 压缩编辑器选中的内容，比如markdown引入的图片
            operateSelectedPictures(param, tinyConfig);
            break;
        case "filesExplorer":
            // 压缩项目管理器选中内容
            operateExplorer(param, tinyConfig)
            break;
        default:
            break;
    };

};


module.exports = {
    Main
}
