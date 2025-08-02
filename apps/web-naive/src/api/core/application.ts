import { baseRequest2Client } from '#/api/request';

/**
 * 获取应用列表
 */
export async function getApplicationsApi(params: any) {
  return baseRequest2Client.get('/application/list', { params });
}

/**
 * 获取应用
 */
export async function getApplicationApi(params: any) {
  return baseRequest2Client.get('/application', { params });
}
/**
 * 添加应用
 */
export async function addApplicationApi(data: any) {
  return baseRequest2Client.post('/application', data);
}

/**
 * 更新应用
 */
export async function updateApplicationApi(data: any) {
  return baseRequest2Client.put('/application', data);
}

/**
 * 删除应用
 */
export async function removeApplicationApi(params: any) {
  return baseRequest2Client.delete(`/application`, { params });
}
