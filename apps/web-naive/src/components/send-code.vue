<script setup lang="tsx">
import type { CountdownProps } from 'naive-ui';

import { ref } from 'vue';

import { NButton, NCountdown, NFlex, NInput, NInputOtp } from 'naive-ui';

import Captcha from '#/components/captcha.vue';
import PhoneInput from '#/components/phone-input.vue';

const props = defineProps([
  'type',
  'disableCodeInput',
  'resend',
  'applicationId',
  'disableDestination',
  'captchaProvider',
  'size',
]);

const code = defineModel<string>('code');
const value = defineModel<string>('value');

const duration = ref(0);
const countActive = ref(true);
const isLoading = ref(false);

const captchaRef = ref();
const captchaCode = ref('');
const captchaId = ref('');

const countRender: CountdownProps['render'] = (props: {
  hours: number;
  milliseconds: number;
  minutes: number;
  seconds: number;
}) => {
  return `(${(props.minutes * 60 + props.seconds).toString().padStart(2, '0')}s)`;
};

const handleOnResend = async (_: any, jumpCaptcha = false) => {
  if (!jumpCaptcha) {
    captchaRef.value.showPopupCaptcha(handleOnResendInner, {});
    return;
  }

  try {
    isLoading.value = true;
    await props.resend(captchaId.value, captchaCode.value, props.type);

    duration.value = 60_000;
    countActive.value = true;
  } finally {
    isLoading.value = false;
  }
};

const handleOnResendInner = async () => {
  try {
    isLoading.value = true;
    await props.resend(captchaId.value, captchaCode.value, props.type);

    duration.value = 60_000;
    countActive.value = true;
  } finally {
    captchaRef.value.refetchCaptcha();
    isLoading.value = false;
  }
};
</script>
<template>
  <NFlex vertical class="w-full" style="gap: 0">
    <template v-if="!props.disableDestination">
      <PhoneInput
        :size="props.size"
        v-model:value="value"
        v-if="props.type === 'SMS'"
        class="mt-2"
      />
      <NInput
        v-if="props.type === 'Email'"
        class="mt-2"
        v-model:value="value"
        placeholder="请输入"
        :size="props.size"
      />
    </template>
    <div
      v-if="props.type !== 'TOTP' && props.type !== 'RecoveryCode'"
      class="relative flex w-full items-center"
    >
      <Captcha
        ref="captchaRef"
        :application-id="props.applicationId"
        :provider="props.captchaProvider"
        v-model:value="captchaCode"
        v-model:captcha-id="captchaId"
      />
    </div>

    <NInput
      v-if="props.type === 'RecoveryCode'"
      :size="props.size"
      v-model:value="code"
      placeholder="请输入救援代码"
    />

    <NFlex
      align="center"
      class="w-100"
      style="flex-flow: row"
      v-if="!props.disableCodeInput"
    >
      <NInput
        v-if="props.type !== 'TOTP'"
        :size="props.size"
        v-model:value="code"
        :placeholder="
          props.type === 'RecoveryCode' ? '请输入救援代码' : '请输入验证码'
        "
      />
      <NInputOtp
        v-if="['TOTP'].includes(props.type)"
        class="m-2 m-auto"
        @update-value="
          (el) => {
            code = el.join('');
          }
        "
      />
      <NButton
        :size="props.size"
        v-if="props.type !== 'TOTP' && props.type !== 'RecoveryCode'"
        :disabled="countActive || isLoading"
        :loading="countActive || isLoading"
        @click="handleOnResend(false)"
      >
        发送验证码
        <NCountdown
          v-if="countActive"
          :render="countRender"
          :duration="duration"
          :active="countActive"
          :on-finish="
            () => {
              countActive = false;
            }
          "
        />
      </NButton>
    </NFlex>
  </NFlex>
</template>
