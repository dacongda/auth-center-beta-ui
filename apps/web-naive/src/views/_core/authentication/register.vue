<script lang="tsx" setup>
import type { VbenFormSchema } from '@vben/common-ui';
import type { Recordable } from '@vben/types';

import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { AuthenticationRegister, z } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { message } from '#/adapter/naive';
import { registerApi, sendVerificationCodeApi } from '#/api';
import { getGroupWithApplicationApi } from '#/api/core/group';
import { useAuthStore } from '#/store';

defineOptions({ name: 'Register' });

const loading = ref(false);

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

const registerRef = ref();

// const oAuthParms: LocationQuery = route.query;
const groupName: any = ref('built-in');
const group: any = ref();
const application: any = ref();

const captchaProvider: any = ref();
const authProviers = ref<any[]>();
const emailProvider = ref<any>();
const smsProvider = ref<any>();

const captchaId: any = ref('');
const emailVerifyId = ref('');
const phoneVerifyId = ref('');

const handleOnResend = async (captchaId: any, captchaCode: any, type: any) => {
  const vals = await registerRef.value.getFormApi()?.getValues();
  const { mfaEnableId } = await sendVerificationCodeApi({
    authType: type,
    applicationId: application.value.id,
    captchaId,
    captchaCode,
    destination: vals[type.toLowerCase()],
  });

  if (type === 'Email') {
    emailVerifyId.value = mfaEnableId;
  }

  if (type === 'Phone') {
    phoneVerifyId.value = mfaEnableId;
  }
};

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
          (p: any) => p.type === 'Email' && p.rule.includes('Register'),
        );

        smsProvider.value = res.defaultApplication?.providerItems.find(
          (p: any) => p.type === 'SMS' && p.rule.includes('Register'),
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
      component: 'Input',
      componentProps: {
        placeholder: $t('authentication.usernameTip'),
        size: 'large',
      },
      fieldName: 'id',
      label: $t('authentication.username'),
      rules: z.string().min(1, { message: $t('authentication.usernameTip') }),
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: $t('authentication.nicknameTip'),
        size: 'large',
      },
      fieldName: 'name',
      label: $t('authentication.nickname'),
      rules: z.string().min(1, { message: $t('authentication.nicknameTip') }),
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
      component: 'Input',
      componentProps: {
        placeholder: $t('authentication.emailTip'),
        size: 'large',
      },
      fieldName: 'email',
      label: $t('authentication.email'),
      rules: z
        .string()
        .min(1, { message: $t('authentication.emailTip') })
        .email($t('authentication.emailValidErrorTip')),
    },
    {
      component: 'Sendcode',
      componentProps: {
        placeholder: $t('authentication.email') + $t('authentication.code'),
        type: 'Email',
        applicationId: application.value?.id,
        captchaProvider: captchaProvider.value,
        disableDestination: true,
        resend: handleOnResend,
        size: 'large',
      },
      dependencies: {
        triggerFields: [''],
        if: () => {
          return !!emailProvider.value;
        },
      },
      modelPropName: 'code',
      fieldName: 'emailVerifyCode',
      label: $t('authentication.email') + $t('authentication.code'),
      rules: z.string().min(1, { message: $t('authentication.codeTip', [6]) }),
    },
    {
      component: 'PhoneInput',
      componentProps: {
        placeholder: $t('authentication.mobileTip'),
        size: 'large',
      },
      fieldName: 'phone',
      label: $t('authentication.mobile'),
      rules: z.string().min(1, { message: $t('authentication.mobileTip') }),
    },
    {
      component: 'Sendcode',
      componentProps: {
        placeholder: $t('authentication.mobile') + $t('authentication.code'),
        type: 'Phone',
        applicationId: application.value?.id,
        captchaProvider: captchaProvider.value,
        disableDestination: true,
        resend: handleOnResend,
        size: 'large',
      },
      dependencies: {
        triggerFields: [''],
        if: () => {
          return !!smsProvider.value;
        },
      },
      modelPropName: 'code',
      fieldName: 'phoneVerifyCode',
      label: $t('authentication.mobile') + $t('authentication.code'),
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
      },
      fieldName: 'code',
      label: $t('authentication.code'),
    },
  ];
});

async function handleSubmit(value: Recordable<any>, jumpCaptcha = false) {
  const captchaRef = registerRef.value
    ?.getFormApi()
    ?.getFieldComponentRef('code');
  if (captchaProvider.value && !jumpCaptcha) {
    captchaRef.showPopupCaptcha(handleSubmit, value);
    return;
  }

  value.groupName = groupName.value;
  value.captchaId = captchaId.value;
  value.emailVerifyId = emailVerifyId.value;
  await registerApi(value);
  message.success('注册成功');
  router.push({
    name: 'LoginGroup',
    params: {
      groupName: groupName.value,
    },
  });
}
</script>

<template>
  <AuthenticationRegister
    ref="registerRef"
    title="创建账号"
    :login-path="`/auth/login/${groupName}`"
    sub-title=" "
    :form-schema="formSchema"
    :loading="loading"
    @submit="handleSubmit"
  />
</template>
