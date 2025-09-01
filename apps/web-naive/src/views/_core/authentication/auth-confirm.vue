<script setup lang="tsx">
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';

import { NAvatar, NButton, NDivider, NFlex, NH2, NThing } from 'naive-ui';

import { useAuthStore } from '#/store';

const authStore = useAuthStore();

onMounted(async () => {
  if (!authStore.loginUserInfo) {
    const userInfo = await authStore.fetchUserInfo();
    authStore.loginUserInfo = userInfo;
  }
});

const route = useRoute();
const scopes = route.query.scopes ?? '';

window.console.log(authStore.loginUserInfo);
</script>
<template>
  <NFlex vertical justify="center">
    <NH2 class="text-center">
      授权应用: {{ authStore.loginApplication?.displayName }}
    </NH2>
    你将使用以下账号登陆
    <NThing class="mb-2">
      <template #avatar>
        <NAvatar :src="authStore.loginUserInfo?.avatar" />
      </template>
      <template #header>{{ authStore.loginUserInfo?.username }}</template>
    </NThing>
    <div>授权后应用可以获得下列权限</div>
    <li>获取登陆凭证</li>
    <li v-if="scopes.includes('email')">获取电子邮箱地址</li>
    <li v-if="scopes.includes('phone')">获取手机号码</li>
    <li v-if="scopes.includes('profile')">获取基本用户信息</li>
    <NDivider />
    <NFlex justify="end">
      <NButton size="large" @click="authStore.confirmCallback(false)">
        拒绝
      </NButton>
      <NButton
        size="large"
        type="primary"
        @click="authStore.confirmCallback(true)"
      >
        授权
      </NButton>
    </NFlex>
  </NFlex>
</template>
