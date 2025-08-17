<script lang="tsx" setup>
import type { MenuOption } from 'naive-ui';

import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';

import {
  NGrid,
  NGridItem,
  NLayout,
  NLayoutContent,
  NLayoutHeader,
  NLayoutSider,
  NMenu,
} from 'naive-ui';

import { getMyInfoApi } from '#/api';
import { getGroupTreeApi } from '#/api/core/group';

import { getFlatGroupTree, getRolesByParentChain } from '../utils';
import EditBasicInfo from './account-board/edit-basic-info.vue';
import EditSafeInfo from './account-board/edit-safe-info.vue';
import EditThirdPartInfo from './account-board/edit-third-part-info.vue';
import SessionManagement from './account-board/session-management.vue';

const router = useRouter();
const route = useRoute();

const menuKey: any = computed(() => route.params?.path);

const myInfo = ref();
const groupTree = ref();
const groupFlat = ref();
const userInheritRoles = ref();
const menuOptions: MenuOption[] = [
  {
    label: '基础信息',
    key: 'BasicInfo',
  },
  {
    label: '密码与安全',
    key: 'SafeInfo',
  },
  {
    label: '第三方登陆',
    key: 'ThirdPartInfo',
  },
  {
    label: '会话管理',
    key: 'SessionManagement',
  },
];

const groupName = ref('');

const windowWidth = ref(window.innerWidth);
const handleResize = () => {
  windowWidth.value = window.innerWidth;
};

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

    groupName.value = group.name;
    myInfo.value.groupName = group.name;

    userInheritRoles.value = getRolesByParentChain(
      groupFlat.value,
      group?.parentChain,
    );
  });

  window.addEventListener('resize', handleResize);
});

onUnmounted(async () => {
  window.removeEventListener('resize', handleResize);
});

const handleUpdateMenu = (key: string) => {
  router.push({ name: 'EditAccount', params: { path: key } });
};

const updateUserInfo = async () => {
  await getMyInfoApi().then((res) => {
    myInfo.value = res;
    myInfo.value.groupName = groupName.value;
  });
};

const diaplaySidebar = computed(() => {
  return windowWidth.value > 1024;
});
</script>
<template>
  <Page title="编辑个人信息" auto-content-height>
    <NGrid item-responsive cols="8" responsive="screen">
      <NGridItem span="8 m:6 l:6" offset="0 m:1 l:1">
        <NLayout
          style="height: 80vh; border-radius: 0.5rem"
          :has-sider="diaplaySidebar"
        >
          <NLayoutSider
            v-if="diaplaySidebar"
            bordered
            collapse-mode="width"
            :collapsed-width="64"
            :width="240"
            show-trigger
          >
            <NMenu
              :value="menuKey"
              :options="menuOptions"
              default-value="basicInfo"
              @update-value="handleUpdateMenu"
            />
          </NLayoutSider>
          <NLayoutHeader v-if="!diaplaySidebar">
            <NMenu
              mode="horizontal"
              :value="menuKey"
              :options="menuOptions"
              default-value="basicInfo"
              @update-value="handleUpdateMenu"
            />
          </NLayoutHeader>
          <NLayoutContent>
            <EditBasicInfo
              v-model:user-info="myInfo"
              :inherit-roles="userInheritRoles"
              :groups="groupFlat"
              v-if="menuKey === 'BasicInfo'"
            />
            <EditSafeInfo
              v-model:user-info="myInfo"
              v-if="menuKey === 'SafeInfo'"
              @update-user-info="updateUserInfo"
            />
            <EditThirdPartInfo
              v-model:user-info="myInfo"
              v-if="menuKey === 'ThirdPartInfo'"
              @update-user-info="updateUserInfo"
            />
            <SessionManagement
              v-if="menuKey === 'SessionManagement'"
              v-model:user-info="myInfo"
              @update-user-info="updateUserInfo"
            />
          </NLayoutContent>
        </NLayout>
      </NGridItem>
    </NGrid>
  </Page>
</template>
