<script lang="tsx" setup>
import { onMounted, ref } from 'vue';

import { NButton, NDivider, NH1, NH3, NSpace } from 'naive-ui';

import { sendVerificationCodeApi } from '#/api';
import { getCaptcha } from '#/api/core/captcha';
import SendCode from '#/components/send-code.vue';
import { useAuthStore } from '#/store';

const authStore = useAuthStore();

const mfaVerifyRequest = authStore?.mfaVerifyRequest;

const curType = ref(mfaVerifyRequest?.preferredMfa);

const code = ref('');
const verifyCodeId = ref('');

const captchaProvider = ref();

onMounted(() => {
  captchaProvider.value = authStore.loginApplication.providers.find(
    (p: any) => p.type === 'Captcha',
  );
  renewCaptcha();
});

const handleVerify = () => {
  const params = authStore.paramsCache;
  const oAuthParmas = authStore.oAuthParmsCache;

  params.code = code.value;
  params.password = verifyCodeId.value;
  params.loginMethod = curType.value;
  authStore.authLogin(params, oAuthParmas);
};

const captchaInfo: any = ref();
const renewCaptcha = async () => {
  if (
    curType.value === 'TOTP' ||
    captchaProvider.value?.subType !== 'Default'
  ) {
    return;
  }
  captchaInfo.value = await getCaptcha({
    applicationId: authStore.loginApplication.id,
  });
};

const handleResend = async (captchaId: any, captchaCode: any) => {
  const { mfaEnableId } = await sendVerificationCodeApi({
    authType: curType.value,
    verifyId: authStore.paramsCache.captchaId,
    captchaId,
    captchaCode,
  });

  verifyCodeId.value = mfaEnableId;
};
</script>
<template>
  <NSpace vertical>
    <NH1 class="text-center">MFA验证</NH1>
    <NH3 v-if="curType === 'Email'" class="text-center">邮箱</NH3>
    <NH3 v-if="curType === 'TOTP'" class="text-center">TOTP</NH3>
    <NH3 v-if="curType === 'SMS'" class="text-center">手机</NH3>
    <NH3 v-if="curType === 'RecoveryCode'" class="text-center">救援代码</NH3>

    <SendCode
      :captcha-provider="captchaProvider"
      :disable-destination="true"
      v-model:code="code"
      :type="curType"
      :resend="handleResend"
      :application-id="authStore.loginApplication.id"
    />

    <NButton type="primary" block @click="handleVerify">验证</NButton>
    <NDivider />

    <template
      v-for="(item, idx) in mfaVerifyRequest?.avaliableMfa ?? []"
      :key="idx"
    >
      <li v-if="curType !== item">
        <NButton
          type="primary"
          text
          @click="((curType = item), renewCaptcha())"
        >
          使用{{ item }}
        </NButton>
      </li>
    </template>
    <li v-if="curType !== 'RecoveryCode'">
      <NButton type="primary" text @click="curType = 'RecoveryCode'">
        使用救援代码
      </NButton>
    </li>
  </NSpace>
</template>
