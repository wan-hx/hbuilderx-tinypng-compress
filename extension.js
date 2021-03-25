const hx = require("hbuilderx");
const main = require("./src/index.js");

function activate(context) {
    // 压缩项目管理器选中的内容
    let disposable = hx.commands.registerCommand('extension.tinypngCompress', (param) => {
        main.Main('filesExplorer', param);
    });

    // 压缩剪切板中图片路径、目录路径
    let tinypngClipboard = hx.commands.registerCommand('extension.tinypngClipboard', (param) => {
        main.Main('clipboard', param);
    });

    // 压缩网络地址图片，必须是url
    let tinypngNetworkPictures = hx.commands.registerCommand('extension.tinypngNetworkPictures', (param) => {
        main.Main('network', param);
    });

    // 压缩编辑器选中的内容，比如markdown引入的图片、html引用的图片，选中后，直接压缩
    let tinypngSelected = hx.commands.registerCommand('extension.tinypngSelected', (param) => {
        main.Main('Selected', param);
    });

    // 编辑器右键菜单是否显示tinypng菜单
    let tinypngEditorRightMenu = hx.commands.registerCommand('extension.tinypngEditorRightMenuConfig', () => {
        let config = hx.workspace.getConfiguration();
        let isShow = config.get('TinyPng.isShowEditorRightMenu');
        let result = isShow ? false : true;
        config.update("TinyPng.isShowEditorRightMenu", result).then(()=>{
            let text = isShow ? '禁用' : '启用';
            hx.window.showInformationMessage(`TinyPNG: 编辑器右键菜单，已${text} TingPNG。`, ['我知道了']);
        });
    });

    // 压缩后是否强制覆盖原图
    let tingypngForceOverwriteConfig = hx.commands.registerCommand('extension.tingypngforceOverwriteConfig', () => {
        let config = hx.workspace.getConfiguration();
        let isShow = config.get('TinyPng.forceOverwrite');
        let result = isShow ? false : true;
        config.update("TinyPng.forceOverwrite", result).then(()=>{
            let text = isShow ? '禁用' : '启用';
            hx.window.showInformationMessage(`TinyPNG: 已${text} 强制覆盖原图。`, ['我知道了']);
        });
    });

    let tinypngHelp = hx.commands.registerCommand('extension.tinypngHelp', (param) => {
        hx.env.openExternal('https://ext.dcloud.net.cn/plugin?name=tinypng-compress');
    });
};

//该方法将在插件禁用的时候调用（目前是在插件卸载的时候触发）
function deactivate() {

};

module.exports = {
    activate,
    deactivate
}
