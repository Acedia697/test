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

    <!-- 支付请求示例 -->
    <div class="section">
      <h3>支付请求示例</h3>
      <div class="payment-demo">
        <div class="input-group">
          <label>模拟支付URL:</label>
          <input
            v-model="paymentUrl"
            type="text"
            placeholder="https://example.com/payment?type=alipay&id=12345"
            class="payment-url-input"
          />
        </div>

        <div class="payment-params" v-if="parsedPaymentParams">
          <h4>解析到的支付参数:</h4>
          <div class="param-display">
            <p>
              <strong>支付类型 (type):</strong>
              {{ parsedPaymentParams.type || "未设置" }}
            </p>
            <p>
              <strong>订单ID (id):</strong>
              {{ parsedPaymentParams.id || "未设置" }}
            </p>
          </div>
        </div>

        <div class="payment-controls">
          <button @click="parsePaymentUrl" class="parse-payment-btn">
            解析支付URL
          </button>
          <button
            @click="sendPaymentRequest"
            :disabled="!canSendPayment"
            class="send-payment-btn"
          >
            发送支付请求
          </button>
        </div>

        <div v-if="paymentResult" class="payment-result">
          <h4>请求结果:</h4>
          <div
            class="result-status"
            :class="paymentResult.success ? 'success' : 'error'"
          >
            {{ paymentResult.success ? "✅ 请求成功" : "❌ 请求失败" }}
          </div>
          <pre>{{ JSON.stringify(paymentResult, null, 2) }}</pre>
        </div>
      </div>
    </div>

    <!-- 常用示例 -->
    <div class="section">
      <h3>常用示例</h3>
      <div class="examples">
        <button @click="loadExample1">示例1: 基本参数</button>
        <button @click="loadExample2">示例2: 数组参数</button>
        <button @click="loadExample3">示例3: Hash参数</button>
        <button @click="loadPaymentExample">示例4: 支付URL</button>
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
      // 支付相关数据
      paymentUrl: "https://example.com/payment?type=alipay&id=12345",
      parsedPaymentParams: null,
      paymentResult: null,
    };
  },
  computed: {
    // 检查是否可以发送支付请求
    canSendPayment() {
      return (
        this.parsedPaymentParams &&
        this.parsedPaymentParams.type &&
        this.parsedPaymentParams.id
      );
    },
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

    // 加载支付URL示例
    loadPaymentExample() {
      this.paymentUrl =
        "https://example.com/payment?type=wechat&id=ORDER_20231201_001";
      this.parsePaymentUrl();
    },

    // 解析支付URL
    parsePaymentUrl() {
      try {
        if (this.paymentUrl) {
          const params = URLParser.parseQuery(this.paymentUrl);
          this.parsedPaymentParams = {
            type: params.type || null,
            id: params.id || null,
          };
          this.paymentResult = null; // 清除之前的结果
        }
      } catch (error) {
        console.error("解析支付URL失败:", error);
        this.parsedPaymentParams = null;
      }
    },

    // 发送支付请求
    async sendPaymentRequest() {
      if (!this.canSendPayment) {
        alert("请先解析有效的支付URL");
        return;
      }

      try {
        // 构建请求数据
        const requestData = {
          orderId: this.parsedPaymentParams.id,
          paymentMethodType: this.parsedPaymentParams.type,
          resourceType: "android",
        };

        console.log("发送支付请求:", requestData);

        // 发送POST请求
        const response = await fetch(
          "https://eotoai-app.caideai.com/app/pay/elepay",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              // 如果需要其他headers，可以在这里添加
              // 'Authorization': 'Bearer your-token',
            },
            body: JSON.stringify(requestData),
          }
        );

        const result = await response.json();

        this.paymentResult = {
          success: response.ok,
          status: response.status,
          statusText: response.statusText,
          data: result,
          requestData: requestData,
          timestamp: new Date().toISOString(),
        };

        console.log("支付请求结果:", this.paymentResult);
      } catch (error) {
        console.error("支付请求失败:", error);

        this.paymentResult = {
          success: false,
          error: error.message,
          requestData: {
            orderId: this.parsedPaymentParams.id,
            paymentMethodType: this.parsedPaymentParams.type,
            resourceType: "android",
          },
          timestamp: new Date().toISOString(),
        };
      }
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

/* 支付相关样式 */
.payment-demo {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border: 2px solid #007bff;
}

.payment-url-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  margin-top: 5px;
}

.payment-params {
  margin: 15px 0;
  padding: 15px;
  background-color: #e7f3ff;
  border-radius: 4px;
  border-left: 4px solid #007bff;
}

.param-display p {
  margin: 8px 0;
  font-size: 14px;
}

.payment-controls {
  display: flex;
  gap: 10px;
  margin: 15px 0;
}

.parse-payment-btn {
  background-color: #17a2b8;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.parse-payment-btn:hover {
  background-color: #138496;
}

.send-payment-btn {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.send-payment-btn:hover:not(:disabled) {
  background-color: #218838;
}

.send-payment-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.payment-result {
  margin-top: 20px;
  padding: 15px;
  border-radius: 4px;
  background-color: #ffffff;
  border: 1px solid #dee2e6;
}

.result-status {
  padding: 8px 12px;
  border-radius: 4px;
  margin-bottom: 10px;
  font-weight: bold;
}

.result-status.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.result-status.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.payment-result pre {
  background-color: #f8f9fa;
  padding: 10px;
  border-radius: 4px;
  font-size: 12px;
  overflow-x: auto;
  margin: 0;
}
</style>
