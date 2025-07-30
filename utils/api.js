/**
 * API工具函数
 */

/**
 * 检查API响应是否成功
 * @param {Object} response - API响应对象
 * @returns {boolean} - 是否成功
 */
export function isSuccessResponse(response) {
  if (!response || !response.data) {
    return false;
  }
  
  const code = response.data.code;
  // 支持数字和字符串类型的成功码
  return code === 200 || code === "200";
}

/**
 * 获取API响应中的错误信息
 * @param {Object} response - API响应对象
 * @param {string} defaultMsg - 默认错误信息
 * @returns {string} - 错误信息
 */
export function getErrorMessage(response, defaultMsg = '请求失败') {
  if (!response || !response.data) {
    return defaultMsg;
  }
  
  return response.data.msg || defaultMsg;
}

/**
 * 处理API响应
 * @param {Object} response - API响应对象
 * @param {Function} onSuccess - 成功回调
 * @param {Function} onError - 错误回调
 * @param {string} defaultErrorMsg - 默认错误信息
 */
export function handleApiResponse(response, onSuccess, onError, defaultErrorMsg = '请求失败') {
  if (isSuccessResponse(response)) {
    if (onSuccess) {
      onSuccess(response.data);
    }
  } else {
    const errorMsg = getErrorMessage(response, defaultErrorMsg);
    if (onError) {
      onError(errorMsg);
    }
  }
}

/**
 * 统一的API请求函数
 * @param {Object} options - 请求选项
 * @returns {Promise} - 请求Promise
 */
export function apiRequest(options) {
  return new Promise((resolve, reject) => {
    uni.request({
      ...options,
      success: (res) => {
        if (isSuccessResponse(res)) {
          resolve(res.data);
        } else {
          const errorMsg = getErrorMessage(res, options.defaultErrorMsg || '请求失败');
          reject(new Error(errorMsg));
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
} 