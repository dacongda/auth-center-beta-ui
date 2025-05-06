import type { UserInfo } from '@vben/types';

import { baseRequest2Client } from '#/api/request';

/**
 * 获取用户信息
 */
export async function getUserInfoApi() {
  return baseRequest2Client.get<UserInfo>('/user/info');
}

/**
 * 获取用户列表
 */
export async function getUserListApi(params: any) {
  return baseRequest2Client.get('/user/list', { params });
}
