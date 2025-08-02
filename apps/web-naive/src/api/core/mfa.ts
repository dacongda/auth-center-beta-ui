import { baseRequest2Client } from '#/api/request';

/**
 * 初始化启用MFA
 */
export async function enableMfaSetupApi(data: any) {
  return baseRequest2Client.post('/mfa/enableMfaSetup', data);
}

/**
 * 启用MFA
 */
export async function enableMfaApi(data: any) {
  return baseRequest2Client.post('/mfa/enableMfaVerify', data);
}
