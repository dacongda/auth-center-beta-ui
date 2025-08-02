<script lang="tsx" setup>
import { useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';

import { NButton, NPopconfirm, NSpace, NTooltip, useMessage } from 'naive-ui';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteGroupApi, refreshGroupChainApi } from '#/api/core/group';

import { goAddGroup, goEditGroup, gridOptions } from './group-data';

const router = useRouter();
const message = useMessage();

const handleDelete = (row: any) => {
  deleteGroupApi({ id: row.id }).then(() => {
    message.success('成功');
    gridApi.reload();
  });
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });
</script>
<template>
  <Page title="群组列表" auto-content-height>
    <Grid table-title="数据列表" table-title-help="提示">
      <template #action="{ row }">
        <NSpace justify="center">
          <NButton text type="success"> 导入用户 </NButton>
          <!-- <NButton text type="primary"> 详情 </NButton> -->
          <NButton text type="primary" @click="goEditGroup(router, row)">
            编辑
          </NButton>
          <NButton
            text
            type="primary"
            @click="() => goAddGroup(router, row.id)"
          >
            增加下属
          </NButton>
          <NPopconfirm @positive-click="handleDelete(row)">
            <template #trigger>
              <NTooltip :disabled="row.children.length === 0">
                <template #trigger>
                  <NButton
                    :disabled="row.children.length > 0"
                    text
                    type="error"
                  >
                    删除
                  </NButton>
                </template>
                请先删除子群组
              </NTooltip>
            </template>
            是否删除群组 {{ row.name }}
          </NPopconfirm>
        </NSpace>
      </template>
      <template #toolbar-actions>
        <NButton class="mr-2" type="primary" @click="() => goAddGroup(router)">
          添加群组
        </NButton>
        <NButton
          class="mr-2"
          @click="
            refreshGroupChainApi().then(() => {
              message.success('成功');
              gridApi.reload();
            })
          "
        >
          刷新群组链
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
  </Page>
</template>
