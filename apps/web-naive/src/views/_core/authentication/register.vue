<script lang="tsx" setup>
import type { CountdownProps } from 'naive-ui';

import type { VbenFormSchema } from '@vben/common-ui';
import type { Recordable } from '@vben/types';

import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { AuthenticationRegister, z } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { NButton, NCountdown } from 'naive-ui';

import { message } from '#/adapter/naive';
import { registerApi, sendVerificationCodeApi } from '#/api';
import { getCaptcha } from '#/api/core/captcha';
import { getGroupWithApplicationApi } from '#/api/core/group';
import { useAuthStore } from '#/store';

defineOptions({ name: 'Register' });

const loading = ref(false);

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

// const oAuthParms: LocationQuery = route.query;
const groupName: any = ref('built-in');
const group: any = ref();
const application: any = ref();

const captchaProvider: any = ref();
const authProviers = ref<any[]>();
const emailProvider = ref<any>();

const captchaInfo: any = ref();

const emailDuration = ref(0);
const emailIsLoading = ref(false);
const emailCountActive = ref(true);
const emailVerifyId = ref('');

const phoneDuration = ref(0);
const phoneIsLoading = ref(false);
const phoneCountActive = ref(true);
const phoneVerifyId = ref('');

const registerRef = ref();

const handleOnResend = async (type: any) => {
  try {
    if (type === 'Email') {
      emailIsLoading.value = true;
    }
    if (type === 'Phone') {
      phoneIsLoading.value = true;
    }

    const vals = await registerRef.value.getFormApi()?.getValues();
    const { mfaEnableId } = await sendVerificationCodeApi({
      authType: type,
      applicationId: application.value.id,
      captchaId: captchaInfo.value.captchaId,
      captchaCode: vals.code,
      destination: vals[type.toLowerCase()],
    });

    if (type === 'Email') {
      emailVerifyId.value = mfaEnableId;
      emailDuration.value = 60_000;
      emailCountActive.value = true;
    }

    if (type === 'Phone') {
      phoneVerifyId.value = mfaEnableId;
      phoneDuration.value = 60_000;
      phoneCountActive.value = true;
    }
  } finally {
    if (type === 'Email') {
      emailIsLoading.value = false;
    }
    if (type === 'Phone') {
      phoneIsLoading.value = false;
    }
  }
};

const countRender: CountdownProps['render'] = (props: {
  hours: number;
  milliseconds: number;
  minutes: number;
  seconds: number;
}) => {
  return `(${(props.minutes * 60 + props.seconds).toString().padStart(2, '0')}s)`;
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

        authProviers.value = res.defaultApplication?.providers.filter(
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
      fieldName: 'id',
      label: $t('authentication.username'),
      rules: z.string().min(1, { message: $t('authentication.usernameTip') }),
    },
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: $t('authentication.nicknameTip'),
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
        placeholder: $t('authentication.email') + $t('authentication.code'),
      },
      dependencies: {
        triggerFields: [''],
        show: () => {
          return !!emailProvider.value;
        },
      },
      fieldName: 'emailVerifyCode',
      label: $t('authentication.email') + $t('authentication.code'),
      rules: z.string().min(1, { message: $t('authentication.codeTip', [6]) }),
      suffix: () => {
        return (
          <NButton
            loading={emailIsLoading.value}
            onClick={() => {
              handleOnResend('Email');
            }}
          >
            发送验证码
            {emailCountActive.value ? (
              <NCountdown
                active={emailCountActive.value}
                duration={emailDuration.value}
                onFinish={() => {
                  emailCountActive.value = false;
                }}
                render={countRender}
              />
            ) : null}
          </NButton>
        );
      },
    },
    {
      component: 'PhoneInput',
      componentProps: {
        placeholder: $t('authentication.mobileTip'),
      },
      fieldName: 'phone',
      label: $t('authentication.mobile'),
      rules: z.string().min(1, { message: $t('authentication.mobileTip') }),
    },
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: $t('authentication.code'),
      },
      dependencies: {
        triggerFields: ['id'],
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
});

async function handleSubmit(value: Recordable<any>) {
  value.groupName = groupName.value;
  value.captchaId = captchaInfo.value.captchaId;
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
