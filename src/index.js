const fs = require('fs');
const os = require('os');
const path = require('path');

const tinify = require('tinify');
const hx = require('hbuilderx');

const { createOutputView } = require('./libs/utils.js');

const setKey = require('./libs/setKey.js');

const { compressExplorer } = require('./libs/fileSelected.js');
const compressEditorSelectedPictures = require('./libs/compressHxEditorSelected.js');

const compressClipboard = require('./libs/compressClipboard.js');
const compressNetworkPictures = require('./libs/compressNetworkImageUrl.js');

const compressLocalDir = require('./libs/compressLocalDir.js');

/**
 *@description get TinyPng Config
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
 *@description 验证tinypng key是否有效
 */
function gotoValidate(key) {
    if (key.replace(/\s*/g, "") == '' | key == undefined) {
        return false;
    };
    tinify.key = key;
    return new Promise((resolve, reject) => {
        tinify.validate(function(err) {
            if (err) {
                reject(false);
            };
            resolve(true);
        });
    }).catch( () => {
        return false;
    });
};


/**
 * @description Main
 */
async function Main(type,param) {

    // get tinypng config
    let tinyConfig = getTinyConfig();
    let {tinyKey,tingyCompressedFilePostfix,tinyForceOverwrite} = tinyConfig;

    // 校验tinypng是否有效
    let validateResult = await gotoValidate(tinyKey);
    if (!validateResult) {
        createOutputView("TinyPng: API key无效。", "error");
        createOutputView("TinyPNG: 请点击菜单【工具 - TinyPNG - 设置API Key】。", "error");
        setKey();
        return;
    };

    if (tinyForceOverwrite && tingyCompressedFilePostfix.replace(/\s*/g, "") == '') {
        return hx.window.showErrorMessage("TinyPNG: 请填写压缩后的图片名称后缀，比如.min");
    };

    switch (type){
        case "clipboard":
            // 剪切板本地图片/目录压缩
            compressClipboard(tinyConfig);
            break;
        case "network":
            // 网络地址图片压缩
            compressNetworkPictures(tinyKey);
            break;
        case "Selected":
            // 压缩编辑器选中的内容，比如markdown引入的图片
            compressEditorSelectedPictures(param, tinyConfig);
            break;
        case "filesExplorer":
            // 压缩项目管理器选中内容
            compressExplorer(param, tinyConfig);
            break;
        case "localDir":
            // 选择本地目录进行压缩
            compressLocalDir(tinyConfig);
            break;
        default:
            break;
    };

};


module.exports = {
    Main
}
