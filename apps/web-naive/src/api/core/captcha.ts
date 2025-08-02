import { baseRequest2Client } from '#/api/request';

/**
 * 获取默认验证码图片
 */
export async function getCaptcha(params: any) {
  return baseRequest2Client.get('/captcha/getCaptcha', { params });
}
