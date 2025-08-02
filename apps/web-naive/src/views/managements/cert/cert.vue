<script lang="tsx" setup>
import { useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';

import { NButton, NPopconfirm, NSpace } from 'naive-ui';

import { message } from '#/adapter/naive';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteCertApi } from '#/api/core/cert';

import { goAddCert, goEditCert, gridOptions } from './cert-data';

const router = useRouter();

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });
</script>
<template>
  <Page title="证书列表" auto-content-height>
    <Grid table-title="数据列表" table-title-help="提示">
      <template #action="{ row }">
        <NSpace justify="center">
          <NButton text type="primary" @click="goEditCert(router, row)">
            编辑
          </NButton>
          <NPopconfirm
            @positive-click="
              () => {
                deleteCertApi({ id: row.id }).then(() => {
                  message.success('成功');
                  gridApi.reload();
                });
              }
            "
          >
            <template #trigger>
              <NButton text type="error"> 删除 </NButton>
            </template>
            是否删除证书 {{ row.name }}
          </NPopconfirm>
        </NSpace>
      </template>
      <template #toolbar-actions>
        <NButton class="mr-2" type="primary" @click="() => goAddCert(router)">
          添加证书
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
