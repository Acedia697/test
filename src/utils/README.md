# URL参数解析工具 (URLParser)

这是一个功能完整的URL参数解析工具类，提供了多种方法来解析和操作URL参数。

## 功能特性

- ✅ 解析查询参数 (Query Parameters)
- ✅ 解析Hash参数
- ✅ 获取单个或多个参数值
- ✅ 解析完整URL信息
- ✅ 构建查询字符串
- ✅ 更新当前页面参数
- ✅ 移除指定参数
- ✅ 支持数组参数处理

## 基本用法

### 1. 导入工具类

```javascript
import URLParser from '@/utils/urlParser.js'
```

### 2. 解析查询参数

```javascript
// 解析当前页面URL的查询参数
const params = URLParser.parseQuery()
console.log(params) // { name: 'vue', version: '3.2.13' }

// 解析指定URL的查询参数
const params2 = URLParser.parseQuery('https://example.com?name=vue&tags=js&tags=frontend')
console.log(params2) // { name: 'vue', tags: ['js', 'frontend'] }
```

### 3. 获取单个参数

```javascript
// 获取单个参数值
const name = URLParser.getQueryParam('name')
console.log(name) // 'vue'

// 获取数组参数的所有值
const tags = URLParser.getQueryParams('tags')
console.log(tags) // ['js', 'frontend']
```

### 4. 解析Hash参数

```javascript
// URL: https://example.com#section=demo&tab=parser
const hashParams = URLParser.parseHash()
console.log(hashParams) // { section: 'demo', tab: 'parser' }
```

### 5. 解析完整URL信息

```javascript
const urlInfo = URLParser.parseURL('https://example.com:8080/path?name=vue#section')
console.log(urlInfo)
/*
{
  href: 'https://example.com:8080/path?name=vue#section',
  protocol: 'https:',
  host: 'example.com:8080',
  hostname: 'example.com',
  port: '8080',
  pathname: '/path',
  search: '?name=vue',
  hash: '#section',
  origin: 'https://example.com:8080',
  query: { name: 'vue' },
  hashParams: { hash: 'section' }
}
*/
```

### 6. 构建查询字符串

```javascript
const queryString = URLParser.buildQuery({
  name: 'vue',
  tags: ['js', 'frontend'],
  version: '3.2.13'
})
console.log(queryString) // 'name=vue&tags=js&tags=frontend&version=3.2.13'
```

### 7. 更新当前页面参数

```javascript
// 添加或更新参数（会在浏览器历史中添加新记录）
URLParser.updateQuery({
  name: 'vue',
  version: '3.2.13'
})

// 替换当前历史记录
URLParser.updateQuery({
  name: 'react'
}, true)
```

### 8. 移除参数

```javascript
// 移除单个参数
URLParser.removeQuery('name')

// 移除多个参数
URLParser.removeQuery(['name', 'version'])

// 替换当前历史记录
URLParser.removeQuery('name', true)
```

## 在Vue组件中使用

### 组合式API (Composition API)

```javascript
import { ref, onMounted } from 'vue'
import URLParser from '@/utils/urlParser.js'

export default {
  setup() {
    const queryParams = ref({})
    
    const updateParams = () => {
      queryParams.value = URLParser.parseQuery()
    }
    
    onMounted(() => {
      updateParams()
      // 监听URL变化
      window.addEventListener('popstate', updateParams)
    })
    
    const addParam = (key, value) => {
      URLParser.updateQuery({ [key]: value })
      updateParams()
    }
    
    return {
      queryParams,
      addParam
    }
  }
}
```

### 选项式API (Options API)

```javascript
import URLParser from '@/utils/urlParser.js'

export default {
  data() {
    return {
      queryParams: {}
    }
  },
  
  mounted() {
    this.updateParams()
    window.addEventListener('popstate', this.updateParams)
  },
  
  beforeUnmount() {
    window.removeEventListener('popstate', this.updateParams)
  },
  
  methods: {
    updateParams() {
      this.queryParams = URLParser.parseQuery()
    },
    
    addParam(key, value) {
      URLParser.updateQuery({ [key]: value })
      this.updateParams()
    }
  }
}
```

## 常见使用场景

### 1. 分页参数处理

```javascript
// 获取当前页码
const currentPage = URLParser.getQueryParam('page') || '1'

// 更新页码
const goToPage = (page) => {
  URLParser.updateQuery({ page: page.toString() })
}
```

### 2. 搜索参数处理

```javascript
// 获取搜索关键词
const keyword = URLParser.getQueryParam('q') || ''

// 更新搜索参数
const search = (keyword) => {
  URLParser.updateQuery({ 
    q: keyword,
    page: '1' // 搜索时重置页码
  })
}
```

### 3. 筛选参数处理

```javascript
// 获取所有筛选条件
const filters = URLParser.parseQuery()

// 添加筛选条件
const addFilter = (key, value) => {
  const currentValues = URLParser.getQueryParams(key)
  if (!currentValues.includes(value)) {
    URLParser.updateQuery({ [key]: [...currentValues, value] })
  }
}

// 移除筛选条件
const removeFilter = (key, value) => {
  const currentValues = URLParser.getQueryParams(key)
  const newValues = currentValues.filter(v => v !== value)
  
  if (newValues.length === 0) {
    URLParser.removeQuery(key)
  } else {
    URLParser.updateQuery({ [key]: newValues })
  }
}
```

## 注意事项

1. 所有方法都会自动处理URL编码/解码
2. 支持数组参数的自动识别和处理
3. 错误处理：当URL格式不正确时会返回空对象或null
4. 浏览器兼容性：使用现代浏览器的URL API，支持IE11+
5. 参数值为null或undefined时会被自动过滤

## API参考

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `parseQuery(url?)` | url: string | Object | 解析查询参数 |
| `parseHash(url?)` | url: string | Object | 解析Hash参数 |
| `getQueryParam(key, url?)` | key: string, url?: string | string\|null | 获取单个参数 |
| `getQueryParams(key, url?)` | key: string, url?: string | Array | 获取数组参数 |
| `parseURL(url?)` | url?: string | Object\|null | 解析完整URL |
| `buildQuery(params)` | params: Object | string | 构建查询字符串 |
| `updateQuery(params, replace?)` | params: Object, replace?: boolean | void | 更新页面参数 |
| `removeQuery(keys, replace?)` | keys: string\|Array, replace?: boolean | void | 移除参数 |
