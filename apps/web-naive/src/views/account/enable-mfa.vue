<script setup lang="tsx">
import type { StepsProps } from 'naive-ui';

import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { MaterialSymbolsPasskey } from '@vben/icons';
import { useUserStore } from '@vben/stores';

import {
  NButton,
  NCard,
  NGrid,
  NGridItem,
  NIcon,
  NInput,
  NInputOtp,
  NQrCode,
  NSpace,
  NStep,
  NSteps,
} from 'naive-ui';

import { message } from '#/adapter/naive';
import { enableMfaApi, enableMfaSetupApi } from '#/api/core/mfa';
import {
  createAssertionApi,
  getAssertionOptionsApi,
} from '#/api/core/webAuthn';

import { verifyUser } from '../../api/core/auth';
import { coerceToArrayBuffer, coerceToBase64Url } from '../utils/webAuthn';

const currentRef = ref<number>(1);
const currentStatus = ref<StepsProps['status']>('process');

const route = useRoute();
const router = useRouter();
const mfaType = route.params?.mfaType;
const authMode = ref('Password');
const password = ref('');

const user = useUserStore();

const totpUri = ref('Hello world');
const totpSecret = ref('');
const mfaEnableId = ref('');
const otpArray = ref([]);

const recoveryCode = ref('');

const onVerifyUser = async () => {
  if (authMode.value === 'Passkey') {
    const { options, optionId } = await getAssertionOptionsApi({
      number: user.userInfo?.userId,
    });

    options.challenge = coerceToArrayBuffer(options.challenge, 'challenge');
    options.allowCredentials.forEach((listItem: any) => {
      listItem.id = coerceToArrayBuffer(listItem.id, 'listItemId');
    });

    const credential: any = await navigator.credentials
      .get({
        publicKey: options,
      })
      .catch(() => {
        message.error('操作取消');
      });

    const authData = new Uint8Array(credential.response.authenticatorData);
    const clientDataJSON = new Uint8Array(credential.response.clientDataJSON);
    const rawId = new Uint8Array(credential.rawId);
    const sig = new Uint8Array(credential.response.signature);
    const userHandle = new Uint8Array(credential.response.userHandle);
    const data = {
      id: credential.id,
      rawId: coerceToBase64Url(rawId),
      type: credential.type,
      extensions: credential.getClientExtensionResults(),
      response: {
        authenticatorData: coerceToBase64Url(authData),
        clientDataJSON: coerceToBase64Url(clientDataJSON),
        userHandle: userHandle === null ? null : coerceToBase64Url(userHandle),
        signature: coerceToBase64Url(sig),
      },
    };

    try {
      const { webAuthLoginId } = await createAssertionApi({
        requestValue: data,
        cacheOptionId: optionId,
        authType: 'verify',
      });
      password.value = webAuthLoginId;
    } catch {
      return;
    }
  }

  const { verifyId } = await verifyUser({
    name: user.userInfo?.userId,
    groupName: ' ',
    password: password.value,
    loginMethod: authMode.value,
  });

  const res = await enableMfaSetupApi({
    requestValue: mfaType,
    cacheOptionId: verifyId,
  });

  currentRef.value = currentRef.value + 1;

  totpUri.value = res?.totpUri;
  totpSecret.value = res?.secret;
  mfaEnableId.value = res?.mfaEnableId;
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
          <template v-if="currentRef === 1">
            <div v-if="authMode === 'Password'">
              密码验证
              <NInput type="password" v-model:value="password" />
            </div>
            <NSpace
              vertical
              align="center"
              justify="center"
              v-if="authMode === 'Passkey'"
            >
              <NIcon size="80"><MaterialSymbolsPasskey /></NIcon>
              <p>使用Passkey验证</p>
            </NSpace>
            <NButton @click="onVerifyUser" type="primary" class="mt-2" block>
              验证
            </NButton>
            <div class="m-2">
              <li v-if="authMode !== 'Passkey'">
                <NButton type="primary" text @click="authMode = 'Passkey'">
                  使用Passkey登陆
                </NButton>
              </li>
              <li v-if="authMode !== 'Password'">
                <NButton type="primary" text @click="authMode = 'Password'">
                  使用密码登陆
                </NButton>
              </li>
            </div>
          </template>
          <template v-if="currentRef === 2">
            <NSpace vertical class="text-center" align="stretch">
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
            <NButton
              type="primary"
              block
              @click="router.push({ name: 'EditAccount' })"
            >
              完成
            </NButton>
          </template>
        </NCard>
      </NCard>
    </NGridItem>
  </NGrid>
</template>
