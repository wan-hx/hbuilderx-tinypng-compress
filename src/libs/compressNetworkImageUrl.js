const fs = require('fs');
const os = require('os');
const path = require('path');

const hx = require('hbuilderx');

const compress = require('./tinyPngApi.js');
const utils = require('./utils.js');

// 允许的图片后缀
const imageSuffix = ['.png', '.jpg', '.jpeg', '.webp'];


async function useFormDialog(tinyKey,target) {
    let formItems = [
        {type: "input",name: "imageURL",label: "图片URL",placeholder: "必填",value: ""},
        {type: "label",name: "text1",text: '<p style="color: #a0a0a0; font-size: 11px;margin: 10px 0;">1. 图片URL，必须以http或https开头</p>' },
        {type: "label",name: "text2",text: '<p style="color: #a0a0a0; font-size: 11px;margin: 10px 0;">2. 网络图片压缩后，图片会保存到本地桌面</p>' }
    ];

    let setInfo = await hx.window.showFormDialog({
        title: "TinyPng - 压缩网络地址图片",
        width: 490,
        height: 250,
        submitButtonText: "确定(&S)",
        cancelButtonText: "取消(&C)",
        formItems: formItems,
        validate: function (formData) {
            let {imageURL} = formData;
            let result = /(http|https):\/\/([\w.]+\/?)\S*/.test(imageURL) ? true : false;
            if (!result) {
                this.showError("图片URL无效");
            };
            return result;
        }
    }).then((res) => {
        return res;
    }).catch(error => {
        console.log(error);
    });

    if (!setInfo) return;

    let {imageURL} = setInfo;
    if (imageURL) {
        compressImgUrl(tinyKey, imageURL, target);
    };
};

/**
 * @description 压缩网络地址图片
 * @param {Object} imgUrl
 */
async function compressImgUrl(tinyKey,imgUrl,target) {
    let res = await compress.tinypngFromUrl(tinyKey,imgUrl,target);
    if (res == "break") return;
    utils.showNetworkMsgBox(res);
};


/**
 * @description 操作网络图片
 * @param {String} tinyKey
 */
function compressNetworkPictures(tinyKey) {
    // 存储路径
    let target = '';
    let targetDir = "";
    let timestamp = (new Date()).getTime();

    const env = process.env;
    const osName = os.platform();
    if (osName == 'darwin') {
        targetDir = path.join(env.HOME,'Desktop');
        target = path.join(targetDir,timestamp + '.png');
    } else {
        targetDir = path.join(env.HOMEDRIVE, env.HOMEPATH, 'Desktop');
        target = path.join(targetDir, timestamp + '.png');
    };

    try{
        useFormDialog(tinyKey,target);
    }catch(e){
        let inputPromise = hx.window.showInputBox({
            prompt: "请输入网络图片URL"
        });
        inputPromise.then((imgUrl) => {
            if (imgUrl.trim() != '') {
                compressImgUrl(tinyKey,imgUrl,target);
            } else {
                hx.window.setStatusBarMessage('TinyPNG: 请输入网络地址',5000,'error');
            };
        })
    };
};

module.exports = compressNetworkPictures;
