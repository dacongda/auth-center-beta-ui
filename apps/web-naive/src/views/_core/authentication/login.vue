<script lang="tsx" setup>
import type { VbenFormSchema } from '@vben/common-ui';
import type { Recordable } from '@vben/types';

import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { AuthenticationLogin, z } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { preferences } from '@vben/preferences';

import { NButton, NFlex, NTabPane, NTabs } from 'naive-ui';

import { sendVerificationCodeApi } from '#/api';
import { getGroupWithApplicationApi } from '#/api/core/group';
import {
  createAssertionApi,
  getAssertionOptionsApi,
} from '#/api/core/webAuthn';
import { useAuthStore } from '#/store';
import { handleThirdPartRedirect, updateAppTheme } from '#/utils';
import { coerceToArrayBuffer, coerceToBase64Url } from '#/views/utils/webAuthn';

defineOptions({ name: 'Login' });
const { previewApplication, previewGroupName, isPreview } = defineProps([
  'previewApplication',
  'previewGroupName',
  'isPreview',
]);

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

const oAuthParms: any = route.query;
const groupName: any = ref(previewGroupName ?? 'built-in');
const group: any = ref();
const application: any = ref();

const captchaProvider: any = ref();
const authProviers = ref<any[]>();

const captchaRef = ref();
const captchaId = ref();

const loginMethod = ref<string>('Password');
const loginRef = ref();
const verifyId = ref();

const authFunc = async (params: Recordable<any>, jumpCaptcha = false) => {
  captchaRef.value = loginRef.value?.getFormApi()?.getFieldComponentRef('code');
  if (captchaProvider.value && !jumpCaptcha) {
    captchaRef.value.showPopupCaptcha(authFunc, params);
    return;
  }
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

  if (
    oAuthParms?.response_type?.includes('code') ||
    oAuthParms?.response_type?.includes('id_token') ||
    oAuthParms?.response_type?.includes('token')
  ) {
    params.type = 'oauth';
  } else if (route.name === 'SAMLLogin') {
    params.type = 'saml';
    oAuthParms.client_id = route.params.clientId?.toString();
  } else if (route.name === 'CasLogin') {
    params.type = 'cas';
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
    captchaRef.value.refetchCaptcha();
  }
};

onMounted(async () => {
  groupName.value = route.params.groupName ?? 'built-in';
  let clientId: any = route.params?.clientId;
  if (!clientId) {
    clientId = route.query?.client_id;
  }

  const res: any = await getGroupWithApplicationApi({
    groupName: groupName.value,
    clientId,
  });

  if (isPreview) {
    res.defaultApplication = previewApplication;
  }

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

    if (application.value.loginMehods?.length > 0) {
      loginMethod.value = application.value.loginMehods[0];
    }

    captchaRef.value = loginRef.value
      ?.getFormApi()
      ?.getFieldComponentRef('code');

    if (!isPreview) {
      updateAppTheme(application.value);
    }
  }
});

const preProcessLoginParam = (params: Recordable<any>) => {
  params.groupName = groupName.value;
  params.captchaId = captchaId.value;
  params.loginMethod = loginMethod.value;
  params.verifyId = verifyId.value;
  return params;
};

const formSchema = computed((): VbenFormSchema[] => {
  window.console.log(application.value?.loginFormSetting?.input?.style);
  const loginFormSchemas: VbenFormSchema[] = [
    {
      component: 'Input',
      componentProps: {
        placeholder:
          loginMethod.value === 'Code'
            ? '请输入邮箱/手机号'
            : $t('authentication.username'),
        size: 'large',
        style: application.value?.loginFormSetting?.input?.style,
      },
      fieldName: 'name',
      label: $t('authentication.username'),
      rules:
        loginMethod.value === 'Password'
          ? z.string().min(1, { message: $t('authentication.usernameTip') })
          : undefined,
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: $t('authentication.password'),
        showPasswordOn: 'mousedown',
        type: 'password',
        size: 'large',
        style: application.value?.loginFormSetting?.input?.style,
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
      component: 'Sendcode',
      componentProps: {
        placeholder: $t('authentication.code'),
        type: 'Email',
        applicationId: application.value?.id,
        captchaProvider: captchaProvider.value,
        disableDestination: true,
        resend: handleOnResend,
        size: 'large',
        style: application.value?.loginFormSetting?.input?.style,
      },
      dependencies: {
        triggerFields: ['loginMethod'],
        show: loginMethod.value === 'Code',
      },
      modelPropName: 'code',
      fieldName: 'password',
      label: $t('authentication.code'),
      rules: z.string().min(1, { message: $t('authentication.codeTip', [6]) }),
    },
    {
      component: 'Captcha',
      componentProps: {
        applicationId: application.value?.id,
        provider: captchaProvider.value,
        placeholder: $t('authentication.code'),
        'onUpdate:captchaId': (value: any) => {
          captchaId.value = value;
        },
      },
      dependencies: {
        triggerFields: ['name'],
        if: () => {
          return !!captchaProvider.value;
        },
        show: false,
      },
      fieldName: 'code',
      label: $t('authentication.code'),
    },
  ];

  return loginFormSchemas;
});

const getLoginType = () => {
  if (oAuthParms?.response_type?.includes('code')) {
    return 'oauth';
  } else if (route.name === 'SAMLLogin') {
    return 'saml';
  } else if (route.name === 'CasLogin') {
    return 'cas';
  } else {
    return 'login';
  }
};

const handleOnResend = async (captchaId: any, captchaCode: any, type: any) => {
  const vals = await loginRef.value.getFormApi()?.getValues();
  const dest = vals.name as string;
  type = dest.includes('@') ? 'Email' : 'SMS';
  const { mfaEnableId } = await sendVerificationCodeApi({
    authType: type,
    applicationId: application.value.id,
    captchaId,
    captchaCode,
    destination: vals.name,
  });

  verifyId.value = mfaEnableId;
};

const handleLoginToThirdPart = async (item: any) => {
  const searchParams = new URLSearchParams(window.location.search);
  if (route.name === 'SAMLLogin') {
    searchParams.set('client_id', route.params.clientId?.toString() ?? '');
  }

  const type = getLoginType();

  const state = {
    applicationId: application.value.id,
    clientId: oAuthParms?.client_id,
    applicationName: application.value.name,
    groupName: group.value.name,
    providerName: item.name,
    type,
    search: Object.fromEntries(searchParams),
  };

  const providerItem = application.value.providerItems.find(
    (p: any) => p.providerId === item.id,
  );

  handleThirdPartRedirect(item, providerItem, state);
};
</script>

<template>
  <div :style="application?.loginFormSetting?.loginPanel?.style ?? ''">
    <img
      v-if="
        application?.loginFormSetting?.formLogo?.visible &&
        application?.loginFormSetting?.formLogo?.rule !== 'side-only'
      "
      class="mb-2 w-full"
      style="justify-content: center; height: 5rem"
      :src="preferences.logo.source"
    />
    <AuthenticationLogin
      ref="loginRef"
      :register-path="`/auth/register/${groupName}`"
      :form-schema="formSchema"
      :loading="authStore.loginLoading"
      :button-style="application?.loginFormSetting?.loginButton?.style"
      @submit="authFunc"
    >
      <template #title>
        <NTabs
          size="large"
          v-model:value="loginMethod"
          justify-content="space-evenly"
          type="line"
        >
          <NTabPane
            v-if="application?.loginMethods?.some((l: any) => l.name === 'password')"
            name="Password"
            tab="密码"
          />
          <NTabPane
            v-if="application?.loginMethods?.some((l: any) => l.name === 'code')"
            name="Code"
            tab="验证码"
          />
          <NTabPane
            v-if="application?.loginMethods?.some((l: any) => l.name === 'passkey')"
            name="Passkey"
            tab="Passkey"
          />
        </NTabs>
      </template>
    </AuthenticationLogin>

    <NFlex class="m-3" justify="center">
      <NButton
        v-for="(item, idx) in authProviers"
        :key="idx"
        @click="handleLoginToThirdPart(item)"
        size="large"
        :style="application?.loginFormSetting?.thirdPartLogin?.style"
      >
        <img :src="item?.faviconUrl" style="height: 1.5rem" />
        <span class="ml-1">{{ item.displayName }}</span>
      </NButton>
    </NFlex>
  </div>
</template>
