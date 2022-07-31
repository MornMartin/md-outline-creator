
const path = require('path');

/**
 * 获取绝对路径
 * @param src 相对路径
 * @returns 
 */
export const getResolvedPath = (src: string): string => {
    return path.resolve(src);
}

/**
 * 获取拼接路径
 * @param param0 
 * @returns 
 */
export function getJoinedPath (...paths): string {
    return path.join(...arguments);
}
/**
 * 获取文件后缀名
 * @param src 
 * @returns 
 */
export const getExtname = (src: string): string => {
    return path.extname(src);
}

/**
 * 判断是否为绝对路径
 */
export const isAbsolutePath =(p: string): boolean => {
    return path.isAbsolute(p)
}

/**
 * 获取相对路径
 * @param from 当前路径
 * @param to 目标路径
 * @returns 
 */
export const getRelativePath = (from: string, to: string): string => {
    return path.relative(from, to);
}
/**
 * 解析路径信息
 * @param p 
 * @returns 
 */
export const parsePath = (p: string) => {
    return path.parse(p);
}
/**
 * 分割目录
 * @param p 
 * @returns 
 */
export const splitPath = (p: string): string[] => {
    return p.split(path.sep).filter(item => item);
}

export interface IFileInfo {
    path: string;
    dirs: string[];
    fileName: string;
}

/**
 * 解析文件路径列表
 * @param path 分析路径
 * @param base 起始路径
 * @returns 
 */
export const decodeFilePaths = (paths: string[], base: string): IFileInfo[] => {
    return paths.map(item => {
        return decodeFilePath(item, base);
    })
}

/**
 * 解析文件路径
 * @param path 分析路径
 * @param base 起始路径
 * @returns 
 */
export const decodeFilePath = (path: string, base: string): IFileInfo => {
    const parsedInfo = parsePath(path);
    const resolvedBase = getResolvedPath(base);
    return {
        path,
        dirs: splitPath(parsedInfo.dir.replace(resolvedBase, '')),
        fileName: parsedInfo.name,
    }
}
