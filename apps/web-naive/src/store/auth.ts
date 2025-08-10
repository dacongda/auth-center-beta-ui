import type { Recordable, UserInfo } from '@vben/types';

import type { AuthApi } from '#/api';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';
import { preferences } from '@vben/preferences';
import { resetAllStores, useAccessStore, useUserStore } from '@vben/stores';
import { createPostFormAndSubmit } from '@vben/utils';

import { defineStore } from 'pinia';

import { notification } from '#/adapter/naive';
import { getAccessCodesApi, getUserInfoApi, loginApi, logoutApi } from '#/api';
import { $t } from '#/locales';

export const useAuthStore = defineStore('auth', () => {
  const accessStore = useAccessStore();
  const userStore = useUserStore();
  const router = useRouter();

  const loginLoading = ref(false);
  const oAuthParmsCache = ref<any>();
  const paramsCache = ref<any>();
  const loginApplication = ref<any>();
  const mfaVerifyRequest = ref<AuthApi.LoginResult>();

  async function handleOAuthLogin(res: any, oAuthParms: any) {
    const params = new URLSearchParams();
    params.set('code', res.code);
    if (oAuthParms.nonce) {
      params.set('nonce', oAuthParms.nonce);
    }
    if (oAuthParms.state) {
      params.set('state', oAuthParms.state);
    }
    if (oAuthParms.response_mode === 'form_post') {
      createPostFormAndSubmit(params, oAuthParms.redirect_uri);
    } else if (oAuthParms.response_mode === 'fragment') {
      window.location.href = `${oAuthParms.redirect_uri}#${params.toString()}`;
    } else {
      window.location.href = `${oAuthParms.redirect_uri}?${params.toString()}`;
    }
  }

  async function handleSamlLogin(res: any, oAuthParms: any) {
    const params = new URLSearchParams();
    params.set('SAMLResponse', res.samlResponse);
    if (oAuthParms.RelayState) {
      params.set('RelayState', oAuthParms.RelayState);
    }

    if (
      res.samlBindingType === 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST'
    ) {
      createPostFormAndSubmit(params, res.redirectUrl);
    } else {
      window.location.href = `${oAuthParms.redirectUrl}?${params.toString()}`;
    }
  }

  /**
   * 异步处理登录操作
   * Asynchronously handle the login process
   * @param params 登录表单数据
   */
  async function authLogin(
    params: Recordable<any>,
    oAuthParms: any,
    onSuccess?: () => Promise<void> | void,
  ): Promise<any> {
    // 异步处理用户登录操作并获取 accessToken
    let userInfo: null | UserInfo = null;
    try {
      loginLoading.value = true;

      const res = await loginApi(params, oAuthParms);
      if (params.type === 'bind') {
        router.push('/account/EditAccount/ThirdPartInfo');
        return;
      }

      const { accessToken, requireMfa } = res;

      if (requireMfa) {
        oAuthParmsCache.value = oAuthParms;
        params.isMfaVerify = true;
        params.captchaId = res.mfaVerifyId;
        paramsCache.value = params;
        mfaVerifyRequest.value = res;
        return res;
      }

      if (params.type === 'oauth') {
        handleOAuthLogin(res, oAuthParms);
        return null;
      } else if (params.type === 'saml') {
        handleSamlLogin(res, oAuthParms);
        return null;
      }

      // 如果成功获取到 accessToken
      if (accessToken) {
        // 将 accessToken 存储到 accessStore 中
        accessStore.setAccessToken(accessToken);

        // 获取用户信息并存储到 accessStore 中
        const [fetchUserInfoResult, accessCodes] = await Promise.all([
          fetchUserInfo(),
          getAccessCodesApi(),
        ]);

        userInfo = fetchUserInfoResult;

        userStore.setUserInfo(userInfo);
        accessStore.setAccessCodes(accessCodes);

        if (accessStore.loginExpired) {
          accessStore.setLoginExpired(false);
        } else {
          onSuccess
            ? await onSuccess?.()
            : await router.push(
                userInfo.homePath || preferences.app.defaultHomePath,
              );
        }

        if (userInfo?.realName) {
          notification.success({
            content: $t('authentication.loginSuccess'),
            description: `${$t('authentication.loginSuccessDesc')}:${userInfo?.realName}`,
            duration: 3000,
          });
        }
      }
    } finally {
      loginLoading.value = false;
    }

    return {
      userInfo,
    };
  }

  async function logout(redirect: boolean = true) {
    try {
      await logoutApi();
    } catch {
      // 不做任何处理
    }
    resetAllStores();
    accessStore.setLoginExpired(false);

    // 回登录页带上当前路由地址
    await router.replace({
      path: LOGIN_PATH,
      query: redirect
        ? {
            redirect: encodeURIComponent(router.currentRoute.value.fullPath),
          }
        : {},
    });
  }

  async function fetchUserInfo() {
    let userInfo: null | UserInfo = null;
    userInfo = await getUserInfoApi();
    userStore.setUserInfo(userInfo);
    return userInfo;
  }

  function $reset() {
    loginLoading.value = false;
    mfaVerifyRequest.value = {};
    loginApplication.value = {};
  }

  return {
    $reset,
    authLogin,
    fetchUserInfo,
    loginLoading,
    mfaVerifyRequest,
    paramsCache,
    oAuthParmsCache,
    loginApplication,
    logout,
  };
});
