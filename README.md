# TinyPNG 无损压缩

- 仅支持png jpg webp格式的图片
- 项目管理器，支持选择一张、多张图片进行压缩
- 项目管理器，支持压缩目录下所有图片
- 支持压缩网络地址图片，需要提供图片url
- 支持压缩编辑器光标选中的内容
- 支持在HBuilderX 选择本地目录进行压缩

### 项目管理器压缩图片

项目管理器，选中一张或多个png或jpg图片，右键菜单点击【TinyPNG：压缩】

![](https://ask.dcloud.net.cn/uploads/article/20230318/d97f8388bb0ffa233314f423fab3c1f2.png)

### 压缩网络地址图片

菜单【工具】【TinyPNG: 压缩】，可以压缩网络地址图片

![](https://ask.dcloud.net.cn/uploads/article/20230318/595bcfbd5f6fbb541cad95e4b453f15a.png)

### 压缩编辑器光标选中的内容

![](https://ask.dcloud.net.cn/uploads/article/20230318/177e1cfcdf180b050c6292a364cf6af8.png)

### TinyPNG 插件配置

插件下载成功后，在HBuilderX中，点击菜单【设置】【插件配置】，如下图，填写key等信息

![](https://ask.dcloud.net.cn/uploads/article/20230318/7fe1b15e18d09dfa531457183d8e5bab.png)


### 配置快捷键

点击菜单【工具】【自定义快捷键】，输入如下内容, 其中`key`可自定义。

```
{
    "key":"ctrl+alt+c",
    "command": "extension.tinypngCompress"
}
```

# `配置Tinypng`

- 本插件，需要在tinypng申请key后使用；TinyPng注册使用完全免费。TinyPNG官网：[https://tinypng.com/](https://tinypng.com/)
- 如下截图，输入邮箱，点击【Send Link】，邮箱会收到一个`链接`，点击后跳转到TinyPNG，即可看到`api key`
- 注意：Tinypng每月`500张额度`，看起来不多，但是完全足够使用了。
- 本插件的目的就是在HBuilderX调用TinyPNG，便捷的压缩图片。

![](https://img-cdn-tc.dcloud.net.cn/uploads/questions/20220124/2966b0d29bf183e0fc619e10438edbbd.jpg)