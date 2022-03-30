const fs = require('fs');
const os = require('os');
const path = require('path');

const hx = require('hbuilderx');

const compress = require('./tinyPngApi.js');
const utils = require('./utils.js');

const {
    operateOneFile
} = require('./fileSelected.js');

// 允许的图片后缀
const imageSuffix = ['.png', '.jpg', '.jpeg', '.webp'];

/**
 * @description 编辑器选中的内容，比如markdown引入的图片、html引用的图片，选中后，直接压缩
 */
async function editorSelectedPictures(param, tinyConfig) {
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

    if (selected == '' || selected == undefined) {
        return hx.window.showErrorMessage('TinyPng: 请在编辑器选中相应内容后再试。', ['我知道了']);
    };

    // 图片绝对路径
    let imgPath;

    // 判断图片路径, 加入选中内容开头是/，则必须获取项目路径
    if (selected.substr(0, 1) == '/') {
        try{
            let projectPath = param.document.workspaceFolder.uri.fsPath;
            imgPath = path.join(projectPath,selected);
        }catch(e){
            utils.createOutputView("警告: 获取路径出错，请将当前文件所在的目录拖入项目管理器后再试。。", "error");
            return;
        };
    } else {
        imgPath = path.resolve(fsPath,selected);
    };

    if (!fs.existsSync(imgPath)) {
        utils.createOutputView("警告: 光标选中的内容，不是有效的本地图片路径。", "error");
        return;
    };

    try{
        let ext = path.extname(imgPath)
        if (!imageSuffix.includes(ext.toLowerCase())) {
            utils.createOutputView("警告: 光标选中的内容，不是有效的图片路径，目前仅支持压缩png、jpg、webp格式的图片。", "error");
            return;
        };
    }catch(e){};

    try{
        let state = fs.statSync(imgPath);
        if (!state.isFile()) {
            utils.createOutputView("警告: 光标选中的内容，不是有效的本地图片路径。", "error");
            return;
        };
        // 开始压缩
        operateOneFile(tinyConfig, imgPath, state);
    }catch(e){
        console.error(e);
        utils.createOutputView("警告: 插件运行出现异常, 菜单【帮助】【查看运行日志】，可查看错误日志。", "error");
    };
};

module.exports = editorSelectedPictures;
