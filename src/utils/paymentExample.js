/**
 * 支付服务使用示例
 */

import PaymentService from './paymentService.js';

// ============= 基本使用示例 =============

/**
 * 示例1: 解析支付URL
 */
export function example1_parseUrl() {
  const paymentUrl = 'https://example.com/payment?type=alipay&id=ORDER_20231201_001';
  
  const result = PaymentService.parsePaymentUrl(paymentUrl);
  console.log('解析结果:', result);
  
  /*
  输出:
  {
    type: 'alipay',
    id: 'ORDER_20231201_001',
    success: true,
    originalParams: { type: 'alipay', id: 'ORDER_20231201_001' }
  }
  */
}

/**
 * 示例2: 验证支付参数
 */
export function example2_validateParams() {
  const validParams = { type: 'wechat', id: 'ORDER_123' };
  const invalidParams = { type: '', id: 'ORDER_123' };
  
  console.log('有效参数:', PaymentService.validatePaymentParams(validParams)); // true
  console.log('无效参数:', PaymentService.validatePaymentParams(invalidParams)); // false
}

/**
 * 示例3: 构建支付数据
 */
export function example3_buildPaymentData() {
  const paymentData = PaymentService.buildPaymentData('ORDER_123', 'alipay', 'android');
  console.log('支付数据:', paymentData);
  
  /*
  输出:
  {
    orderId: 'ORDER_123',
    paymentMethodType: 'alipay',
    resourceType: 'android'
  }
  */
}

/**
 * 示例4: 发送支付请求
 */
export async function example4_sendPaymentRequest() {
  const paymentData = {
    orderId: 'ORDER_20231201_001',
    paymentMethodType: 'alipay',
    resourceType: 'android'
  };
  
  try {
    const result = await PaymentService.sendPaymentRequest(paymentData);
    console.log('支付请求结果:', result);
    
    if (result.success) {
      console.log('✅ 支付请求成功');
      console.log('响应数据:', result.data);
    } else {
      console.log('❌ 支付请求失败');
      console.log('错误信息:', result.error);
    }
  } catch (error) {
    console.error('请求异常:', error);
  }
}

/**
 * 示例5: 从URL一步完成支付流程
 */
export async function example5_processFromUrl() {
  const paymentUrl = 'https://example.com/payment?type=wechat&id=ORDER_20231201_002';
  
  try {
    const result = await PaymentService.processPaymentFromUrl(paymentUrl);
    console.log('完整流程结果:', result);
    
    if (result.success) {
      console.log('✅ 支付流程完成');
    } else {
      console.log('❌ 支付流程失败:', result.error);
      console.log('失败步骤:', result.step);
    }
  } catch (error) {
    console.error('流程异常:', error);
  }
}

/**
 * 示例6: 带超时的支付请求
 */
export async function example6_withTimeout() {
  const paymentUrl = 'https://example.com/payment?type=unionpay&id=ORDER_20231201_003';
  const timeout = 10000; // 10秒超时
  
  try {
    const result = await PaymentService.processPaymentWithTimeout(paymentUrl, timeout);
    console.log('带超时的支付结果:', result);
    
    if (result.success) {
      console.log('✅ 支付成功');
    } else if (result.error === '请求超时') {
      console.log('⏰ 请求超时');
    } else {
      console.log('❌ 支付失败:', result.error);
    }
  } catch (error) {
    console.error('超时请求异常:', error);
  }
}

/**
 * 示例7: 获取支持的支付方式
 */
export function example7_getSupportedMethods() {
  const methods = PaymentService.getSupportedPaymentMethods();
  console.log('支持的支付方式:');
  
  methods.forEach(method => {
    console.log(`${method.icon} ${method.label} (${method.value})`);
  });
  
  /*
  输出:
  💰 支付宝 (alipay)
  💚 微信支付 (wechat)
  💳 银联支付 (unionpay)
  💳 信用卡 (credit_card)
  💳 借记卡 (debit_card)
  */
}

/**
 * 示例8: 生成测试URL
 */
export function example8_generateTestUrl() {
  // 生成默认测试URL
  const defaultUrl = PaymentService.generateTestPaymentUrl();
  console.log('默认测试URL:', defaultUrl);
  
  // 生成指定类型的测试URL
  const wechatUrl = PaymentService.generateTestPaymentUrl('wechat', 'TEST_ORDER_001');
  console.log('微信支付测试URL:', wechatUrl);
  
  /*
  输出类似:
  默认测试URL: https://example.com/payment?type=alipay&id=ORDER_1701234567890
  微信支付测试URL: https://example.com/payment?type=wechat&id=TEST_ORDER_001
  */
}

// ============= Vue组件中的使用示例 =============

/**
 * 在Vue组件中使用支付服务的示例
 */
export const vueComponentExample = {
  data() {
    return {
      paymentUrl: '',
      paymentResult: null,
      loading: false
    };
  },
  
  methods: {
    // 处理支付
    async handlePayment() {
      if (!this.paymentUrl) {
        alert('请输入支付URL');
        return;
      }
      
      this.loading = true;
      this.paymentResult = null;
      
      try {
        const result = await PaymentService.processPaymentFromUrl(this.paymentUrl);
        this.paymentResult = result;
        
        if (result.success) {
          this.$message.success('支付请求成功');
        } else {
          this.$message.error(`支付失败: ${result.error}`);
        }
      } catch (error) {
        console.error('支付异常:', error);
        this.$message.error('支付请求异常');
      } finally {
        this.loading = false;
      }
    },
    
    // 生成测试URL
    generateTestUrl(type = 'alipay') {
      this.paymentUrl = PaymentService.generateTestPaymentUrl(type);
    }
  }
};

// ============= 错误处理示例 =============

/**
 * 示例9: 错误处理
 */
export async function example9_errorHandling() {
  const invalidUrl = 'invalid-url';
  
  try {
    const result = await PaymentService.processPaymentFromUrl(invalidUrl);
    
    if (!result.success) {
      switch (result.step) {
        case 'parse':
          console.log('URL解析失败:', result.details);
          break;
        case 'validate':
          console.log('参数验证失败:', result.details);
          break;
        default:
          console.log('请求失败:', result.error);
      }
    }
  } catch (error) {
    console.error('异常处理:', error);
  }
}

// ============= 批量处理示例 =============

/**
 * 示例10: 批量处理多个支付URL
 */
export async function example10_batchProcess() {
  const paymentUrls = [
    'https://example.com/payment?type=alipay&id=ORDER_001',
    'https://example.com/payment?type=wechat&id=ORDER_002',
    'https://example.com/payment?type=unionpay&id=ORDER_003'
  ];
  
  console.log('开始批量处理支付请求...');
  
  const results = await Promise.allSettled(
    paymentUrls.map(url => PaymentService.processPaymentFromUrl(url))
  );
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      const paymentResult = result.value;
      console.log(`订单 ${index + 1}:`, paymentResult.success ? '✅ 成功' : '❌ 失败');
    } else {
      console.log(`订单 ${index + 1}: ❌ 异常`, result.reason);
    }
  });
}

// 运行所有示例的函数
export async function runAllExamples() {
  console.log('🚀 开始运行支付服务示例...\n');
  
  console.log('1. 解析支付URL');
  example1_parseUrl();
  
  console.log('\n2. 验证支付参数');
  example2_validateParams();
  
  console.log('\n3. 构建支付数据');
  example3_buildPaymentData();
  
  console.log('\n7. 获取支持的支付方式');
  example7_getSupportedMethods();
  
  console.log('\n8. 生成测试URL');
  example8_generateTestUrl();
  
  // 注意: 以下示例会发送真实的网络请求，请谨慎运行
  // console.log('\n4. 发送支付请求');
  // await example4_sendPaymentRequest();
  
  // console.log('\n5. 从URL完成支付流程');
  // await example5_processFromUrl();
  
  console.log('\n✅ 示例运行完成');
}
