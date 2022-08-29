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
export const defaultFormatter = (title: string) => {
    return title;
}