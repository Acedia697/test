/**
 * URL参数解析工具类
 */
class URLParser {
  /**
   * 解析URL查询参数
   * @param {string} url - 要解析的URL，如果不传则使用当前页面URL
   * @returns {Object} 解析后的参数对象
   */
  static parseQuery(url = window.location.href) {
    const params = {};
    
    try {
      // 创建URL对象
      const urlObj = new URL(url);
      
      // 遍历所有查询参数
      urlObj.searchParams.forEach((value, key) => {
        // 处理数组参数（如：?tags=vue&tags=js）
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
    } catch (error) {
      console.error('URL解析失败:', error);
    }
    
    return params;
  }

  /**
   * 解析URL的hash参数（#后面的参数）
   * @param {string} url - 要解析的URL，如果不传则使用当前页面URL
   * @returns {Object} 解析后的hash参数对象
   */
  static parseHash(url = window.location.href) {
    const params = {};
    
    try {
      const urlObj = new URL(url);
      const hash = urlObj.hash.substring(1); // 去掉#号
      
      if (hash) {
        // 检查hash是否包含查询参数格式
        if (hash.includes('=')) {
          const hashParams = new URLSearchParams(hash);
          hashParams.forEach((value, key) => {
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
        } else {
          // 如果hash不是参数格式，直接返回hash值
          params.hash = hash;
        }
      }
    } catch (error) {
      console.error('Hash解析失败:', error);
    }
    
    return params;
  }

  /**
   * 获取单个查询参数的值
   * @param {string} key - 参数名
   * @param {string} url - 要解析的URL，如果不传则使用当前页面URL
   * @returns {string|null} 参数值
   */
  static getQueryParam(key, url = window.location.href) {
    try {
      const urlObj = new URL(url);
      return urlObj.searchParams.get(key);
    } catch (error) {
      console.error('获取查询参数失败:', error);
      return null;
    }
  }

  /**
   * 获取所有同名查询参数的值（数组形式）
   * @param {string} key - 参数名
   * @param {string} url - 要解析的URL，如果不传则使用当前页面URL
   * @returns {Array} 参数值数组
   */
  static getQueryParams(key, url = window.location.href) {
    try {
      const urlObj = new URL(url);
      return urlObj.searchParams.getAll(key);
    } catch (error) {
      console.error('获取查询参数数组失败:', error);
      return [];
    }
  }

  /**
   * 解析完整的URL信息
   * @param {string} url - 要解析的URL，如果不传则使用当前页面URL
   * @returns {Object} 包含URL各部分信息的对象
   */
  static parseURL(url = window.location.href) {
    try {
      const urlObj = new URL(url);
      
      return {
        href: urlObj.href,           // 完整URL
        protocol: urlObj.protocol,   // 协议 (http:, https:)
        host: urlObj.host,           // 主机名和端口
        hostname: urlObj.hostname,   // 主机名
        port: urlObj.port,           // 端口
        pathname: urlObj.pathname,   // 路径
        search: urlObj.search,       // 查询字符串 (?key=value)
        hash: urlObj.hash,           // hash (#section)
        origin: urlObj.origin,       // 源 (protocol + host)
        query: this.parseQuery(url), // 解析后的查询参数对象
        hashParams: this.parseHash(url) // 解析后的hash参数对象
      };
    } catch (error) {
      console.error('URL解析失败:', error);
      return null;
    }
  }

  /**
   * 构建查询字符串
   * @param {Object} params - 参数对象
   * @returns {string} 查询字符串
   */
  static buildQuery(params) {
    const searchParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      const value = params[key];
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, v));
      } else if (value !== null && value !== undefined) {
        searchParams.append(key, value);
      }
    });
    
    return searchParams.toString();
  }

  /**
   * 更新当前页面的查询参数
   * @param {Object} params - 要更新的参数对象
   * @param {boolean} replace - 是否替换当前历史记录（默认false，会添加新的历史记录）
   */
  static updateQuery(params, replace = false) {
    const url = new URL(window.location.href);
    
    Object.keys(params).forEach(key => {
      const value = params[key];
      if (value === null || value === undefined) {
        url.searchParams.delete(key);
      } else if (Array.isArray(value)) {
        url.searchParams.delete(key);
        value.forEach(v => url.searchParams.append(key, v));
      } else {
        url.searchParams.set(key, value);
      }
    });
    
    if (replace) {
      window.history.replaceState({}, '', url.toString());
    } else {
      window.history.pushState({}, '', url.toString());
    }
  }

  /**
   * 移除指定的查询参数
   * @param {string|Array} keys - 要移除的参数名或参数名数组
   * @param {boolean} replace - 是否替换当前历史记录（默认false）
   */
  static removeQuery(keys, replace = false) {
    const url = new URL(window.location.href);
    const keysArray = Array.isArray(keys) ? keys : [keys];
    
    keysArray.forEach(key => {
      url.searchParams.delete(key);
    });
    
    if (replace) {
      window.history.replaceState({}, '', url.toString());
    } else {
      window.history.pushState({}, '', url.toString());
    }
  }
}

export default URLParser;
