const fs = require('fs');
const path = require('path');
const tinify = require('tinify');
const hx = require('hbuilderx');

const { createOutputView } = require('./utils.js');

/**
 * @description tinypng compress
 * @param {Sting} imgPath 图片原路径
 * @param {Sting} target 目标图片路径
 * @param {Sting} tinyKey
 */
function tinypngFromFile(tinyKey, imgPath, imgOriginalSize, target) {

    tinify.key = tinyKey;
    hx.window.setStatusBarMessage('TinyPNG: 开始压缩, 可能需要数秒, 请耐心等待.....', 300000, 'info');

    var info = {
        'success': false,
        'message': '',
        'imgOriginalSize': imgOriginalSize,
        'afterSize': '',
        'source': imgPath,
        'target': ''
    };

    return new Promise((resolve, reject) => {
        tinify.fromFile(imgPath).toFile(target, error => {
            if (error) {
                info.message = error.message;
                createOutputView(`TinyPng: ${error.message}`, "error");
                reject("break");
            } else {
                let stats2 = fs.statSync(target);
                info.afterSize = ((stats2.size) / 1024).toFixed(2);
                info.target = target;
                info.success = true;
                resolve(info);
            };
            hx.window.clearStatusBarMessage();
        });
    }).catch( error => {
        return error;
    })
};

/**
 * @description 网络地址图片压缩
 * @param {type} tinyKey
 * @param {String} imgUrl url
 * @param {String} target 要存储的本地地址
 */
function tinypngFromUrl(tinyKey,imgUrl,target) {
    tinify.key = tinyKey;
    hx.window.setStatusBarMessage('TinyPNG: 开始压缩, 可能需要数秒, 请耐心等待.....', 300000, 'info');

    var info = {
        'success': false,
        'message': '',
        'target': ''
    };
    return new Promise((resolve, reject) => {
        tinify.fromUrl(imgUrl).toFile(target, error=> {
            if (error) {
                createOutputView(`TinyPng: ${error.message}`, "error");
                reject("break");
            } else {
                hx.window.clearStatusBarMessage();
                info.success = true;
                info.target = target;
                resolve(info);
            };
        });
    });
};

module.exports = {
    tinypngFromFile,
    tinypngFromUrl
}
