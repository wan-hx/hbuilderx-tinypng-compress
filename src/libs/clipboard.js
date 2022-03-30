const fs = require('fs');
const os = require('os');
const path = require('path');

const hx = require('hbuilderx');

const compress = require('./tinyPngApi.js');
const utils = require('./utils.js');
const {
    operateOneFile,
    operateMoreFile,
} = require('./fileSelected.js');

// 允许的图片后缀
const imageSuffix = ['.png', '.jpg', '.jpeg', '.webp'];


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

        // 判断文件是否存在
        if (!fs.existsSync(localPath)) {
            return hx.window.showErrorMessage("剪切板中的图片路径不是有效的文件路径。",['关闭']);
        };

        // 获取状态
        const fstate = fs.statSync(localPath);

        // 文件操作
        if (fstate.isFile()) {
            let fext = path.extname(localPath);
            if (imageSuffix.includes(fext.toLowerCase())) {
                operateOneFile(tinyConfig,localPath,fstate);
            } else {
                return hx.window.showErrorMessage('请确保剪切板中的图片路径是png、jpg、webp。',['我知道了']);
            };
        };

        // 目录操作
        if (fstate.isDirectory()){
            const DirFileList = utils.walkSync(localPath);
            if (DirFileList.length) {
                operateMoreFile(tinyConfig, DirFileList);
            };
        };

    });
};

module.exports = operateClipboard;
