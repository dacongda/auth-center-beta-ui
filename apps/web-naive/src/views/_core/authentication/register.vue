<script lang="tsx" setup>
import type { VbenFormSchema } from '@vben/common-ui';
import type { Recordable } from '@vben/types';

import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { AuthenticationRegister, z } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { message } from '#/adapter/naive';
import { getCaptcha } from '#/api/core/captcha';
import { getGroupWithApplicationApi } from '#/api/core/group';
import { useAuthStore } from '#/store';

defineOptions({ name: 'Register' });

const loading = ref(false);

const authStore = useAuthStore();
const route = useRoute();
// const router = useRouter();

// const oAuthParms: LocationQuery = route.query;
const groupName: any = ref('built-in');
const group: any = ref();
const application: any = ref();

const captchaProvider: any = ref();
const authProviers = ref<any[]>();

const captchaInfo: any = ref();

onMounted(() => {
  groupName.value = route.query.groupName ?? 'built-in';

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

const formSchema = computed((): VbenFormSchema[] => {
  return [
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: $t('authentication.usernameTip'),
      },
      fieldName: 'username',
      label: $t('authentication.username'),
      rules: z.string().min(1, { message: $t('authentication.usernameTip') }),
    },
    {
      component: 'VbenInputPassword',
      componentProps: {
        passwordStrength: true,
        placeholder: $t('authentication.password'),
      },
      fieldName: 'password',
      label: $t('authentication.password'),
      renderComponentContent() {
        return {
          strengthText: () => $t('authentication.passwordStrength'),
        };
      },
      rules: z.string().min(1, { message: $t('authentication.passwordTip') }),
    },
    {
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: $t('authentication.confirmPassword'),
      },
      dependencies: {
        rules(values) {
          const { password } = values;
          return z
            .string({ required_error: $t('authentication.passwordTip') })
            .min(1, { message: $t('authentication.passwordTip') })
            .refine((value) => value === password, {
              message: $t('authentication.confirmPasswordTip'),
            });
        },
        triggerFields: ['password'],
      },
      fieldName: 'confirmPassword',
      label: $t('authentication.confirmPassword'),
    },
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: $t('authentication.emailTip'),
      },
      fieldName: 'email',
      label: $t('authentication.email'),
      rules: z
        .string()
        .min(1, { message: $t('authentication.emailTip') })
        .email($t('authentication.emailValidErrorTip')),
    },
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: $t('authentication.code'),
      },
      dependencies: {
        triggerFields: ['captchaId'],
        show: !!captchaProvider.value,
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
});

function handleSubmit(value: Recordable<any>) {
  // eslint-disable-next-line no-console
  console.log('register submit:', value);
}
</script>

<template>
  <AuthenticationRegister
    title="创建账号"
    sub-title=" "
    :form-schema="formSchema"
    :loading="loading"
    @submit="handleSubmit"
  />
</template>
