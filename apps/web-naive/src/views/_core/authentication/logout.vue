<script lang="tsx" setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { resetAllStores, useAccessStore } from '@vben/stores';

import { NResult, NSpace, NSpin } from 'naive-ui';

import { logoutApi } from '#/api';

const router = useRouter();
const route = useRoute();

const accessStore = useAccessStore();

onMounted(async () => {
  const redirectTo = route.query.groupName ? 'built-in' : route.query.groupName;
  try {
    await logoutApi();
    resetAllStores();
    accessStore.setLoginExpired(false);
    router.push({ name: 'Login', params: { groupName: redirectTo } });
  } catch (error: any) {
    fail.value = true;
    failMessage.value = error.message;
  }
});

const fail = ref(false);
const failMessage = ref('');
</script>
<template>
  <NSpace vertical align="center">
    <template v-if="!fail">
      <NSpin size="large" />
      注销中
    </template>
    <NResult
      v-if="fail"
      status="error"
      title="注销失败"
      :description="failMessage"
    />
  </NSpace>
</template>
