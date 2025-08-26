<script lang="tsx" setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { NResult, NSpace, NSpin } from 'naive-ui';

import { getGroupWithApplicationApi } from '#/api/core/group';
import { useAuthStore } from '#/store';

const authStore = useAuthStore();
const fail = ref(false);
const failMessage = ref('');

const router = useRouter();

onMounted(async () => {
  const searchParams = new URLSearchParams(window.location.search);
  let loginSearch: any = {};

  const param: any = {
    loginMethod: 'ThirdPart',
    type: authStore.callbackState.type,
    code: authStore.callbackState.providerName,
    name: 'V',
    groupName: authStore.callbackState.groupName,
  };

  if (searchParams.get('state')) {
    param.password = searchParams.get('code');
    param.tempId = authStore.callbackState?.tempId;
    param.state = searchParams.get('state');

    const res = await getGroupWithApplicationApi({
      groupName: authStore.callbackState.groupName,
      clientId: authStore.callbackState.search?.client_id,
    });

    if (res?.defaultApplication) {
      authStore.loginApplication = res.defaultApplication;
    }
  } else if (searchParams.get('SAMLResponse')) {
    param.password = searchParams.get('SAMLResponse');
    param.state = searchParams.get('RelayState');
    const res = await getGroupWithApplicationApi({
      groupName: authStore.callbackState.groupName,
      applicationId: authStore.callbackState.applicationId,
    });

    if (res?.defaultApplication) {
      authStore.loginApplication = res.defaultApplication;
    }
  }

  loginSearch = authStore.callbackState.search;
  try {
    const res = await authStore.authLogin(param, loginSearch);

    if (res?.requireMfa) {
      router.push({ name: 'MfaVerify' });
    }
  } catch (error: any) {
    console.error(error);
    failMessage.value = error.message;
    fail.value = true;
  }
});
</script>
<template>
  <NSpace vertical align="center">
    <template v-if="!fail">
      <NSpin size="large" />
      登陆中
    </template>
    <NResult
      v-if="fail"
      status="error"
      title="登陆失败"
      :description="failMessage"
    />
  </NSpace>
</template>
