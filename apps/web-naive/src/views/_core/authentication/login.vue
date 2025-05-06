<script lang="ts" setup>
import type { VbenFormSchema } from '@vben/common-ui';
import type { Recordable } from '@vben/types';

import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { AuthenticationLogin, z } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { loginApi } from '#/api/core/auth';
import { useAuthStore } from '#/store';

defineOptions({ name: 'Login' });

const authStore = useAuthStore();
const route = useRoute();

const oAuthParms: any = route.query;
const authFunc: any = ref(authStore.authLogin);

onMounted(() => {
  window.console.log(oAuthParms);
  if (oAuthParms.response_type === 'code') {
    authFunc.value = authCode;
  }
});

const authCode = (params: Recordable<any>) => {
  authStore.loginLoading = true;
  loginApi(params, oAuthParms).then((res: any) => {
    window.console.log(res);
    authStore.loginLoading = false;
    const params = new URLSearchParams();
    params.set('code', res.code);
    if (oAuthParms.nonce) {
      params.set('nonce', oAuthParms.nonce);
    }
    if (oAuthParms.state) {
      params.set('state', oAuthParms.state);
    }
    window.location.href = `${oAuthParms.redirect_uri}?${params.toString()}`;
  });
};

const formSchema = computed((): VbenFormSchema[] => {
  return [
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: $t('authentication.usernameTip'),
      },
      fieldName: 'name',
      label: $t('authentication.username'),
      rules: z.string().min(1, { message: $t('authentication.usernameTip') }),
    },
    {
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: $t('authentication.password'),
      },
      fieldName: 'password',
      label: $t('authentication.password'),
      rules: z.string().min(1, { message: $t('authentication.passwordTip') }),
    },
  ];
});
</script>

<template>
  <AuthenticationLogin
    :form-schema="formSchema"
    :loading="authStore.loginLoading"
    @submit="authFunc"
  />
</template>
