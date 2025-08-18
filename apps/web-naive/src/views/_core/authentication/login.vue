<script lang="tsx" setup>
import type { VbenFormSchema } from '@vben/common-ui';
import type { Recordable } from '@vben/types';

import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { AuthenticationLogin, z } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { NButton, NFlex, NTabPane, NTabs } from 'naive-ui';

import { message } from '#/adapter/naive';
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
const router = useRouter();

const oAuthParms: any = route.query;
const groupName: any = ref('built-in');
const group: any = ref();
const application: any = ref();

const captchaProvider: any = ref();
const authProviers = ref<any[]>();

const captchaInfo: any = ref();

const loginMethod = ref<string>('Password');

const authFunc = async (params: Recordable<any>) => {
  params = preProcessLoginParam(params);

  authStore.loginLoading = true;
  if (loginMethod.value === 'Passkey') {
    const { options, optionId } = await getAssertionOptionsApi({
      id: params.username,
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

  if (oAuthParms?.response_type?.includes('code')) {
    params.type = 'oauth';
  } else if (route.name === 'SAMLLogin') {
    params.type = 'saml';
    oAuthParms.client_id = route.params.clientId?.toString();
  } else {
    params.type = 'login';
  }

  try {
    const res = await authStore.authLogin(params, oAuthParms);
    if (res.requireMfa) {
      router.push({ name: 'MfaVerify' });
    }
  } catch {
    renewCaptcha();
  }
};

onMounted(() => {
  window.console.log(route.params);
  groupName.value = route.params.groupName ?? 'built-in';

  getGroupWithApplicationApi({
    groupName: groupName.value,
    clientId: route.params?.clientId,
  })
    .then(async (res: any) => {
      if (res?.defaultApplication) {
        group.value = res;
        groupName.value = group.value.name;
        application.value = res.defaultApplication;
        authStore.loginApplication = res.defaultApplication;

        captchaProvider.value = application.value?.providers.find(
          (p: any) => p.type === 'Captcha',
        );

        authProviers.value = application.value?.providers.filter(
          (p: any) => p.type === 'Auth',
        );

        renewCaptcha();
      }
    })
    .catch(() => {
      message.error('获取失败');
    });
});

const renewCaptcha = async () => {
  if (!captchaProvider.value) {
    return;
  }
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
    {
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: $t('authentication.password'),
      },
      dependencies: {
        triggerFields: ['loginMethod'],
        show: loginMethod.value === 'Password',
      },
      fieldName: 'password',
      label: $t('authentication.password'),
      rules: z.string().min(1, { message: $t('authentication.passwordTip') }),
    },
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: $t('authentication.code'),
      },
      dependencies: {
        triggerFields: ['name'],
        if: () => {
          return !!captchaProvider.value;
        },
      },
      fieldName: 'code',
      label: $t('authentication.code'),
      rules: z.string().min(1, { message: '请输入验证码' }),
      suffix: () => {
        return (
          <img
            onClick={renewCaptcha}
            src={`data:image/bmp;base64,${captchaInfo.value?.captchaImg}`}
            style="height: 2.5rem"
          />
        );
      },
    },
  ];

  return loginFormSchemas;
});

const getLoginType = () => {
  if (oAuthParms?.response_type?.includes('code')) {
    return 'oauth';
  } else if (route.name === 'SAMLLogin') {
    return 'saml';
  } else {
    return 'login';
  }
};

const handleLoginToThirdPart = (item: any) => {
  if (item.subType === 'OAuth2') {
    const searchParams = new URLSearchParams(window.location.search);
    if (route.name === 'SAMLLogin') {
      searchParams.set('client_id', route.params.clientId?.toString() ?? '');
    }
    const state = {
      applicationId: application.value.id,
      applicationName: application.value.name,
      groupName: group.value.name,
      providerName: item.name,
      type: getLoginType(),
      search: Object.fromEntries(searchParams),
    };

    const stateJson = JSON.stringify(state);
    const encodedState = btoa(stateJson)
      .replaceAll('+', '-')
      .replaceAll('/', '_')
      .replaceAll(/=*$/g, '');

    const params = new URLSearchParams();
    params.set('client_id', item.clientId);
    params.set('redirect_uri', `${window.location.origin}/auth/callback`);
    if (item.scopes) {
      params.set('scope', item.scopes);
    }
    params.set('state', encodedState);

    window.location.href = `${item.authEndpoint}?${params.toString()}`;
  }

  window.console.log('未实现');
};
</script>

<template>
  <div>
    <AuthenticationLogin
      :register-path="`/auth/register/${groupName}`"
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

    <NFlex class="m-3" justify="center">
      <NButton
        v-for="(item, idx) in authProviers"
        :key="idx"
        @click="handleLoginToThirdPart(item)"
        size="large"
      >
        <img :src="item?.faviconUrl" style="height: 1.5rem" />
        <span class="ml-1">{{ item.displayName }}</span>
      </NButton>
    </NFlex>
  </div>
</template>
