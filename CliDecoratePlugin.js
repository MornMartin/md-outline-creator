/**
 * 为命令行调用入口文件添加脚本文件的解释程序语句
 */
const fs = require('fs');
class CliJsDecoratePlugin {
    files;
    constructor(options) {
        this.files = options?.files || [];
    }
    apply(compiler) {
        compiler.hooks.done.tap('CliJsDecoratePlugin', (compilation, callback) => {
            for(const file of this.files) {
                const isCliExsited = fs.existsSync(file)
                if(!isCliExsited) {
                    return console.error(`CliJsDecoratePlugin：${file} 不存在`)
                };
                const content = fs.readFileSync(file, 'utf-8');
                fs.writeFile(file, `#!/usr/bin/env node\n${content}`, {flag: 'w+'}, err => {
                    if(err) {
                        console.error(err)
                    }
                })
            }
        });
    }
}
module.exports = CliJsDecoratePlugin;
