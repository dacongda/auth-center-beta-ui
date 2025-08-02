import { baseRequest2Client } from '#/api/request';

/**
 * 获取用户证书列表
 */
export async function getUserCredentialsApi() {
  return baseRequest2Client.get('/fido2/getUserCredentials');
}

/**
 * 获取webAuthn证书创建选项
 */
export async function createOptionsApi() {
  return baseRequest2Client.get('/fido2/createOptions');
}

/**
 * 创建webAuthn证书
 */
export async function createCredentialApi(data: any) {
  return baseRequest2Client.post('/fido2/createCredential', data);
}

/**
 * 获取webAuthn断言
 */
export async function getAssertionOptionsApi(params: any) {
  return baseRequest2Client.get('/fido2/getAssertionOptions', { params });
}

/**
 * 获取webAuthn检查结果
 */
export async function createAssertionApi(data: any) {
  return baseRequest2Client.post('/fido2/createAssertion', data);
}

/**
 * 修改webAuthn证书名字
 */
export async function updateCredNameApi(data: any) {
  return baseRequest2Client.put('/fido2/updateCredName', data);
}

/**
 * 删除webAuthn证书
 */
export async function removeCredApi(params: any) {
  return baseRequest2Client.delete('/fido2/deleteCred', { params });
}
