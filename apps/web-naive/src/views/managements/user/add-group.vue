<script lang="tsx" setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Page, z } from '@vben/common-ui';

import { NButton, NCard, NGrid, NGridItem } from 'naive-ui';

import { useVbenForm } from '#/adapter/form';
import { message } from '#/adapter/naive';
import { getApplicationsByGroupIdApi } from '#/api/core/application';
import {
  addGroupApi,
  getGroupApi,
  getGroupTreeApi,
  updateGroupApi,
} from '#/api/core/group';

const router = useRouter();
const route = useRoute();
const parentId = history.state.parentId;

const id = route.params?.id;
const curGroup = ref<any>();

const applicationList = ref<any>([]);

const onSubmit = (value: any) => {
  if (id) {
    value.id = id;
    updateGroupApi(value).then(() => message.success('成功'));
  } else {
    addGroupApi(value).then(() => message.success('成功'));
  }
};

const groupTree = ref<any>([]);
onMounted(async () => {
  if (id) {
    await getApplicationsByGroupIdApi(id).then((res) => {
      applicationList.value = res;
    });
    getGroupApi({ id }).then((res) => {
      curGroup.value = res;
      setValues(curGroup.value);
    });
  }
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

const [BaseForm, { setFieldValue, setValues }] = useVbenForm({
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
        placeholder: '请输入群组名',
      },
      fieldName: 'name',
      label: '群组名',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入群组显示名',
      },
      fieldName: 'displayName',
      label: '显示名',
    },
    {
      component: 'Select',
      componentProps: {
        valueField: 'id',
        labelField: 'name',
        options: applicationList,
        placeholder: '请选择',
        showSearch: true,
      },
      dependencies: {
        triggerFields: ['parentId'],
        if: (values, _) => !values.parentId,
      },
      fieldName: 'defaultApplicationId',
      label: '默认应用',
    },
    {
      component: 'Switch',
      fieldName: 'disableSignup',
      componentProps: {
        style: { width: 'auto' },
      },
      dependencies: {
        triggerFields: ['parentId'],
        if: (values, _) => !values.parentId,
      },
      label: '禁止注册',
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
      rules: z
        .nullable(z.number())
        .refine((value) => value?.toString() !== id?.toString(), {
          message: '不可选择当前群组',
        })
        .nullish(),
      fieldName: 'parentId',
      label: '上级群组',
    },
  ],
  wrapperClass: 'grid-cols-1',
});

setFieldValue('parentId', parentId);
</script>
<template>
  <Page :title="route.name === 'AddGroup' ? '新增群组' : '编辑群组'">
    <template #extra>
      <NButton @click="router.go(-1)"> 返回上一页 </NButton>
    </template>
    <NGrid item-responsive cols="8" responsive="screen">
      <NGridItem span="8 m:4 l:4" offset="0 m:2 l:2">
        <NCard><BaseForm /></NCard>
      </NGridItem>
    </NGrid>
  </Page>
</template>
