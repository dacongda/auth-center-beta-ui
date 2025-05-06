import { baseRequest2Client } from '#/api/request';

/**
 * 获取群组树
 */
export async function getGroupTreeApi() {
  return baseRequest2Client.get('/group/getGroupTree');
}
