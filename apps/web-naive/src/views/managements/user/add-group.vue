<script lang="tsx" setup>
import { onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import { NGrid, NGridItem } from 'naive-ui';

import { useVbenForm } from '#/adapter/form';
import { getGroupTreeApi } from '#/api/core/group';

const parentId = history.state.parentId;

const onSubmit = (value: any) => {
  window.console.log(value);
};

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

const [BaseForm, { setFieldValue }] = useVbenForm({
  // 所有表单项共用，可单独在表单内覆盖
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  // 提交函数
  handleSubmit: onSubmit,
  // 垂直布局，label和input在不同行，值为vertical
  // 水平布局，label和input在同一行
  layout: 'horizontal',
  schema: [
    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Input',
      // 对应组件的参数
      componentProps: {
        placeholder: '请输入群组名',
      },
      // 字段名
      fieldName: 'name',
      // 界面显示的label
      label: '群组名',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        filterOption: true,
        multiple: true,
        filterable: true,
        tag: true,
        options: [
          {
            label: '管理员',
            value: 'admin',
          },
          {
            label: '用户',
            value: 'user',
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
      fieldName: 'parentId',
      label: '上级群组',
    },
  ],
  wrapperClass: 'grid-cols-1',
});

setFieldValue('parentId', parentId);
</script>
<template>
  <Page title="新增群组">
    <NGrid item-responsive cols="8" responsive="screen" style="width: '100%'">
      <NGridItem span="8 m:4 l:4" offset="0 m:2 l:2"> <BaseForm /></NGridItem>
    </NGrid>
  </Page>
</template>
