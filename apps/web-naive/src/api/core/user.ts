import type { UserInfo } from '@vben/types';

import { baseRequest2Client } from '#/api/request';

/**
 * 获取用户信息
 */
export async function getUserInfoApi() {
  return baseRequest2Client.get<UserInfo>('/user/info');
}

/**
 * 获取登陆用户信息
 */
export async function getMyInfoApi() {
  return baseRequest2Client.get('/user/myInfo');
}

/**
 * 根据ID获取用户信息
 */
export async function getUserApi(params: any) {
  return baseRequest2Client.get<UserInfo>('/user', { params });
}

/**
 * 获取用户列表
 */
export async function getUserListApi(params: any) {
  return baseRequest2Client.get('/user/list', { params });
}

/**
 * 增加用户
 */
export async function addUserApi(data: any) {
  return baseRequest2Client.post('/user', data);
}

/**
 * 更新用户
 */
export async function updateUserApi(data: any) {
  return baseRequest2Client.put('/user', data);
}

/**
 * 删除用户
 */
export async function removeUserApi(params: any) {
  return baseRequest2Client.delete('/user', { params });
}
