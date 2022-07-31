import { getMdOutline, IHeadingNode } from './md.util';
import { decodeFilePaths, IFileInfo, getResolvedPath, parsePath, getRelativePath, getExtname } from './path.util';
import { deleteFile, getMdFiles, isDirectory, readFileText, writeFile } from "./file.util";

export type TFileList = string[];

export type TFileInfoList = IFileInfo[];

export type TOutlineMap = {[file: string]: IHeadingNode[]}

export interface IOptions {
    isIgnoreEmptyFile?: boolean;
}

export interface IFolderInfo {
    name: string;
    files: TFileInfoList;
}

export const getDefaultOptions = (): IOptions => {
    return {
        isIgnoreEmptyFile: true
    }
};

export default class MdOutlineCreator {
    private input: string;
    private output: string;
    private options: IOptions;
    private _files: TFileList;
    private _fileListGetter: ((files: TFileList) => void)[] = [];
    private _fileInfoList: TFileInfoList;
    private _fileInfoListGetter: ((list: TFileInfoList) => void)[] = [];
    private _outlineMap: TOutlineMap = {};
    private _outlineMapGetter: ((map: TOutlineMap) => void)[] = [];
    constructor(input: string, output: string, options: IOptions = {}) {
        this.input = input;
        this.output = output;
        const defaultOptions = getDefaultOptions();
        this.options = {...defaultOptions, ...options};
        this.doCreate();
    }
    /**
     * 获取文件列表
     */
    get files(): Promise<TFileList> {
        if(this._files) {
            return Promise.resolve(this._files)
        }
        return new Promise(resolve => {
            this._fileListGetter.push(resolve)
        })
    }
    /**
     * 获取文件附加信息列表
     */
    get fileInfoList(): Promise<TFileInfoList> {
        if(this._fileInfoList) {
            return Promise.resolve(this._fileInfoList)
        }
        return new Promise(resolve => {
            this._fileInfoListGetter.push(resolve)
        })
    }
    /**
     * 获取文件-大纲映射
     */
    get outlineMap(): Promise<TOutlineMap> {
        if(this._outlineMap) {
            return Promise.resolve(this._outlineMap)
        }
        return new Promise(resove => {
            this._outlineMapGetter.push(resove)
        })
    }
    /**
     * 输入目录
     */
    get inputFolder(): string {
        return parsePath(this.input).dir;
    }
    /**
     * 导出目录
     */
    get outputFolder(): string {
        const path = getResolvedPath(this.output);
        const parsedPath = parsePath(path);
        return parsedPath.dir;
    }
    /**
     * 触发getter
     * @param getters 
     * @param res 
     */
    private dispatchGetters(getters: ((res: any) => void)[], res: any) {
        for(const getter of getters) {
            typeof getter === 'function' && getter(res)
        }
    }
    /**
     * 触发文件列表getter
     * @param files 
     */
    private dispatchFileListGetters(files: TFileList) {
        this.dispatchGetters(this._fileListGetter, files);
        this._fileListGetter = [];
    }
    /**
     * 触发文件附加列表getter
     * @param fileInfoList 
     */
    private dispatchFileInfoListGetters(fileInfoList: TFileInfoList) {
        this.dispatchGetters(this._fileInfoListGetter, fileInfoList);
        this._fileInfoListGetter = [];
    }
    /**
     * 触发文件-大纲映射getter
     * @param outline 
     */
    private dispatchOutlineMapGetters(outline: TOutlineMap) {
        this.dispatchGetters(this._outlineMapGetter, outline);
        this._outlineMapGetter = [];
    }
    /**
     * 执行创建
     */
    private async doCreate() {
        console.log(`===> 删除${this.output}`)
        await this.deleteExistedOutFile()
        console.log('===> 获取文档列表')
        await this.getFileList();
        console.log(await this.files)
        await this.encodeFileInfoList();
        console.log('===> 读取文档大纲')
        await this.encodeOutlineMap();
        await this.writeDocFile();
        console.log('===| 创建成功')
    }
    /**
     * 删除已存在的导出文件
     * @returns 
     */
    private async deleteExistedOutFile() {
        return await deleteFile(this.output)
    }
    /**
     * 获取文件列表
     */
    private async getFileList() {
        const isDir = await isDirectory(this.input);
        const isMd = getExtname(this.input) === '.md';
        if(!isDir && isMd) {
            this._files = [this.input];
        }else if(!isDir && !isMd) {
            this._files = [];
        }else{
            this._files = await getMdFiles(this.input);
        }
        this.dispatchFileListGetters(this._files);
    }
    /**
     * 编写文件列表附加信息
     */
    private async encodeFileInfoList() {
        const files = await this.files;
        this._fileInfoList = decodeFilePaths(files, this.inputFolder);
        this.dispatchFileInfoListGetters(this._fileInfoList)
    }
    /**
     * 编写文件-大纲映射
     */
    private async encodeOutlineMap() {
        const files = await this.files;
        for(const file of files) {
            const content = await readFileText(file);
            const outline = getMdOutline(content);
            this._outlineMap[file] = outline;
        }
        this.dispatchOutlineMapGetters(this._outlineMap);
    }
    /**
     * 将文件信息按文件夹编组
     * @param fileInfoList 
     * @returns 
     */
    private groupFileInfoList(fileInfoList: TFileInfoList): IFolderInfo[] {
        const grpMap = {};
        for(const item of fileInfoList) {
            const dir = item.dirs.join('/')
            const currentGrp = grpMap[dir];
            if(currentGrp) {
                currentGrp.push(item);
            }else{
                grpMap[dir] = [item];
            }
        }
        return Object.keys(grpMap).map(key => {
            return {
                name: key,
                files: grpMap[key]
            }
        });
    }
    /**
     * 获取文件对应大纲信息
     * @param path 
     * @returns 
     */
    private async getOutlineInfo(path: string) {
        const outlineMap = await this.outlineMap;
        return outlineMap[path] || [];
    }
    /**
     * 创建哈希路由
     * @param title 
     * @returns 
     */
    private createHashRoute(title: string): string {
        const matchWhiteSpace = /\s/g;
        const matchInvalidChar = /\_|\(|\)/g
        return title
            .toLowerCase()
            .replace(matchWhiteSpace, '-')
            .replace(matchInvalidChar, '')
            .replace('\.', '')
    }
    /**
     * 创建大纲列表
     * @param outline 大纲内容
     * @param tabLevel 缩进等级
     * @returns 
     */
    private createOutlineList(filePath: string, outline: IHeadingNode[], tabLevel: number): string {
        return outline.map(item => {
            const tab = '\t'.repeat(tabLevel)
            const children = this.createOutlineList(filePath, item.children, tabLevel + 1);
            const target = getRelativePath(this.outputFolder, filePath)
            const hash = this.createHashRoute(item.text);
            const link = `[${item.text}](${target}#${hash})`
            return `\n${tab}* ${link}\n${children}`;
        }).join('');
    }
    /**
     * 创建文件内容大纲
     * @param file 
     * @returns 
     */
    private async createFileOutline(file: IFileInfo): Promise<string> {
        const outline = await this.getOutlineInfo(file.path);
        const outlineList = this.createOutlineList(file.path, outline, 0);
        if(!outlineList && this.options.isIgnoreEmptyFile) return '';
        return `\n## ${file.fileName}\n${outlineList}`;
    }
    /**
     * 创建目录下文件内容大纲
     * @param folder 
     */
    private async createFolderOutline(folder: IFolderInfo): Promise<string> {
        const files = folder.files;
        let temp = '';
        for(const file of files) {
            temp += await this.createFileOutline(file);
        }
        if(!temp) return '';
        return `${folder.name && `\n# ${folder.name}` || ''}\n${temp}`;
    }
    /**
     * 写入文档内容
     */
    private async writeDocFile() {
        const content = await this.createDocContent();
        writeFile(this.output, content);
    }
    /**
     * 生成文档内容
     */
    public async createDocContent(): Promise<string> {
        const folders = this.groupFileInfoList(await this.fileInfoList);
        let temp = '';
        for(const folder of folders) {
            temp += await this.createFolderOutline(folder);
        }
        return temp;
    }
}
