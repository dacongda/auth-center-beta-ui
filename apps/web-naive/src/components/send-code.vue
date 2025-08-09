<script setup lang="tsx">
import type { CountdownProps } from 'naive-ui';

import { onMounted, ref } from 'vue';

import { NButton, NCountdown, NInput, NInputOtp, NSpace } from 'naive-ui';

import { getCaptcha } from '#/api/core/captcha';
import PhoneInput from '#/components/phone-input.vue';

const props = defineProps([
  'type',
  'disableCodeInput',
  'resend',
  'applicationId',
  'disableDestination',
]);

const code = defineModel<string>('code');
const value = defineModel<string>('value');

const duration = ref(0);
const countActive = ref(true);
const isLoading = ref(false);
const captchaInfo: any = ref();
const captchaCode = ref('');

const countRender: CountdownProps['render'] = (props: {
  hours: number;
  milliseconds: number;
  minutes: number;
  seconds: number;
}) => {
  return `(${(props.minutes * 60 + props.seconds).toString().padStart(2, '0')}s)`;
};

const handleOnResend = async () => {
  try {
    isLoading.value = true;
    await props.resend(captchaInfo.value, captchaCode.value);

    duration.value = 60_000;
    countActive.value = true;
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  renewCaptcha();
});

const renewCaptcha = async () => {
  captchaInfo.value = await getCaptcha({
    applicationId: props.applicationId,
  });
};
</script>
<template>
  <NSpace vertical>
    <template v-if="!props.disableDestination">
      <PhoneInput
        v-model:value="value"
        v-if="props.type === 'Phone'"
        class="m-2"
      />
      <NInput
        v-if="props.type === 'Email'"
        class="m-2"
        v-model:value="value"
        placeholder="请输入"
      />
    </template>
    <div
      v-if="props.type !== 'TOTP'"
      class="relative m-2 flex w-full items-center"
    >
      <NInput class="flex" v-model:value="captchaCode" />
      <div class="ml-2">
        <img
          @click="renewCaptcha"
          :src="`data:image/bmp;base64,${captchaInfo?.captchaImg}`"
          style="height: 2.5rem"
        />
      </div>
    </div>

    <NSpace
      :justify="props.type === 'TOTP' ? 'center' : 'space-around'"
      align="center"
      v-if="!props.disableCodeInput"
    >
      <NInputOtp
        class="m-2"
        @update-value="
          (el) => {
            code = el.join('');
          }
        "
      />
      <NButton
        v-if="props.type !== 'TOTP'"
        :disabled="countActive || isLoading"
        :loading="countActive || isLoading"
        @click="handleOnResend"
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
    </NSpace>
  </NSpace>
</template>
