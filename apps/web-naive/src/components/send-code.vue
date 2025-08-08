<script setup lang="tsx">
import type { CountdownProps } from 'naive-ui';

import { ref } from 'vue';

import {
  NButton,
  NCountdown,
  NInput,
  NInputGroup,
  NInputOtp,
  NSelect,
  NSpace,
} from 'naive-ui';

import { countryRegionList } from './country-code';

const props = defineProps(['type', 'disableCodeInput', 'resend']);

const code = defineModel<string>('code');
const value = defineModel<string>('value');

const duration = ref(0);
const countActive = ref(true);
const isLoading = ref(false);

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
    await props.resend();

    duration.value = 60_000;
    countActive.value = true;
  } finally {
    isLoading.value = false;
  }
};

const countryRegionOption = countryRegionList.map((el) => {
  return {
    name: `+${el.tel} (${el.short_upper})`,
    tel: `+${el.tel}`,
  };
});

const telCountryCode = ref('+86');
const telNumber = ref('');

const handleTelUpdate = () => {
  value.value = `${telCountryCode.value} ${telNumber.value}`;
};
</script>
<template>
  <NSpace vertical>
    <NInputGroup v-if="props.type === 'Phone'" class="m-2">
      <NSelect
        label-field="name"
        value-field="tel"
        :options="countryRegionOption"
        v-model:value="telCountryCode"
        filterable
        style="width: 200px"
        @update:value="handleTelUpdate"
      />
      <NInput v-model:value="telNumber" @update:value="handleTelUpdate" />
    </NInputGroup>
    <NInput
      v-if="props.type === 'Email'"
      class="m-2"
      v-model:value="value"
      placeholder="请输入"
    />
    <NSpace justify="start" align="center" v-if="!props.disableCodeInput">
      <NInputOtp
        class="m-2"
        @update-value="
          (el) => {
            code = el.join('');
          }
        "
      />
      <NButton
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
