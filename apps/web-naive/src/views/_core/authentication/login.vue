<script lang="tsx" setup>
import type { VbenFormSchema } from '@vben/common-ui';
import type { Recordable } from '@vben/types';

import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { AuthenticationLogin, z } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { createPostFormAndSubmit } from '@vben/utils';

import { NTabPane, NTabs } from 'naive-ui';

import { message } from '#/adapter/naive';
import { loginApi } from '#/api/core/auth';
import { getCaptcha } from '#/api/core/captcha';
import { getGroupWithApplicationApi } from '#/api/core/group';
import {
  createAssertionApi,
  getAssertionOptionsApi,
} from '#/api/core/webAuthn';
import { useAuthStore } from '#/store';
import { coerceToArrayBuffer, coerceToBase64Url } from '#/views/utils/webAuthn';

defineOptions({ name: 'Login' });

const authStore = useAuthStore();
const route = useRoute();

const oAuthParms: any = route.query;
const groupName: any = ref('built-in');
const group: any = ref();
const application: any = ref();

const captchaProvider: any = ref();
const captchaInfo: any = ref();

const loginMethod = ref<string>('Password');

const authFunc = async (params: Recordable<any>) => {
  params = preProcessLoginParam(params);

  authStore.loginLoading = true;
  if (loginMethod.value === 'Passkey') {
    const { options, optionId } = await getAssertionOptionsApi({
      number: params.username,
    });

    options.challenge = coerceToArrayBuffer(options.challenge, 'challenge');
    options.allowCredentials.forEach((listItem: any) => {
      listItem.id = coerceToArrayBuffer(listItem.id, 'listItemId');
    });

    const credential: any = await navigator.credentials
      .get({
        publicKey: options,
      })
      .catch(() => {
        authStore.loginLoading = false;
      });

    const authData = new Uint8Array(credential.response.authenticatorData);
    const clientDataJSON = new Uint8Array(credential.response.clientDataJSON);
    const rawId = new Uint8Array(credential.rawId);
    const sig = new Uint8Array(credential.response.signature);
    const userHandle = new Uint8Array(credential.response.userHandle);
    const data = {
      id: credential.id,
      rawId: coerceToBase64Url(rawId),
      type: credential.type,
      extensions: credential.getClientExtensionResults(),
      response: {
        authenticatorData: coerceToBase64Url(authData),
        clientDataJSON: coerceToBase64Url(clientDataJSON),
        userHandle: userHandle === null ? null : coerceToBase64Url(userHandle),
        signature: coerceToBase64Url(sig),
      },
    };

    try {
      const { webAuthLoginId } = await createAssertionApi({
        requestValue: data,
        cacheOptionId: optionId,
      });
      params.password = webAuthLoginId;
    } catch {
      authStore.loginLoading = false;
      return;
    }
  }

  if (oAuthParms?.response_type === 'code') {
    await authCode(params);
  } else if (route.name === 'SAMLLogin') {
    await authSaml(params);
  } else {
    await authLogin(params);
  }

  authStore.loginLoading = false;
};

onMounted(() => {
  groupName.value = route.query.groupName ?? 'built-in';

  getGroupWithApplicationApi({
    groupName: groupName.value,
    clientId: route.params?.clientId,
  })
    .then(async (res: any) => {
      if (res?.defaultApplication) {
        group.value = res.group;
        application.value = res.defaultApplication;

        captchaProvider.value = application.value?.providers.find(
          (p: any) => p.type === 'Captcha',
        );

        renewCaptcha();
      }
    })
    .catch(() => {
      message.error('获取失败');
    });
});

const renewCaptcha = async () => {
  captchaInfo.value = await getCaptcha({
    applicationId: application.value.id,
  });
};

const preProcessLoginParam = (params: Recordable<any>) => {
  params.groupName = groupName.value;
  if (captchaInfo.value) {
    params.captchaId = captchaInfo.value.captchaId;
  }
  params.loginMethod = loginMethod.value;
  return params;
};

const authLogin = (params: Recordable<any>) => {
  authStore.authLogin(params).catch(() => {
    renewCaptcha();
  });
};

const authCode = (params: Recordable<any>) => {
  params.type = 'oauth';
  loginApi(params, oAuthParms)
    .then((res: any) => {
      authStore.loginLoading = false;
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
    })
    .catch(() => {
      renewCaptcha();
    });
};

const authSaml = (params: Recordable<any>) => {
  oAuthParms.client_id = route.params?.clientId;
  oAuthParms.type = 'saml';
  loginApi(params, oAuthParms)
    .then((res: any) => {
      authStore.loginLoading = false;
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
    })
    .catch(() => {
      renewCaptcha();
    });
};

const formSchema = computed((): VbenFormSchema[] => {
  const loginFormSchemas: VbenFormSchema[] = [
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: $t('authentication.usernameTip'),
      },
      fieldName: 'name',
      label: $t('authentication.username'),
      rules:
        loginMethod.value === 'Password'
          ? z.string().min(1, { message: $t('authentication.usernameTip') })
          : undefined,
    },
  ];

  if (loginMethod.value === 'Password') {
    loginFormSchemas.push({
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: $t('authentication.password'),
      },
      fieldName: 'password',
      label: $t('authentication.password'),
      rules: z.string().min(1, { message: $t('authentication.passwordTip') }),
    });
  }

  if (captchaProvider.value) {
    const captchaSchema: VbenFormSchema = {
      component: 'VbenInput',
      componentProps: {
        placeholder: $t('authentication.code'),
      },
      fieldName: 'code',
      label: $t('authentication.code'),
      rules: z.string().min(1, { message: $t('authentication.code') }),
      suffix: () => {
        return (
          <img
            onClick={renewCaptcha}
            src={`data:image/bmp;base64,${captchaInfo.value?.captchaImg}`}
            style="height: 2.5rem"
          />
        );
      },
    };
    loginFormSchemas.push(captchaSchema);
  }

  return loginFormSchemas;
});
</script>

<template>
  <AuthenticationLogin
    :form-schema="formSchema"
    :loading="authStore.loginLoading"
    @submit="authFunc"
  >
    <template #title>
      <NTabs
        size="large"
        v-model:value="loginMethod"
        justify-content="space-evenly"
        type="line"
      >
        <NTabPane name="Password" tab="密码登陆" />
        <NTabPane name="Passkey" tab="Passkey" />
      </NTabs>
    </template>
  </AuthenticationLogin>
</template>
