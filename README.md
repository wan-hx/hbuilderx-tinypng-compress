# TinyPNG 无损压缩

- 项目管理器，支持选择一张、多张图片进行压缩
- 项目管理器，支持压缩目录下所有图片
- 支持压缩网络地址图片，需要提供图片url
- 支持压缩编辑器光标选中的内容

## 项目管理器压缩图片

项目管理器，选中一张或多个png或jpg图片，右键菜单点击【TinyPNG：压缩】

![](https://img-cdn-qiniu.dcloud.net.cn/uploads/article/20200717/c0c77d099cb786333bae409904021843.jpg)

## 压缩网络地址图片

菜单【工具】【TinyPNG: 压缩】，可以压缩网络地址图片

![](https://img-cdn-qiniu.dcloud.net.cn/uploads/article/20210325/1eaf25583eb1d98390acca144010c9b2.png)

## 压缩编辑器光标选中的内容

![](https://img-cdn-qiniu.dcloud.net.cn/uploads/article/20210325/0ab442b062356c0fe5f01e8f5e447ed4.png)

## TinyPNG 插件配置

插件下载成功后，在HBuilderX中，点击菜单【设置】【插件配置】，如下图，填写key等信息

![](https://img-cdn-qiniu.dcloud.net.cn/uploads/article/20200703/c865f4a8163860288e89b8fd04cb06fa.jpg)


## 配置快捷键

点击菜单【工具】【自定义快捷键】，输入如下内容, 其中`key`可自定义。

```
{
    "key":"ctrl+alt+c",
    "command": "extension.tinypngCompress"
}
```
