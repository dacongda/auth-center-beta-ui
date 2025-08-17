<script lang="tsx" setup>
import type { UploadFileInfo } from 'naive-ui';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';

import {
  NButton,
  NModal,
  NPopconfirm,
  NSpace,
  NTable,
  NText,
  NTooltip,
  NUpload,
  NUploadDragger,
  useMessage,
} from 'naive-ui';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { importUserApi } from '#/api';
import { deleteGroupApi, refreshGroupChainApi } from '#/api/core/group';

import { goAddGroup, goEditGroup, gridOptions } from './group-data';

const router = useRouter();
const message = useMessage();
const importUserVisible = ref(false);
const importGourp = ref('');
const importGroupName = ref('');

const succesImportList = ref<Array<any>>([]);
const failImportList = ref<Array<any>>([]);

const uploadFileList = ref<Array<UploadFileInfo>>([]);

const handleDelete = (row: any) => {
  deleteGroupApi({ id: row.id }).then(() => {
    message.success('成功');
    gridApi.reload();
  });
};

const handleImportUser = async () => {
  window.console.log(uploadFileList.value, importGourp.value);
  const formData = new FormData();
  formData.append('groupId', importGourp.value);
  const file = uploadFileList.value[0] as UploadFileInfo;

  const res = await importUserApi(importGourp.value, file.file as File);
  message.success(`导入用户`);

  succesImportList.value = res.successImportList;
  failImportList.value = res.failImportList;
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });
</script>
<template>
  <Page title="群组列表" auto-content-height>
    <NModal
      style="width: 600px"
      v-model:show="importUserVisible"
      :title="`导入用户-${importGroupName}`"
      preset="card"
      @close="((importUserVisible = false), (uploadFileList = []))"
    >
      <div>
        <NUpload
          :default-upload="false"
          v-model:file-list="uploadFileList"
          :max="1"
        >
          <NUploadDragger>
            <NText style="font-size: 16px">
              点击或者拖动文件到该区域来上传
            </NText>
          </NUploadDragger>
        </NUpload>
        <NButton type="primary" block @click="handleImportUser">
          导入用户
        </NButton>

        <NTable class="mt-2" size="small">
          <thead>
            <tr>
              <th>用户ID</th>
              <th>用户名</th>
              <th>邮箱</th>
              <th>手机号</th>
              <th>导入状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in succesImportList" :key="idx">
              <td>{{ item.id }}</td>
              <td>{{ item.name }}</td>
              <td>{{ item.email }}</td>
              <td>{{ item.phone }}</td>
              <td>成功</td>
            </tr>
            <tr v-for="(item, idx) in failImportList" :key="idx">
              <td>{{ item.id }}</td>
              <td>{{ item.name }}</td>
              <td>{{ item.email }}</td>
              <td>{{ item.phone }}</td>
              <td>失败</td>
            </tr>
          </tbody>
        </NTable>
      </div>
    </NModal>
    <Grid table-title="数据列表" table-title-help="提示">
      <template #action="{ row }">
        <NSpace justify="center">
          <NButton
            text
            type="success"
            @click="
              ((importUserVisible = true),
              (importGourp = row.id),
              (importGroupName = row.name))
            "
          >
            导入用户
          </NButton>
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
