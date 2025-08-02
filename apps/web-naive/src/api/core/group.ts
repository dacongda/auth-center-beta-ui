import { baseRequest2Client } from '#/api/request';

/**
 * 根据Id获取群组
 */
export async function getGroupApi(params: any) {
  return baseRequest2Client.get('/group', { params });
}

/**
 * 获取群组树
 */
export async function getGroupTreeApi() {
  return baseRequest2Client.get('/group/getGroupTree');
}

/**
 * 获取扁平化群组树
 */
export async function getGroupsApi(params: any) {
  return baseRequest2Client.get('/group/getGroups', { params });
}

/**
 * 添加群组
 */
export async function addGroupApi(data: any) {
  return baseRequest2Client.post('/group', data);
}

/**
 * 更新群组
 */
export async function updateGroupApi(data: any) {
  return baseRequest2Client.put('/group', data);
}

/**
 * 删除群组
 */
export async function deleteGroupApi(params: any) {
  return baseRequest2Client.delete('/group', { params });
}

/**
 * 刷新群组链
 */
export async function refreshGroupChainApi() {
  return baseRequest2Client.get('/group/refreshGroupChain');
}

/**
 * 获取群组与应用
 */
export async function getGroupWithApplicationApi(params: any) {
  return baseRequest2Client.get('/group/getGroupWithApplication', {
    params,
  });
}
