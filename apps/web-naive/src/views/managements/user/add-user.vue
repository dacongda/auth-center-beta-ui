<script setup lang="tsx">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';

import { NButton, NCard, NGrid, NGridItem } from 'naive-ui';

import { useVbenForm } from '#/adapter/form';
import { message } from '#/adapter/naive';
import { addUserApi } from '#/api';
import { getGroupTreeApi } from '#/api/core/group';

const router = useRouter();

const groupTree = ref<any>([]);
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

const onSubmit = (value: any) => {
  addUserApi(value).then((res) => {
    message.success(res);
  });
};

const [BaseForm] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  handleSubmit: onSubmit,
  layout: 'horizontal',
  schema: [
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入编号',
      },
      fieldName: 'number',
      label: '编号',
    },
    {
      component: 'Input',

      componentProps: {
        placeholder: '请输入用户名',
      },
      fieldName: 'name',
      label: '用户名',
    },
    {
      component: 'Input',
      componentProps: {
        showPasswordOn: 'mousedown',
        type: 'password',
        placeholder: '请输入密码',
      },
      fieldName: 'password',
      label: '密码',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        filterOption: true,
        filterable: true,
        tag: true,
        options: [
          {
            label: '用户',
            value: 'user',
          },
          {
            label: '管理员',
            value: 'admin',
          },
        ],
        placeholder: '请选择',
        showSearch: true,
      },
      fieldName: 'defaultRoles',
      label: '默认角色组',
    },
    {
      component: 'TreeSelect',
      componentProps: {
        clearable: true,
        filterable: true,
        placeholder: '请选择',
        keyField: 'id',
        labelField: 'name',
        childrenField: 'children',
        defaultExpandedKeys: [0],
        options: groupTree,
        treeNodeFilterProp: 'label',
      },
      fieldName: 'groupId',
      label: '归属群组',
    },
  ],
  wrapperClass: 'grid-cols-1',
});
</script>
<template>
  <Page title="新增用户">
    <template #extra>
      <NButton
        @click="
          () => {
            router.go(-1);
          }
        "
      >
        返回上一页
      </NButton>
    </template>
    <NGrid item-responsive cols="8" responsive="screen">
      <NGridItem span="8 m:4 l:4" offset="0 m:2 l:2">
        <NCard><BaseForm /></NCard>
      </NGridItem>
    </NGrid>
  </Page>
</template>
