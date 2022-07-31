const MarkdownIt = require('markdown-it');

const md = new MarkdownIt();

/**
 * 匹配开始标签
 */
const matchTagStart = /_open$/
/**
 * 匹配结束标签
 */
const matchTagEnd = /_close$/
/**
 * 匹配h系标签
 */
const matchHeadingTag = /^h\d+$/

export interface TToken {
    tag: string;
    type: string;
    content?: string;
    children: TToken[];
}

/**
 * 渲染节点
 */
export interface IRenderNode {
    tag: string;
    content: (string | IRenderNode)[]
}

/**
 * 标题节点
 */
export interface IHeadingNode {
    text: string;
    level: number;
    children: IHeadingNode[]
}

/**
 * 获取大纲
 * @param content markdown文本内容
 * @returns 
 */
export const getMdOutline = (content: string) => {
    const tokens = md.parse(content, {})
    const renderTree = encodeRenderTree(tokens);
    const headingList = getHeadingList(renderTree);
    const headingTree = encodeHeadingTree(headingList);
    return headingTree;
}

/**
 * 筛选出标题列表
 * @param renderTree 渲染树
 * @returns 
 */
export const getHeadingList = (renderTree: IRenderNode[]) => {
    return renderTree.filter(item => {
        // 由于h系标签不存在嵌套，顶层过滤即可获得
        return matchHeadingTag.test(item.tag)
    });
}
/**
 * 将标题列表打包成树
 * @param headingList 标题列表
 * @returns 
 */
export const encodeHeadingTree = (headingList: IRenderNode[]): IHeadingNode[] => {
    const root: IHeadingNode = {
        level: 0, // heading level不可能小于等于0
        text: '',
        children: []
    }
    const stack = [root];
    for(const item of headingList) {
        const headingNode = createHeadingNode(item);
        // 取level小于当前节点的末尾一位作为父级
        const candidateParent = stack.filter(n => n.level < headingNode.level).pop();
        if(candidateParent) {
            candidateParent.children.push(headingNode)
        }
        stack.push(headingNode)
    }
    return root.children;
}
/**
 * 创建标题节点
 * @param heading 标题渲染节点
 * @returns 
 */
export const createHeadingNode = (heading: IRenderNode): IHeadingNode => {
    return {
        level: Number(heading.tag.replace('h', '')),
        // h系标签不存在嵌套，content仅为标签内容
        text: heading.content.join(''),
        children: [],
    }
}

/**
 * 创建渲染节点树
 * @param tokens 
 * @returns 
 */
export const encodeRenderTree = (tokens: TToken[]):IRenderNode[]  => {
    const root = createEmptyRenderNode('');
    const stack = [root];
    for(const token of tokens) {
        const currentNode = stack[stack.length - 1];
        const isStart = matchTagStart.test(token.type);
        const isEnd = matchTagEnd.test(token.type);
        const isSelfClosing = !isStart && !isEnd;
        if(isStart) {// 开始标签
            const node = createEmptyRenderNode(token.tag);
            stack.push(node)
            currentNode.content.push(node)
        }
        if(isEnd) { // 结束标签
            stack.pop()
        }
        if(isSelfClosing) { // 自闭合标签
            currentNode.content.push(token.content || token.tag && createRenderNode(token.tag, token.children) || '')
        }
    }
    return root.content as IRenderNode[];
}

/**
 * 创建空渲染节点
 * @param tag 标签名
 * @returns 
 */
export const createEmptyRenderNode = (tag: string): IRenderNode => {
    return {
        tag,
        content: [],
    }
}
/**
 * 创建含渲染内容的节点
 * @param tag 标签名
 * @param children 
 * @returns 
 */
export const createRenderNode = (tag: string, children: TToken[]): IRenderNode => {
    return {...createEmptyRenderNode(tag), content: encodeRenderTree(children)}
}
