<script lang="tsx" setup>
import type { VbenFormSchema } from '@vben/common-ui';
import type { Recordable } from '@vben/types';

import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { AuthenticationForgetPassword, z } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { message } from '#/adapter/naive';
import { resetPasswordApi } from '#/api';
import { getGroupWithApplicationApi } from '#/api/core/group';
import { useAuthStore } from '#/store';

defineOptions({ name: 'ForgetPassword' });

const loading = ref(false);

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

const groupName: any = ref('built-in');
const group: any = ref();
const application: any = ref();
const authProviers = ref<any[]>();

const token: any = ref();

onMounted(() => {
  groupName.value = route.params.groupName ?? 'built-in';
  token.value = route.query?.token;

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
  ];
});

function handleSubmit(value: Recordable<any>) {
  loading.value = true;
  value.applicationId = application.value.id;
  value.resetToken = token.value;
  resetPasswordApi(value)
    .then(() => {
      message.success('重置成功');
      router.push({
        name: 'LoginGroup',
        params: {
          groupName: groupName.value,
        },
      });
    })
    .finally(() => {
      loading.value = false;
    });
}
</script>

<template>
  <AuthenticationForgetPassword
    :login-path="`/auth/login/${groupName}`"
    submit-button-text="重置"
    :form-schema="formSchema"
    :loading="loading"
    sub-title=" "
    @submit="handleSubmit"
  >
    <template #title> 重置密码 </template>
  </AuthenticationForgetPassword>
</template>
