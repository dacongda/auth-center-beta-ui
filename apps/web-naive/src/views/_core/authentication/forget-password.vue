<script lang="tsx" setup>
import type { VbenFormSchema } from '@vben/common-ui';
import type { Recordable } from '@vben/types';

import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { AuthenticationForgetPassword, z } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { message } from '#/adapter/naive';
import { sendForgetPasswordLink } from '#/api';
import { getGroupWithApplicationApi } from '#/api/core/group';
import { useAuthStore } from '#/store';

defineOptions({ name: 'ForgetPassword' });

const loading = ref(false);

const authStore = useAuthStore();
const route = useRoute();

const groupName: any = ref('built-in');
const group: any = ref();
const application: any = ref();

const captchaProvider: any = ref();
const authProviers = ref<any[]>();
const emailProvider = ref<any>();

const resetRef = ref();
const captchaId = ref();

onMounted(() => {
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

        captchaProvider.value = res.defaultApplication?.providers.find(
          (p: any) => p.type === 'Captcha',
        );

        emailProvider.value = res.defaultApplication?.providerItems.find(
          (p: any) => p.type === 'Email' && p.rule.includes('ForgetPassword'),
        );

        authProviers.value = res.defaultApplication?.providers.filter(
          (p: any) => p.type === 'Auth',
        );
      }
    })
    .catch(() => {
      message.error('获取失败');
    });
});

const formSchema = computed((): VbenFormSchema[] => {
  return [
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: 'example@example.com',
      },
      fieldName: 'destination',
      label: $t('authentication.email'),
      rules: z
        .string()
        .min(1, { message: $t('authentication.emailTip') })
        .email($t('authentication.emailValidErrorTip')),
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
      },
      fieldName: 'captchaCode',
      label: $t('authentication.code'),
    },
  ];
});

function handleSubmit(value: Recordable<any>, jumpCaptcha = false) {
  const captchaRef = resetRef.value
    ?.getFormApi()
    ?.getFieldComponentRef('captchaCode');
  if (captchaProvider.value && !jumpCaptcha) {
    captchaRef.showPopupCaptcha(handleSubmit, value);
    return;
  }
  loading.value = true;
  value.applicationId = application.value.id;
  value.captchaId = captchaId.value;
  value.captchaCode = value.code;
  sendForgetPasswordLink(value)
    .then(() => {
      message.success('发送成功，请注意查收邮件');
    })
    .catch(() => {
      captchaRef.refetchCaptcha();
    })
    .finally(() => {
      loading.value = false;
    });
}
</script>

<template>
  <AuthenticationForgetPassword
    ref="resetRef"
    :login-path="`/auth/login/${groupName}`"
    :form-schema="formSchema"
    :loading="loading"
    @submit="handleSubmit"
  >
    <template #title>
      {{ $t('authentication.forgetPassword') }}
    </template>
  </AuthenticationForgetPassword>
</template>
