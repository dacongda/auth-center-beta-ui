<script setup lang="tsx">
import { ref } from 'vue';

import { MaterialSymbolsPasskey } from '@vben/icons';

import {
  NButton,
  NCard,
  NDivider,
  NGrid,
  NGridItem,
  NIcon,
  NInput,
  NSpace,
  NText,
} from 'naive-ui';

import { message } from '#/adapter/naive';
import {
  createCredentialApi,
  createOptionsApi,
  updateCredNameApi,
} from '#/api/core/webAuthn';
import { router } from '#/router';

import { coerceToArrayBuffer, coerceToBase64Url } from '../utils/webAuthn';

const addLoading = ref(false);
const passkeySupported = ref(false);
const generatedCred: any = ref(false);

const addPasskey = async () => {
  const res = await createOptionsApi();
  res.options.challenge = coerceToArrayBuffer(
    res.options.challenge,
    'challenge',
  );
  res.options.user.id = coerceToArrayBuffer(res.options.user.id, 'user id');
  res.options.challenge.excludeCredentials = res.options.excludeCredentials.map(
    (c: any) => {
      c.id = coerceToArrayBuffer(c.id, 'cid');
      return c;
    },
  );
  addLoading.value = true;
  const newCred: any = await navigator?.credentials
    .create({
      publicKey: res.options,
    })
    .catch((error) => {
      addLoading.value = false;
      window.console.log(error);
    });

  const attestationObject = new Uint8Array(newCred?.response.attestationObject);
  const clientDataJSON = new Uint8Array(newCred?.response.clientDataJSON);
  const rawId = new Uint8Array(newCred.rawId);

  const data = {
    id: newCred.id,
    rawId: coerceToBase64Url(rawId),
    type: newCred.type,
    extensions: newCred.getClientExtensionResults(),
    response: {
      attestationObject: coerceToBase64Url(attestationObject),
      clientDataJSON: coerceToBase64Url(clientDataJSON),
      transports: newCred.response.getTransports(),
    },
  };

  generatedCred.value = await createCredentialApi({
    requestValue: data,
    cacheOptionId: res.optionId,
  }).catch((error) => {
    addLoading.value = false;
    window.console.log(error);
  });

  addLoading.value = false;
};

const updatePasskey = async () => {
  try {
    await updateCredNameApi(generatedCred.value);
    message.success('创建成功');
    router.go(-1);
  } catch {
    message.error('更名失败');
  }
};

passkeySupported.value =
  navigator?.credentials &&
  (window.location.protocol === 'https' ||
    window.location.hostname === 'localhost');
</script>
<template>
  <NGrid class="m-6" item-responsive cols="12" responsive="screen">
    <NGridItem span="12 m:4 l:4" offset="0 m:4 l:4">
      <NCard header-class="text-center">
        <template #header>
          <NIcon size="50"><MaterialSymbolsPasskey /></NIcon>
          <p>创建Passkey</p>
        </template>
        <p v-if="passkeySupported">
          您的设备目前支持添加Passkey并使用Passkey进行登陆
        </p>
        <p v-else>
          您的设备或环境目前并不支持Passkey，请检查目前是否在使用Https以及浏览器版本
        </p>
        <br />
        <p>
          密钥 (Passkey) 是一种基于 FIDO
          的安全且方便的传统密码替代方案。它们使用先进的加密技术来保护你的账户免受钓鱼攻击
        </p>
        <NDivider />
        <NSpace vertical>
          <template v-if="generatedCred">
            <NText strong>密钥名字</NText>
            <NInput v-model:value="generatedCred.name" />
            <NButton
              v-if="passkeySupported"
              type="primary"
              block
              :loading="addLoading"
              @click="updatePasskey"
            >
              完成
            </NButton>
          </template>
          <template v-else>
            <NButton
              v-if="passkeySupported"
              type="primary"
              block
              :loading="addLoading"
              @click="addPasskey"
            >
              创建
            </NButton>
          </template>
        </NSpace>
      </NCard>
    </NGridItem>
  </NGrid>
</template>
