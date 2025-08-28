import { baseRequest2Client } from '#/api/request';

/**
 * 获取服务提供商列表
 */
export async function getProvidersApi(params: any) {
  return baseRequest2Client.get('/provider/list', { params });
}

/**
 * 获取服务提供商
 */
export async function getProviderApi(params: any) {
  return baseRequest2Client.get('/provider', { params });
}

/**
 * 添加服务提供商
 */
export async function addProviderApi(data: any) {
  return baseRequest2Client.post('/provider', data);
}

/**
 * 更新服务提供商
 */
export async function updateProviderApi(data: any) {
  return baseRequest2Client.put('/provider', data);
}

/**
 * 删除服务提供商
 */
export async function removeProviderApi(params: any) {
  return baseRequest2Client.delete('/provider', { params });
}

/**
 * 测试电邮提供商
 */
export async function testSendEmailApi(data: any) {
  return baseRequest2Client.post('/provider/testSendEmail', data);
}

/**
 * 测试短信提供商
 */
export async function testSendSMSApi(data: any) {
  return baseRequest2Client.post('/provider/testSendSMS', data);
}
