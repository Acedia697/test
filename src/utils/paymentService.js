/**
 * 支付服务工具类
 * 用于处理支付相关的URL解析和API请求
 */

import URLParser from './urlParser.js';

// 支付API配置
const PAYMENT_CONFIG = {
  API_URL: 'https://eotoai-app.caideai.com/app/pay/elepay',
  RESOURCE_TYPE: 'android',
  TIMEOUT: 30000 // 30秒超时
};

/**
 * 支付服务类
 */
class PaymentService {
  /**
   * 解析支付URL，提取type和id参数
   * @param {string} url - 支付URL，格式如: https://example.com/payment?type=alipay&id=12345
   * @returns {Object} 解析结果 { type: string, id: string }
   */
  static parsePaymentUrl(url) {
    try {
      const params = URLParser.parseQuery(url);
      return {
        type: params.type || null,
        id: params.id || null,
        success: true,
        originalParams: params
      };
    } catch (error) {
      console.error('解析支付URL失败:', error);
      return {
        type: null,
        id: null,
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 验证支付参数是否有效
   * @param {Object} params - 支付参数 { type, id }
   * @returns {boolean} 是否有效
   */
  static validatePaymentParams(params) {
    return params && 
           typeof params.type === 'string' && 
           params.type.trim() !== '' &&
           typeof params.id === 'string' && 
           params.id.trim() !== '';
  }

  /**
   * 构建支付请求数据
   * @param {string} orderId - 订单ID
   * @param {string} paymentMethodType - 支付方式类型
   * @param {string} resourceType - 资源类型，默认为'android'
   * @returns {Object} 请求数据
   */
  static buildPaymentData(orderId, paymentMethodType, resourceType = PAYMENT_CONFIG.RESOURCE_TYPE) {
    return {
      orderId: orderId,
      paymentMethodType: paymentMethodType,
      resourceType: resourceType
    };
  }

  /**
   * 发送支付请求
   * @param {Object} paymentData - 支付数据
   * @param {Object} options - 请求选项
   * @returns {Promise<Object>} 请求结果
   */
  static async sendPaymentRequest(paymentData, options = {}) {
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: JSON.stringify(paymentData),
      signal: options.signal // 支持取消请求
    };

    try {
      console.log('发送支付请求:', {
        url: PAYMENT_CONFIG.API_URL,
        data: paymentData
      });

      const response = await fetch(PAYMENT_CONFIG.API_URL, requestOptions);
      const result = await response.json();

      const responseData = {
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        data: result,
        requestData: paymentData,
        timestamp: new Date().toISOString()
      };

      console.log('支付请求结果:', responseData);
      return responseData;

    } catch (error) {
      console.error('支付请求失败:', error);
      
      return {
        success: false,
        error: error.message,
        errorType: error.name,
        requestData: paymentData,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 从URL解析参数并发送支付请求（一步完成）
   * @param {string} paymentUrl - 支付URL
   * @param {Object} options - 请求选项
   * @returns {Promise<Object>} 请求结果
   */
  static async processPaymentFromUrl(paymentUrl, options = {}) {
    // 1. 解析URL参数
    const parseResult = this.parsePaymentUrl(paymentUrl);
    
    if (!parseResult.success) {
      return {
        success: false,
        error: 'URL解析失败',
        details: parseResult.error,
        step: 'parse'
      };
    }

    // 2. 验证参数
    if (!this.validatePaymentParams(parseResult)) {
      return {
        success: false,
        error: '支付参数无效',
        details: 'type和id参数都是必需的',
        parsedParams: parseResult,
        step: 'validate'
      };
    }

    // 3. 构建请求数据
    const paymentData = this.buildPaymentData(
      parseResult.id,
      parseResult.type,
      options.resourceType
    );

    // 4. 发送请求
    return await this.sendPaymentRequest(paymentData, options);
  }

  /**
   * 创建带超时的支付请求
   * @param {string} paymentUrl - 支付URL
   * @param {number} timeout - 超时时间（毫秒）
   * @returns {Promise<Object>} 请求结果
   */
  static async processPaymentWithTimeout(paymentUrl, timeout = PAYMENT_CONFIG.TIMEOUT) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const result = await this.processPaymentFromUrl(paymentUrl, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: '请求超时',
          timeout: timeout,
          timestamp: new Date().toISOString()
        };
      }
      throw error;
    }
  }

  /**
   * 获取支持的支付方式列表
   * @returns {Array} 支付方式列表
   */
  static getSupportedPaymentMethods() {
    return [
      { value: 'alipay', label: '支付宝', icon: '💰' },
      { value: 'wechat', label: '微信支付', icon: '💚' },
      { value: 'unionpay', label: '银联支付', icon: '💳' },
      { value: 'credit_card', label: '信用卡', icon: '💳' },
      { value: 'debit_card', label: '借记卡', icon: '💳' }
    ];
  }

  /**
   * 生成测试用的支付URL
   * @param {string} type - 支付类型
   * @param {string} id - 订单ID
   * @returns {string} 测试URL
   */
  static generateTestPaymentUrl(type = 'alipay', id = null) {
    const orderId = id || `ORDER_${Date.now()}`;
    return `https://example.com/payment?type=${type}&id=${orderId}`;
  }
}

export default PaymentService;

// 导出常用方法
export const {
  parsePaymentUrl,
  validatePaymentParams,
  buildPaymentData,
  sendPaymentRequest,
  processPaymentFromUrl,
  processPaymentWithTimeout,
  getSupportedPaymentMethods,
  generateTestPaymentUrl
} = PaymentService;
