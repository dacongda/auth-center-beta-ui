<script lang="ts" setup>
import { WorkbenchHeader } from '@vben/common-ui';
import { preferences } from '@vben/preferences';
import { useUserStore } from '@vben/stores';

const userStore = useUserStore();
</script>

<template>
  <div class="p-5">
    <WorkbenchHeader
      :avatar="userStore.userInfo?.avatar || preferences.app.defaultAvatar"
    >
      <template #title> 欢迎, {{ userStore.userInfo?.realName }} </template>
      <template #description> </template>
    </WorkbenchHeader>
  </div>
</template>
