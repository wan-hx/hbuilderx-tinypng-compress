const hx = require('hbuilderx');

const utils = require('./utils.js');

const {
    operateMoreFile,
} = require('./fileSelected.js');
const { createOutputView } = require('./utils.js');

/**
 * @description 压缩本地目录
 * @param tinyConfig {Object}
 */
async function compressLocalDir(tinyConfig) {
    let { tingyCompressedFilePostfix, tinyForceOverwrite } = tinyConfig;
    let formItems = [{
            "type": "fileSelectInput",
            "name": "localPath",
            "mode": "folder",
            "label": "本地目录",
            "placeholder": "请选择要进行图片压缩的本地目录",
            "value": ""
        }, {
            type: "label",
            name: "text1",
            text: '<p style="color: #a0a0a0; font-size: 11px;margin: 10px 0;">1. 仅支持压缩目录下的png、jpg、jpeg、webp图片</p>'
        },
        {
            type: "label",
            name: "text2",
            text: '<p style="color: #a0a0a0; font-size: 11px;margin: 10px 0;">2. 网络图片压缩后，图片会保存到原目录</p>'
        }
    ];

    if (tinyForceOverwrite) {
        formItems.push({
            type: "label",
            name: "text3",
            text: '<p style="color: #a0a0a0; font-size: 11px;margin: 10px 0;">3. 您曾经设置压缩完成后【强制覆盖本地原图】，如不需要，请在菜单【设置 - 插件配置】中修改。</p>'
        })
    };

    let result = await hx.window.showFormDialog({
        title: "TinyPng - 压缩本地目录图片",
        width: 490,
        height: 250,
        submitButtonText: "确定(&S)",
        cancelButtonText: "取消(&C)",
        formItems: formItems,
        validate: function(formData) {
            let {DirName} = formData;
            if (DirName == "") {
                this.showError("路径无效");
                return false
            };
            return true;
        }
    }).then((res) => {
        return res;
    }).catch(error => {
        console.log(error);
    });

    if (!result) return;

    let {localPath} = result;
    if (localPath) {
        // 遍历目录下的图片
        const DirFileList = utils.walkSync(localPath);
        if (DirFileList.length) {
            operateMoreFile(tinyConfig, DirFileList);
        } else {
            createOutputView("您选择目录下，没有png、jpg、jpeg、webp图片。", "warning");
        };
    };
};


module.exports = compressLocalDir;
