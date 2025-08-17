<script lang="tsx" setup>
import { ref } from 'vue';

import { MaterialSymbolsPasskey } from '@vben/icons';
import { useUserStore } from '@vben/stores';

import { NButton, NIcon, NInput, NSpace } from 'naive-ui';

import { message } from '#/adapter/naive';
import { verifyUser } from '#/api';
import {
  createAssertionApi,
  getAssertionOptionsApi,
} from '#/api/core/webAuthn';
import { coerceToArrayBuffer, coerceToBase64Url } from '#/views/utils/webAuthn';

const props = defineProps(['type']);
const emit = defineEmits(['afterVerifyUser']);
const authMode = ref('Password');
const password = ref('');
const user = useUserStore();

const onVerifyUser = async () => {
  if (authMode.value === 'Passkey') {
    const { options, optionId } = await getAssertionOptionsApi({
      id: user.userInfo?.userId,
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
    type: props.type,
  });

  emit('afterVerifyUser', verifyId);
};
</script>
<template>
  <div>
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
          使用Passkey验证
        </NButton>
      </li>
      <li v-if="authMode !== 'Password'">
        <NButton type="primary" text @click="authMode = 'Password'">
          使用密码验证
        </NButton>
      </li>
    </div>
  </div>
</template>
