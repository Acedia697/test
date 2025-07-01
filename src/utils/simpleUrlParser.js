/**
 * 简单的URL参数解析工具 - 使用原生 window.location.search
 */

/**
 * 获取当前页面的查询字符串
 * @returns {string} 查询字符串 (包含 ? 号)
 */
export function getLocationSearch() {
  return window.location.search;
}

/**
 * 解析 window.location.search 为参数对象
 * @returns {Object} 解析后的参数对象
 */
export function parseLocationSearch() {
  const params = {};
  const searchParams = new URLSearchParams(window.location.search);
  
  // 遍历所有参数
  searchParams.forEach((value, key) => {
    // 处理重复参数（数组形式）
    if (params[key]) {
      if (Array.isArray(params[key])) {
        params[key].push(value);
      } else {
        params[key] = [params[key], value];
      }
    } else {
      params[key] = value;
    }
  });
  
  return params;
}

/**
 * 获取单个查询参数的值
 * @param {string} key - 参数名
 * @returns {string|null} 参数值
 */
export function getSearchParam(key) {
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get(key);
}

/**
 * 获取所有同名查询参数的值（数组形式）
 * @param {string} key - 参数名
 * @returns {Array} 参数值数组
 */
export function getSearchParams(key) {
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.getAll(key);
}

/**
 * 检查是否存在指定的查询参数
 * @param {string} key - 参数名
 * @returns {boolean} 是否存在
 */
export function hasSearchParam(key) {
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.has(key);
}

/**
 * 获取所有查询参数的键名
 * @returns {Array} 参数键名数组
 */
export function getSearchParamKeys() {
  const searchParams = new URLSearchParams(window.location.search);
  return Array.from(searchParams.keys());
}

/**
 * 显示当前URL的详细信息
 * @returns {Object} URL详细信息
 */
export function getLocationInfo() {
  return {
    href: window.location.href,           // 完整URL
    protocol: window.location.protocol,   // 协议
    host: window.location.host,           // 主机名和端口
    hostname: window.location.hostname,   // 主机名
    port: window.location.port,           // 端口
    pathname: window.location.pathname,   // 路径
    search: window.location.search,       // 查询字符串
    hash: window.location.hash,           // hash
    origin: window.location.origin,       // 源
    searchParams: parseLocationSearch()   // 解析后的查询参数
  };
}

/**
 * 在控制台打印当前URL信息（用于调试）
 */
export function logLocationInfo() {
  console.group('🔍 当前URL信息');
  console.log('完整URL:', window.location.href);
  console.log('协议:', window.location.protocol);
  console.log('主机:', window.location.host);
  console.log('路径:', window.location.pathname);
  console.log('查询字符串:', window.location.search);
  console.log('Hash:', window.location.hash);
  console.log('解析后的参数:', parseLocationSearch());
  console.groupEnd();
}

// 使用示例：
/*
// 1. 获取查询字符串
const search = getLocationSearch();
console.log('查询字符串:', search); // ?name=vue&version=3.2.13

// 2. 解析所有参数
const params = parseLocationSearch();
console.log('所有参数:', params); // { name: 'vue', version: '3.2.13' }

// 3. 获取单个参数
const name = getSearchParam('name');
console.log('name参数:', name); // 'vue'

// 4. 获取数组参数
const tags = getSearchParams('tags');
console.log('tags参数:', tags); // ['js', 'vue', 'frontend']

// 5. 检查参数是否存在
const hasName = hasSearchParam('name');
console.log('是否有name参数:', hasName); // true

// 6. 获取所有参数键名
const keys = getSearchParamKeys();
console.log('所有参数键名:', keys); // ['name', 'version', 'tags']

// 7. 获取完整URL信息
const info = getLocationInfo();
console.log('URL信息:', info);

// 8. 在控制台打印调试信息
logLocationInfo();
*/
