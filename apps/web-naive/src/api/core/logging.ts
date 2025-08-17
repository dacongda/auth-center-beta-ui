import { baseRequest2Client } from '#/api/request';

/**
 * 获取Session列表
 */
export async function getUserSessionApi(data: any) {
  return baseRequest2Client.get('/auditLogging/getUserSessionList', {
    params: data,
  });
}

/**
 * 获取用户Session列表
 */
export async function getUserSessionListApi() {
  return baseRequest2Client.get('/auditLogging/getMySessionList');
}
