const hx = require("hbuilderx");
const main = require("./src/index.js");

//该方法将在插件激活的时候调用
function activate(context) {
    let disposable = hx.commands.registerCommand('extension.tinypngCompress', (param) => {
        main.Main('filesExplorer', param);
    });
    let tinypngClipboard = hx.commands.registerCommand('extension.tinypngClipboard', (param) => {
        main.Main('clipboard', param);
    });
    let tinypngNetworkPictures = hx.commands.registerCommand('extension.tinypngNetworkPictures', (param) => {
        main.Main('network', param);
    });
};

//该方法将在插件禁用的时候调用（目前是在插件卸载的时候触发）
function deactivate() {

};

module.exports = {
    activate,
    deactivate
}
