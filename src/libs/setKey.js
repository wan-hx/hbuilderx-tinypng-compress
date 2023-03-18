const hx = require('hbuilderx');
const { createOutputView } = require('./utils.js');

async function setKey() {
    let result = await hx.window.showFormDialog({
        formItems: [
            {type: "input",name: "key",label: "Key",placeholder: '请输入TinyPNG API Key...',value: ""},
            {"type": "label","name": "label1","text": '<p style="color: gray; font-size: 11px;"><a href="https://tinypng.com/">TinyPNG官网</a>，网页右上角点击【LOGIN】输入邮箱，点击【Send Link】按钮。</p>'},
            {"type": "label","name": "label2","text": '<p style="color: gray; font-size: 11px;">邮箱会收到一个链接，点击后跳转到TinyPNG，即可看到API key。</p>'}
        ],
        title: "TinyPng - 压缩",
        subtitle: "插件内，使用TinyPNG压缩功能，需要在TinyPNG官网申请API key.",
        width: 480,
        height: 180,
        submitButtonText: "设置(&S)",
        cancelButtonText: "取消(&C)",
        validate: function(formData) {
            if (!formData.key) {
                this.showError("key不得为空，请填写");
                return false;
            };
            if ((formData.key).length < 6) {
                this.showError("您填写的Key，不是一个有效key.");
                return false;
            };
            return true;
        },
        onChanged: function(field, value) { }
    }).then((res) => {
        return res;
    });
    if (result == undefined || !result) return;
    let { key } = result;
    if (key) {
        let config = hx.workspace.getConfiguration();
        config.update("TinyPng.ApiKey", key).then(()=>{
            createOutputView("TinyPng: 设置API Key成功，请选择图片或目录进行压缩操作。", "success");
        });
    };
};

module.exports = setKey;
