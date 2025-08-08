<script setup lang="tsx">
import type { CountdownProps, StepsProps } from 'naive-ui';

import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
  NButton,
  NCard,
  NCountdown,
  NGrid,
  NGridItem,
  NInput,
  NInputOtp,
  NQrCode,
  NSpace,
  NStep,
  NSteps,
} from 'naive-ui';

import { message } from '#/adapter/naive';
import { enableMfaApi, enableMfaSetupApi } from '#/api/core/mfa';
import VerifyUserPanel from '#/components/verify-user-panel.vue';

const currentRef = ref<number>(1);
const currentStatus = ref<StepsProps['status']>('process');

const route = useRoute();
const router = useRouter();
const mfaType = route.params?.mfaType;

const totpUri = ref('Hello world');
const totpSecret = ref('');
const mfaEnableId = ref('');
const otpArray = ref([]);

const recoveryCode = ref('');
const curVerifyId = ref('');

const duration = ref(60_000);
const countActive = ref(true);

const onVerifyUser = async (verifyId: any) => {
  curVerifyId.value = verifyId;
  reSetupMfa();
};

const reSetupMfa = async () => {
  const res = await enableMfaSetupApi({
    requestValue: mfaType,
    cacheOptionId: curVerifyId.value,
  });

  currentRef.value = 2;

  totpUri.value = res?.totpUri;
  totpSecret.value = res?.secret;
  mfaEnableId.value = res?.mfaEnableId;

  duration.value = 60 * 1000;
  countActive.value = true;
};

const enableMfa = async () => {
  let otpValue = '';
  otpArray.value.forEach((el) => (otpValue += el));
  try {
    const res = await enableMfaApi({
      authType: mfaType,
      cacheOptionId: mfaEnableId.value,
      requestValue: otpValue,
    });
    if (res?.recoveryCode) {
      recoveryCode.value = res.recoveryCode;
    }

    currentRef.value += 1;
  } catch {
    message.error('验证失败');
  }
};

const countRender: CountdownProps['render'] = (props: {
  hours: number;
  milliseconds: number;
  minutes: number;
  seconds: number;
}) => {
  return (props.minutes * 60 + props.seconds).toString().padStart(2, '0');
};
</script>
<template>
  <NGrid class="m-6" item-responsive cols="12" responsive="screen">
    <NGridItem span="12 m:8 l:6" offset="0 m:2 l:3">
      <NCard header-class="text-center">
        <template #header>
          <!-- <NIcon size="50"><MaterialSymbolsPasskey /></NIcon> -->
          <p>启用MFA</p>
        </template>
        <NCard>
          <NSteps size="small" :current="currentRef" :status="currentStatus">
            <NStep
              title="身份验证"
              description="在启用MFA前你需要先进行身份验证。"
            />
            <NStep
              title="验证MFA"
              description="在正式启用MFA前，你需要确认你可以使用此MFA。"
            />
            <NStep
              title="保存恢复代码"
              description="保存您的恢复代码以便在MFA密钥丢失的情况下进行重置。"
            />
          </NSteps>
        </NCard>

        <!-- Auth form -->
        <NCard class="mt-6">
          <VerifyUserPanel
            v-if="currentRef === 1"
            type="MFA"
            @after-verify-user="onVerifyUser"
          />
          <template v-if="currentRef === 2">
            <NSpace vertical class="text-center" align="stretch">
              <template v-if="mfaType === 'TOTP'">
                <NQrCode
                  style="width: auto; height: auto"
                  :size="200"
                  :value="totpUri"
                />
                <NInput
                  style="justify-content: center"
                  :value="totpSecret"
                  readonly
                />
                请输入设备中显示的验证码
              </template>
              <template v-if="mfaType === 'Email'">
                <p>验证码已发送至您的邮箱</p>
                <NButton
                  :disabled="countActive"
                  type="primary"
                  secondary
                  @click="reSetupMfa"
                >
                  点击重新发送
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
              </template>
              <NInputOtp
                style="justify-content: center"
                @finish="enableMfa"
                v-model:value="otpArray"
              />
            </NSpace>
          </template>
          <template v-if="currentRef === 3">
            <template v-if="recoveryCode">
              <p class="text-center">
                以下是您的救援代码，在您设备无法使用MFA时可以通过救援代码进行登陆并重置MFA选项
              </p>
              <p class="m-6 text-center text-lg font-bold">
                {{ recoveryCode }}
              </p>
            </template>
            <p v-else>您已保存过救援代码，可从密码与安全页面查看并下载</p>
            <NButton type="primary" block @click="router.go(-1)">
              完成
            </NButton>
          </template>
        </NCard>
      </NCard>
    </NGridItem>
  </NGrid>
</template>
