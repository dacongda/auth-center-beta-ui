<script lang="tsx" setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { NResult, NSpace, NSpin } from 'naive-ui';

import { getGroupWithApplicationApi } from '#/api/core/group';
import { useAuthStore } from '#/store';
import { base64UrlTobase64 } from '#/views/utils/base64';

const authStore = useAuthStore();
const fail = ref(false);
const failMessage = ref('');

const router = useRouter();

onMounted(async () => {
  const searchParams = new URLSearchParams(window.location.search);
  let loginParams: any = {};
  let loginSearch: any = {};
  if (searchParams.get('state')) {
    const state = searchParams.get('state');
    const parsedState = base64UrlTobase64(state ?? '');
    const stateObj = JSON.parse(parsedState);

    const param: any = {};
    param.loginMethod = 'ThirdPart';
    param.type = stateObj.type;
    param.code = stateObj.providerName;
    param.name = 'V';
    param.password = searchParams.get('code');
    param.groupName = stateObj.groupName;

    const res = await getGroupWithApplicationApi({
      groupName: stateObj.groupName,
      clientId: stateObj.search?.client_id,
    });

    if (res?.defaultApplication) {
      authStore.loginApplication = res.defaultApplication;
    }

    loginParams = param;
    loginSearch = stateObj.search;
  } else if (searchParams.get('SAMLResponse')) {
    const state = searchParams.get('RelayState');
    if (!state) {
      failMessage.value = 'RelayState不可为空';
      fail.value = true;
    }

    const parsedState = base64UrlTobase64(state ?? '');
    const stateObj = JSON.parse(parsedState);

    const param: any = {};
    param.loginMethod = 'ThirdPart';
    param.type = stateObj.type;
    param.code = stateObj.providerName;
    param.name = 'V';
    param.password = searchParams.get('SAMLResponse');
    param.groupName = stateObj.groupName;

    const res = await getGroupWithApplicationApi({
      groupName: stateObj.groupName,
      applicationId: stateObj.applicationId,
    });

    if (res?.defaultApplication) {
      authStore.loginApplication = res.defaultApplication;
    }

    loginSearch = stateObj.search;
    loginParams = param;
  }

  try {
    const res = await authStore.authLogin(loginParams, loginSearch);

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
