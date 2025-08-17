<script setup lang="tsx">
import { Page } from '@vben/common-ui';

import { NButton, NPopconfirm } from 'naive-ui';

import { message } from '#/adapter/naive';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { revokeTokenApi } from '#/api';

import { userSessionGridOptions } from './user-session';

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions: userSessionGridOptions });

const onRevoke = async (row: any) => {
  try {
    await revokeTokenApi({ sessionId: row.sessionId });
    gridApi.reload();
    message.success('会话已撤销');
  } catch {
    message.error('撤销会话失败');
  }
};
</script>
<template>
  <Page title="登陆日记列表" auto-content-height>
    <Grid table-title="数据列表" table-title-help="提示">
      <template #action="{ row }">
        <NPopconfirm @positive-click="() => onRevoke(row)">
          <template #trigger>
            <NButton text type="error"> 撤销 </NButton>
          </template>
          是否撤销此会话
        </NPopconfirm>
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
