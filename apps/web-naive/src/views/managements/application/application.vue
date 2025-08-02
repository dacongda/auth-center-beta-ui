<script lang="tsx" setup>
import { useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';

import { NButton, NPopconfirm, NSpace } from 'naive-ui';

import { message } from '#/adapter/naive';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { removeApplicationApi } from '#/api/core/application';

import {
  applicationGridOptions,
  goAddApplication,
  goEditApplication,
} from './application-data';

const router = useRouter();

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions: applicationGridOptions });
</script>
<template>
  <Page title="应用列表" auto-content-height>
    <Grid table-title="数据列表" table-title-help="提示">
      <template #action="{ row }">
        <NSpace justify="center">
          <NButton text type="primary" @click="goEditApplication(router, row)">
            编辑
          </NButton>
          <NPopconfirm
            @positive-click="
              () => {
                removeApplicationApi({ id: row.id }).then(() => {
                  message.success('成功');
                  gridApi.reload();
                });
              }
            "
          >
            <template #trigger>
              <NButton text type="error"> 删除 </NButton>
            </template>
            是否删除应用 {{ row.name }}
          </NPopconfirm>
        </NSpace>
      </template>
      <template #toolbar-actions>
        <NButton
          class="mr-2"
          type="primary"
          @click="() => goAddApplication(router)"
        >
          添加应用
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
