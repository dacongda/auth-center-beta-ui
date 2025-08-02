<script lang="tsx" setup>
import type { TreeOption } from 'naive-ui';

import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';

import { NButton, NDropdown, NSpace, NSplit, NTree } from 'naive-ui';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getUserListApi } from '#/api';
import { getGroupTreeApi } from '#/api/core/group';

import { goAddGroup } from './group-data';
import { getGridOptions, goAddUser, goEditUser } from './user-data';

const userApi = async ({ page, sort }: any) => {
  return await getUserListApi({
    page: page.currentPage,
    pageSize: page.pageSize,
    sortBy: sort.field,
    sortOrder: sort.order,
    parentChain: currentParentChain.value,
  });
};
const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: getGridOptions(userApi),
});

const groupXRef = ref(0);
const groupYRef = ref(0);
const showDropdownRef = ref(false);
const dropDownGroup = ref();
const optionsRef = ref();
const currentParentChain = ref();

const router = useRouter();

const handleSelect = () => {
  goAddGroup(router, dropDownGroup.value.id);
  showDropdownRef.value = false;
};

const handleClickoutside = () => {
  showDropdownRef.value = false;
};

const groupTree: any = ref([]);
onMounted(() => {
  getGroupTreeApi().then((res) => {
    groupTree.value = [
      {
        id: 0,
        name: 'root',
        children: res,
      },
    ];
  });
});

const nodeProps = ({ option }: { option: TreeOption }) => {
  return {
    onClick: () => {
      currentParentChain.value = option.parentChain;
      gridApi.query();
    },
    onContextmenu(e: MouseEvent): void {
      optionsRef.value = [
        {
          key: 'add',
          label: '添加子群组',
        },
        {
          key: 'view',
          label: '查看群组信息',
        },
      ];
      dropDownGroup.value = option;
      showDropdownRef.value = true;
      groupXRef.value = e.clientX;
      groupYRef.value = e.clientY;
      e.preventDefault();
    },
  };
};
</script>
<template>
  <Page title="用户列表" auto-content-height>
    <template #extra> </template>
    <NSplit direction="horizontal" :default-size="0.15" :max="0.75" :min="0.1">
      <template #1>
        <NSpace vertical>
          <NButton
            class="mr-2"
            type="primary"
            @click="() => goAddGroup(router, 0)"
          >
            添加群组
          </NButton>
          <NTree
            show-line
            :data="groupTree"
            key-field="id"
            label-field="name"
            children-field="children"
            selectable
            :default-expanded-keys="[0]"
            :default-selected-keys="[0]"
            :node-props="nodeProps"
          />
        </NSpace>
      </template>
      <template #2>
        <Grid table-title="数据列表" table-title-help="提示">
          <template #action="{ row }">
            <NSpace justify="center">
              <NButton text type="primary" @click="goEditUser(router, row)">
                编辑
              </NButton>
              <NButton text type="error">删除</NButton>
            </NSpace>
          </template>
          <template #toolbar-actions>
            <NButton
              class="mr-2"
              type="primary"
              @click="() => goAddUser(router)"
            >
              添加用户
            </NButton>
          </template>
          <template #toolbar-tools>
            <NButton class="mr-2" type="primary" @click="() => gridApi.query()">
              刷新当前页面
            </NButton>
            <NButton type="primary" @click="() => gridApi.reload()">
              刷新并返回第一页
            </NButton>
          </template>
        </Grid>
      </template>
    </NSplit>
    <NDropdown
      trigger="manual"
      placement="bottom-start"
      :show="showDropdownRef"
      :options="optionsRef"
      :x="groupXRef"
      :y="groupYRef"
      @select="handleSelect"
      @clickoutside="handleClickoutside"
    />
  </Page>
</template>
