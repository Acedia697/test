<template>
  <div class="url-parser-demo">
    <h2>URL参数解析演示</h2>

    <!-- 当前URL信息 -->
    <div class="section">
      <h3>当前URL信息</h3>
      <div class="url-info">
        <p><strong>完整URL:</strong> {{ currentUrl.href }}</p>
        <p><strong>协议:</strong> {{ currentUrl.protocol }}</p>
        <p><strong>主机:</strong> {{ currentUrl.host }}</p>
        <p><strong>路径:</strong> {{ currentUrl.pathname }}</p>
        <p><strong>查询字符串:</strong> {{ currentUrl.search }}</p>
        <p><strong>Hash:</strong> {{ currentUrl.hash }}</p>
      </div>
    </div>

    <!-- 原生 window.location.search -->
    <div class="section">
      <h3>原生 window.location.search</h3>
      <div class="location-info">
        <p>
          <strong>window.location.search:</strong>
          <code>{{ locationSearch || "(空)" }}</code>
        </p>
        <p><strong>解析后的参数:</strong></p>
        <div v-if="Object.keys(locationSearchParams).length > 0" class="params">
          <div
            v-for="(value, key) in locationSearchParams"
            :key="key"
            class="param-item"
          >
            <strong>{{ key }}:</strong>
            <span v-if="Array.isArray(value)">{{ value.join(", ") }}</span>
            <span v-else>{{ value }}</span>
          </div>
        </div>
        <p v-else class="no-params">没有查询参数</p>

        <div class="debug-controls">
          <button @click="logCurrentUrlInfo" class="debug-btn">
            在控制台打印URL信息
          </button>
          <button @click="showLocationDetails" class="debug-btn">
            显示详细信息
          </button>
        </div>

        <div v-if="showDetails" class="location-details">
          <h4>详细的 window.location 信息:</h4>
          <pre>{{ locationDetails }}</pre>
        </div>
      </div>
    </div>

    <!-- 查询参数 -->
    <div class="section">
      <h3>URLParser 解析的查询参数</h3>
      <div v-if="Object.keys(queryParams).length > 0" class="params">
        <div v-for="(value, key) in queryParams" :key="key" class="param-item">
          <strong>{{ key }}:</strong>
          <span v-if="Array.isArray(value)">{{ value.join(", ") }}</span>
          <span v-else>{{ value }}</span>
        </div>
      </div>
      <p v-else class="no-params">没有查询参数</p>
    </div>

    <!-- Hash参数 -->
    <div class="section">
      <h3>Hash参数</h3>
      <div v-if="Object.keys(hashParams).length > 0" class="params">
        <div v-for="(value, key) in hashParams" :key="key" class="param-item">
          <strong>{{ key }}:</strong>
          <span v-if="Array.isArray(value)">{{ value.join(", ") }}</span>
          <span v-else>{{ value }}</span>
        </div>
      </div>
      <p v-else class="no-params">没有Hash参数</p>
    </div>

    <!-- 测试URL输入 -->
    <div class="section">
      <h3>测试URL解析</h3>
      <div class="input-group">
        <input
          v-model="testUrl"
          type="text"
          placeholder="输入要解析的URL"
          class="url-input"
        />
        <button @click="parseTestUrl" class="parse-btn">解析</button>
      </div>

      <div v-if="testResult" class="test-result">
        <h4>解析结果:</h4>
        <pre>{{ JSON.stringify(testResult, null, 2) }}</pre>
      </div>
    </div>

    <!-- 参数操作 -->
    <div class="section">
      <h3>参数操作</h3>
      <div class="controls">
        <div class="control-group">
          <input v-model="newParamKey" placeholder="参数名" />
          <input v-model="newParamValue" placeholder="参数值" />
          <button @click="addParam">添加参数</button>
        </div>

        <div class="control-group">
          <input v-model="removeParamKey" placeholder="要移除的参数名" />
          <button @click="removeParam">移除参数</button>
        </div>

        <button @click="clearAllParams" class="clear-btn">清空所有参数</button>
      </div>
    </div>

    <!-- 常用示例 -->
    <div class="section">
      <h3>常用示例</h3>
      <div class="examples">
        <button @click="loadExample1">示例1: 基本参数</button>
        <button @click="loadExample2">示例2: 数组参数</button>
        <button @click="loadExample3">示例3: Hash参数</button>
      </div>
    </div>
  </div>
</template>

<script>
import URLParser from "@/utils/urlParser.js";
import { logLocationInfo, getLocationInfo } from "@/utils/simpleUrlParser.js";

export default {
  name: "URLParserDemo",
  data() {
    return {
      currentUrl: {},
      queryParams: {},
      hashParams: {},
      locationSearch: "",
      locationSearchParams: {},
      showDetails: false,
      locationDetails: "",
      testUrl: "",
      testResult: null,
      newParamKey: "",
      newParamValue: "",
      removeParamKey: "",
    };
  },
  mounted() {
    this.updateCurrentUrl();
    // 监听URL变化
    window.addEventListener("popstate", this.updateCurrentUrl);
  },
  beforeUnmount() {
    window.removeEventListener("popstate", this.updateCurrentUrl);
  },
  methods: {
    updateCurrentUrl() {
      this.currentUrl = URLParser.parseURL();
      this.queryParams = URLParser.parseQuery();
      this.hashParams = URLParser.parseHash();

      // 使用原生 window.location.search
      this.locationSearch = window.location.search;
      this.locationSearchParams = this.parseLocationSearch();
    },

    // 解析 window.location.search 的方法
    parseLocationSearch() {
      const params = {};
      const searchParams = new URLSearchParams(window.location.search);

      searchParams.forEach((value, key) => {
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

      return params;
    },

    // 在控制台打印URL信息
    logCurrentUrlInfo() {
      logLocationInfo();
    },

    // 显示详细的location信息
    showLocationDetails() {
      this.showDetails = !this.showDetails;
      if (this.showDetails) {
        this.locationDetails = JSON.stringify(getLocationInfo(), null, 2);
      }
    },

    parseTestUrl() {
      if (this.testUrl) {
        this.testResult = URLParser.parseURL(this.testUrl);
      }
    },

    addParam() {
      if (this.newParamKey && this.newParamValue) {
        URLParser.updateQuery({
          [this.newParamKey]: this.newParamValue,
        });
        this.updateCurrentUrl();
        this.newParamKey = "";
        this.newParamValue = "";
      }
    },

    removeParam() {
      if (this.removeParamKey) {
        URLParser.removeQuery(this.removeParamKey);
        this.updateCurrentUrl();
        this.removeParamKey = "";
      }
    },

    clearAllParams() {
      const keys = Object.keys(this.queryParams);
      if (keys.length > 0) {
        URLParser.removeQuery(keys);
        this.updateCurrentUrl();
      }
    },

    loadExample1() {
      URLParser.updateQuery(
        {
          name: "Vue项目",
          version: "3.2.13",
          type: "demo",
        },
        true
      );
      this.updateCurrentUrl();
    },

    loadExample2() {
      URLParser.updateQuery(
        {
          tags: ["vue", "javascript", "frontend"],
          category: "web",
        },
        true
      );
      this.updateCurrentUrl();
    },

    loadExample3() {
      window.location.hash = "section=demo&tab=parser&mode=test";
      setTimeout(() => {
        this.updateCurrentUrl();
      }, 100);
    },
  },
};
</script>

<style scoped>
.url-parser-demo {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.section h3 {
  margin-top: 0;
  color: #333;
}

.url-info p {
  margin: 8px 0;
  word-break: break-all;
}

.params {
  background-color: white;
  padding: 15px;
  border-radius: 4px;
  border: 1px solid #eee;
}

.param-item {
  margin: 8px 0;
  padding: 5px 0;
  border-bottom: 1px solid #f0f0f0;
}

.param-item:last-child {
  border-bottom: none;
}

.no-params {
  color: #666;
  font-style: italic;
}

.input-group {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.url-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.parse-btn,
button {
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.parse-btn:hover,
button:hover {
  background-color: #0056b3;
}

.test-result {
  margin-top: 15px;
}

.test-result pre {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.control-group {
  display: flex;
  gap: 10px;
  align-items: center;
}

.control-group input {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-width: 120px;
}

.clear-btn {
  background-color: #dc3545;
}

.clear-btn:hover {
  background-color: #c82333;
}

.examples {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.examples button {
  background-color: #28a745;
}

.examples button:hover {
  background-color: #218838;
}

.location-info {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  border: 1px solid #dee2e6;
}

.location-info code {
  background-color: #e9ecef;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: "Courier New", monospace;
  font-size: 14px;
  color: #495057;
  word-break: break-all;
}

.debug-controls {
  margin-top: 15px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.debug-btn {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.debug-btn:hover {
  background-color: #5a6268;
}

.location-details {
  margin-top: 15px;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 15px;
}

.location-details h4 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #495057;
}

.location-details pre {
  background-color: #ffffff;
  border: 1px solid #e9ecef;
  border-radius: 3px;
  padding: 10px;
  font-size: 12px;
  overflow-x: auto;
  margin: 0;
}
</style>
