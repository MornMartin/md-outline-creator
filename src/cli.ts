import MdOutlineCreator from "./MdOutlineCreator";
import { isExisted } from "./file.util";
import { isAbsolutePath, getJoinedPath, getExtname } from "./path.util";
(async function() {
    const argv = require('minimist')(process.argv.slice(2));
    const cwd = process.cwd();
    const input = argv.input || argv.i;
    const output = argv.output || argv.o;
    if(!input) throw Error('请指定输入文档路径');
    if(!output) throw Error('请指定文档输出路径');
    
    const getAbsolutePath = (p) => {
        if(isAbsolutePath(p)) {
            return p;
        }
        return getJoinedPath(cwd, p)
    }
    
    const absoluteInputPath = getAbsolutePath(input);
    const outputFile = getAbsolutePath(output);
    
    const isValidInput = await isExisted(absoluteInputPath);
    if(!isValidInput) throw Error('错误的输入文档路径')

    new MdOutlineCreator(absoluteInputPath, getExtname(outputFile) ? outputFile : `${outputFile}.md`);
    
})();
