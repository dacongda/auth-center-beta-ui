import { baseRequest2Client, baseRequestClient } from '#/api/request';

export namespace AuthApi {
  /** 登录接口参数 */
  export interface LoginParams {
    password?: string;
    username?: string;
    name?: string;
    loginMethod?: string;
    groupName?: string;
    type?: string;
  }

  /** 登录接口返回值 */
  export interface LoginResult {
    accessToken?: string;
    code?: string;
    requireMfa?: boolean;
    preferredMfa?: string;
    avaliableMfa?: string[];
    mfaVerifyId?: string;
  }

  export interface RefreshTokenResult {
    data: string;
    status: number;
  }
}

/**
 * 登录
 */
export async function loginApi(data: AuthApi.LoginParams, query = {}) {
  return baseRequest2Client.post<AuthApi.LoginResult>('/auth/login', data, {
    params: query,
  });
}

/**
 * 注册
 */
export async function registerApi(data: AuthApi.LoginParams, query = {}) {
  return baseRequest2Client.post<AuthApi.LoginResult>('/auth/register', data, {
    params: query,
  });
}

/**
 * 刷新accessToken
 */
export async function refreshTokenApi() {
  return baseRequestClient.post<AuthApi.RefreshTokenResult>('/auth/refresh', {
    withCredentials: true,
  });
}

/**
 * 退出登录
 */
export async function logoutApi() {
  return baseRequest2Client.post('/auth/logout', {
    withCredentials: true,
  });
}

/**
 * 获取用户权限码
 */
export async function getAccessCodesApi() {
  return [];
}

/**
 * 验证用户
 */
export async function verifyUser(data: AuthApi.LoginParams) {
  return baseRequest2Client.post('/auth/verifyUser', data);
}

/**
 * 获取验证码
 */
export async function sendVerificationCodeApi(data: any) {
  return baseRequest2Client.post('/auth/sendVerificationCode', data);
}

/**
 * 撤销令牌
 */
export async function revokeTokenApi(data: any) {
  return baseRequest2Client.post('/auth/revokeToken', data);
}

/**
 * 发送重置邮件
 */
export async function sendForgetPasswordLink(data: any) {
  return baseRequest2Client.post('/auth/sendForgetPasswordLink', data);
}

/**
 * 重置密码
 */
export async function resetPasswordApi(data: any) {
  return baseRequest2Client.post('/auth/resetPassword', data);
}

/**
 * 获取OAuth Request
 */
export async function getOAuthReqestApi(query: any) {
  return baseRequest2Client.get('/oauth/getOAuthRequest', { params: query });
}

/**
 * 获取SAML Request
 */
export async function getSamlRequestApi(query: any) {
  return baseRequest2Client.get('/saml/getSamlRequest', { params: query });
}
