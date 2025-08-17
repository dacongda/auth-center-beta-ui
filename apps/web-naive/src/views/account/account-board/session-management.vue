<script lang="tsx" setup>
import { onMounted, ref } from 'vue';

import { MaterialSymbolsDesktopWindowsWutline } from '@vben/icons';
import { useAccessStore } from '@vben/stores';

import {
  NAvatar,
  NButton,
  NCard,
  NFlex,
  NH2,
  NH4,
  NIcon,
  NPopconfirm,
  NSpace,
  NTag,
  NText,
  NThing,
} from 'naive-ui';

import { message } from '#/adapter/naive';
import { revokeTokenApi } from '#/api';
import { getUserSessionListApi } from '#/api/core/logging';

const sessionList = ref<any[]>([]);

const accessStore = useAccessStore();

onMounted(async () => {
  sessionList.value = await getUserSessionListApi();
});

const handleRevokeSession = async (sessionId: string) => {
  try {
    await revokeTokenApi({ sessionId });
    sessionList.value = await getUserSessionListApi();
    message.success('会话已撤销');
  } catch {
    message.error('撤销会话失败');
  }
};
</script>
<template>
  <NFlex class="m-6" vertical>
    <NH2>Session列表</NH2>
    <NCard v-for="(session, idx) in sessionList" :key="idx">
      <NThing>
        <template #avatar>
          <NAvatar>
            <NIcon>
              <MaterialSymbolsDesktopWindowsWutline />
            </NIcon>
          </NAvatar>
        </template>
        <template #header>
          <NSpace>
            <NH4 prefix="bar">{{ session.sessionId }}</NH4>
            <NTag
              type="success"
              v-if="session.sessionId === accessStore.accessToken"
            >
              当前会话
            </NTag>
            <NTag
              type="default"
              v-if="new Date(session.expiredAt) < new Date()"
            >
              已过期
            </NTag>
          </NSpace>
        </template>
        <template #header-extra>
          <NPopconfirm
            @positive-click="handleRevokeSession(session.sessionId)"
            v-if="session.sessionId !== accessStore.accessToken"
          >
            <template #trigger>
              <NButton type="error" secondary> 撤销 </NButton>
            </template>
            是否撤销此会话
          </NPopconfirm>
        </template>
        <template #description>
          <NSpace align="center">
            <NText>IP:</NText>
            <NTag>{{ session.loginIp }}</NTag>
            <NText>登陆应用:</NText>
            <NTag>{{ session.loginApplication }}</NTag>
            <NText v-if="session.loginVia">登陆途径:</NText>
            <NTag v-if="session.loginVia">{{ session.loginVia }}</NTag>
          </NSpace>
        </template>
        <NText>
          过期时间: {{ new Date(session.expiredAt).toLocaleString() }}
        </NText>
      </NThing>
    </NCard>
  </NFlex>
</template>
