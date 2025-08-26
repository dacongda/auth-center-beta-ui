<script setup lang="tsx">
import { onMounted, ref } from 'vue';

import { useUserStore } from '@vben/stores';

import {
  NAvatar,
  NButton,
  NEmpty,
  NFlex,
  NH2,
  NH3,
  NList,
  NListItem,
  NPopconfirm,
} from 'naive-ui';

import { message } from '#/adapter/naive';
import { myThirdPartBindApi, unBindThirdPartApi } from '#/api';
import { handleThirdPartRedirect } from '#/utils';

const userinfo = defineModel<any>('userInfo', { default: {} });
const dbUserInfo = useUserStore();
const application = dbUserInfo.userInfo?.loginApplication;

const authProviers = application?.providers.filter(
  (p: any) => p.type === 'Auth',
);

const userThirdPardBindList = ref<any[]>([]);

const handleBindIdp = async (item: any) => {
  const state = {
    applicationId: application.id,
    applicationName: application.name,
    groupName: userinfo.value?.groupName,
    providerName: item.name,
    type: 'bind',
  };

  const providerItem = application.providerItems.find(
    (p: any) => p.providerId === item.id,
  );

  handleThirdPartRedirect(item, providerItem, state);
};

const handleUnBindIdp = async (idpItem: any) => {
  const userBind = userThirdPardBindList.value?.find(
    (item) => item.providerName === idpItem.name,
  );
  await unBindThirdPartApi(userBind);
  userThirdPardBindList.value = await myThirdPartBindApi();
  message.success('解绑成功');
};

onMounted(async () => {
  userThirdPardBindList.value = await myThirdPartBindApi();
});
</script>
<template>
  <NFlex class="m-6" vertical>
    <NH2>第三方登录列表</NH2>
    <NList bordered>
      <NEmpty
        v-if="!authProviers || authProviers.length === 0"
        class="m-2"
        description=""
      />
      <NListItem v-for="(item, idx) in authProviers" :key="idx">
        <NH3>{{ item.displayName }}</NH3>
        <template #prefix>
          <NAvatar :size="48" :src="item.faviconUrl" />
        </template>
        {{
          userThirdPardBindList.find((bind) => bind.providerName === item.name)
            ?.thirdPartName
        }}
        <template #suffix>
          <NPopconfirm
            v-if="
              userThirdPardBindList.some(
                (bind) => bind.providerName === item.name,
              )
            "
            @positive-click="handleUnBindIdp(item)"
          >
            <template #trigger>
              <NButton secondary type="error"> 解绑 </NButton>
            </template>
            是否解绑
          </NPopconfirm>
          <NButton v-else secondary type="success" @click="handleBindIdp(item)">
            绑定
          </NButton>
        </template>
      </NListItem>
    </NList>
  </NFlex>
</template>
