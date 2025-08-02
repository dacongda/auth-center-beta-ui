import { baseRequest2Client } from '#/api/request';

/**
 * 获取证书列表
 */
export async function getCertsApi(params: any = {}) {
  return baseRequest2Client.get('/cert/list', { params });
}

/**
 * 根据ID获取证书
 */
export async function getCertApi(params: any) {
  return baseRequest2Client.get(`/cert`, { params });
}

/**
 * 添加证书
 */
export async function addCertApi(data: any) {
  return baseRequest2Client.post('/cert', data);
}

/**
 * 更新证书
 */
export async function updateCertApi(data: any) {
  return baseRequest2Client.put('/cert', data);
}

/**
 * 删除证书
 */
export async function deleteCertApi(params: any) {
  return baseRequest2Client.delete('/cert', { params });
}
