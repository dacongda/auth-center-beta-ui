<script lang="tsx" setup>
import type { MenuOption } from 'naive-ui';

import { onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import {
  NGrid,
  NGridItem,
  NLayout,
  NLayoutContent,
  NLayoutSider,
  NMenu,
} from 'naive-ui';

import { getMyInfoApi } from '#/api';
import { getGroupTreeApi } from '#/api/core/group';

import { getFlatGroupTree, getRolesByParentChain } from '../utils';
import EditBasicInfo from './edit-basic-info.vue';
import EditSafeInfo from './edit-safe-info.vue';

const menuKey = ref('basicInfo');
const myInfo = ref();
const groupTree = ref();
const groupFlat = ref();
const userInheritRoles = ref();
const menuOptions: MenuOption[] = [
  {
    label: '基础信息',
    key: 'basicInfo',
  },
  {
    label: '密码与安全',
    key: 'safe',
  },
];

onMounted(async () => {
  await getMyInfoApi().then((res) => {
    myInfo.value = res;
  });

  getGroupTreeApi().then((res) => {
    groupTree.value = [
      {
        id: 0,
        name: 'root',
        children: res,
      },
    ];

    groupFlat.value = getFlatGroupTree(groupTree.value[0]?.children);

    const group = groupFlat.value.find(
      (el: any) => el.id === myInfo.value.groupId,
    );

    userInheritRoles.value = getRolesByParentChain(
      groupFlat.value,
      group?.parentChain,
    );
  });
});
</script>
<template>
  <Page title="编辑个人信息" auto-content-height>
    <NGrid item-responsive cols="8" responsive="screen">
      <NGridItem span="8 m:6 l:6" offset="0 m:1 l:1">
        <NLayout style="height: 80vh; border-radius: 0.5rem" has-sider>
          <NLayoutSider
            bordered
            collapse-mode="width"
            :collapsed-width="64"
            :width="240"
            show-trigger
          >
            <NMenu
              v-model:value="menuKey"
              :options="menuOptions"
              default-value="basicInfo"
            />
          </NLayoutSider>
          <NLayoutContent>
            <EditBasicInfo
              v-model:user-info="myInfo"
              :inherit-roles="userInheritRoles"
              :groups="groupFlat"
              v-if="menuKey === 'basicInfo'"
            />
            <EditSafeInfo
              v-model:user-info="myInfo"
              v-if="menuKey === 'safe'"
            />
          </NLayoutContent>
        </NLayout>
      </NGridItem>
    </NGrid>
  </Page>
</template>
