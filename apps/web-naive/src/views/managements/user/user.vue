<script lang="tsx" setup>
import type { TreeOption } from 'naive-ui';

import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';

import { NButton, NDropdown, NSpace, NSplit, NTree } from 'naive-ui';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getGroupTreeApi } from '#/api/core/group';

import { gridOptions } from './user-data';

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });
const router = useRouter();

const groupXRef = ref(0);
const groupYRef = ref(0);
const showDropdownRef = ref(false);
const dropDownGroup = ref();
const optionsRef = ref();

const handleSelect = () => {
  goAddGroup(dropDownGroup.value.id);
  showDropdownRef.value = false;
};

const goAddGroup = (parentId: any) => {
  router.push({
    name: 'AddGroup',
    state: { parentId },
  });
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
      window.console.log(option);
    },
    onContextmenu(e: MouseEvent): void {
      optionsRef.value = [
        {
          key: 'add',
          label: '添加子群组',
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
  <Page title="用户列表">
    <template #extra> </template>
    <NSplit
      direction="horizontal"
      style="max-height: 80vh"
      :default-size="0.15"
      :max="0.75"
      :min="0.1"
    >
      <template #1>
        <NSpace vertical>
          <NButton class="mr-2" type="primary" @click="() => goAddGroup(0)">
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
          <template #toolbar-actions>
            <NButton class="mr-2" type="primary" @click="() => gridApi.query()">
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
