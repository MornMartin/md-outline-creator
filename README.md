# 简介

通过生成一个markdown文件，为一组markdown文件以标题添加索引,默认生成适用于GitHub的超链接大纲。

# 安装

推荐全局安装,作为命令行工具使用

`$ npm i -g md-outline-creator`

# 使用

* CLI工具：`$ md-outline-creator -i="./demo" -o="./README.md"`
* ESM：
```ts
import MdOutlineCreator from 'me-outline-creator';
const options = {
    // 是否忽略空文件
    isIgnoreEmptyFile: true,
    // 大纲文本到hash路由的转换方式，默认为'GitHub'
    hashFormatter: (title: string): string => {
        return title;
    }
};
new MdOutlineCreator('./demo', './README.md', options);
```