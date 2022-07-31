import { getResolvedPath } from "./path.util";
const fs = require('fs');
const path = require('path');
const rm = require('rimraf');
/**
 * 扫描文件夹
 * @param dir 文件夹目录
 * @returns 
 */
export const readDir = (dir: string): Promise<string[]> => {
    const resolvedPath = getResolvedPath(dir)
    return new Promise(resolve => {
        fs.readdir(resolvedPath, (err, fileNames) => {
            if(err) {
                console.error(err)
            }
            const filePaths = (fileNames || []).map(item => {
                return path.join(resolvedPath, item)
            })
            resolve(filePaths);
        })
    })
}

/**
 * 扫描多个文件夹
 * @param dirs 文件夹列表
 * @returns 
 */
export const readDirs = async (dirs: string[]): Promise<string[]> => {
    let temp = [];
    for(const dir of dirs) {
        temp = temp.concat(await readDir(dir))
    }
    return temp;
}

/**
 * 判断目标路径是否为文件夹
 * @param filePath 目录
 * @returns 
 */
export const isDirectory = (filePath: string): Promise<boolean> => {
    const resolvedPath = getResolvedPath(filePath)
    return new Promise((resolve, reject) => {
        fs.stat(resolvedPath, (err, stats) => {
            if(stats?.isFile?.()) {
                return resolve(false)
            }
            if(stats?.isDirectory?.()) {
                return resolve(true)
            }
            reject(err || `查询${resolvedPath}失败`)
        })
    })
}

/**
 * 获取路径下所有文件
 * @param filePath 目录/目录列表
 * @returns 
 */
export const getFiles = async (filePath: string | string[]) => {
    let temp = [];
    const paths = Array.isArray(filePath) ? filePath : [filePath];
    const files: string[] = await readDirs(paths);
    for(const item of files) {
        if(await isDirectory(item)) {
            temp = temp.concat(await getFiles(item))
        }else{
            temp = temp.concat([item])
        }
    }
    return temp;
}
/**
 * 获取路径下markdown文件
 * @param filePath 目录/目录列表
 */
export const getMdFiles = async (filePath: string | string[]) => {
    const allFiles = await getFiles(filePath);
    return allFiles.filter(item => {
        return /.md$/.test(item)
    })
}

/**
 * 读取文件内容
 * @param src 文件地址 
 * @returns 
 */
export const readFileText = (src: string): Promise<string> => {
    const resolvedPath = getResolvedPath(src);
    return new Promise((resolve, reject) => {
        fs.readFile(resolvedPath, 'utf-8', (err, content) => {
            if(err) {
                reject(err)
            }else{
                resolve(content);
            }
        });
    })
}

/**
 * 文件内容写入（覆盖）
 * @param path 文件路径
 * @param content 内容
 * @returns 
 */
export const writeFile = (path: string, content: string): Promise<boolean> => {
    return new Promise(resolve => {
        fs.writeFile(path, content, err => {
            if(err) {
                resolve(false)
            }else{
                resolve(true);
            }
        })
    })
}

/**
 * 判断文件/文件夹是否存在
 * @param path 
 * @returns 
 */
export const isExisted = (path: string): Promise<boolean> => {
    const resolvedPath = getResolvedPath(path)
    return new Promise(resolve => {
        fs.exists(resolvedPath, (res) => {
            resolve(res)
        })
    })
}
/**
 * 删除文件
 * @param path 文件地址
 * @returns 
 */
export const deleteFile = (path: string): Promise<boolean> => {
    const resolvedPath = getResolvedPath(path);
    return new Promise(resolve => {
        rm(resolvedPath, (err) => {
            if (err) {
                resolve(false)
            }else {
                resolve(true)
            };
        })
    })
}