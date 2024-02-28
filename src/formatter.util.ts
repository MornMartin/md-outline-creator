/**
 * GitHub哈希路由转换
 * @param title 
 */
export const githubHashFormatter = (title: string) => {
    const matchWhiteSpace = /\s/g;
    const matchInvalidChar = /\_|\(|\)|\.|、|\*/g
    return title
        .toLowerCase()
        .replace(matchWhiteSpace, '-')
        .replace(matchInvalidChar, '')
}

/**
 * 默认哈希路由转换（不做转换）
 * @param title 
 * @returns 
 */
export const defaultHashFormatter = (title: string) => {
    return title;
}

/**
 * 默认标题转换方法（去除[]()）
 * @param title 
 * @returns 
 */
export const defaultTitleFormatter = (title: string) => {
    return title.replace(/\\*\(/g, '\\(').replace(/\\*\)/g, '\\)').replace(/\\*\[/g, '\\[').replace(/\\*\]/g, '\\]');
}