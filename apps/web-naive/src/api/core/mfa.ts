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

/**
 * 关闭mfa
 */
export async function disableMfaApi(data: any) {
  return baseRequest2Client.post('/mfa/disableMfaVerify', data);
}

/**
 * 设置MFA首选项
 */
export async function SetPreferredMfaApi(data: any) {
  return baseRequest2Client.post('/mfa/SetPreferredMfa', data);
}
