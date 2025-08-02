<script setup lang="tsx">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';

import { NButton, NCard, NGrid, NGridItem, NSelect } from 'naive-ui';

import { useVbenForm } from '#/adapter/form';
import { message } from '#/adapter/naive';
import { addUserApi, getUserApi, updateUserApi } from '#/api';
import { getGroupTreeApi } from '#/api/core/group';
import { getFlatGroupTree, getRolesByParentChain } from '#/views/utils';

const router = useRouter();
const route = useRoute();

const id = route.params?.id;
const curUser = ref<any>();

const groupTree = ref<any>([]);
const groupFlat = ref<any>([]);
const userInheritRoles: any = ref([]);

onMounted(() => {
  if (id) {
    getUserApi({ id }).then((res) => {
      curUser.value = res;
      setValues(curUser.value);
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

    groupFlat.value = getFlatGroupTree(groupTree.value[0]?.children);
  });
});

const onSubmit = (value: any) => {
  if (id) {
    value.id = id;
    updateUserApi(value).then(() => message.success('成功'));
  } else {
    addUserApi(value).then(() => message.success('成功'));
  }
};

const [BaseForm, { setValues }] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  handleSubmit: onSubmit,
  handleValuesChange(values, fieldsChanged) {
    if (fieldsChanged.includes('groupId')) {
      const group = groupFlat.value.find((el: any) => el.id === values.groupId);
      userInheritRoles.value = getRolesByParentChain(
        groupFlat.value,
        group?.parentChain,
      );
    }
  },
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
      dependencies: {
        show: !id,
        triggerFields: [''],
      },
      label: '密码',
    },
    {
      component: 'Input',

      componentProps: {
        placeholder: '请输入邮箱',
      },
      fieldName: 'email',
      label: '邮箱',
    },
    {
      component: 'Input',

      componentProps: {
        placeholder: '请输入手机号',
      },
      fieldName: 'phone',
      label: '手机号',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        filterOption: true,
        filterable: true,
        multiple: true,
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
      fieldName: 'roles',
      label: '角色组',
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
    {
      component: 'Input',
      fieldName: 'inheritRoles',
      label: '继承角色',
    },
  ],
  wrapperClass: 'grid-cols-1',
});
</script>
<template>
  <Page :title="route.name === 'AddUser' ? '新增用户' : '编辑用户'">
    <template #extra>
      <NButton @click="router.go(-1)"> 返回上一页 </NButton>
    </template>
    <NGrid item-responsive cols="8" responsive="screen">
      <NGridItem span="8 m:4 l:4" offset="0 m:2 l:2">
        <NCard>
          <BaseForm>
            <template #inheritRoles>
              <NSelect multiple :value="userInheritRoles" disabled />
            </template>
          </BaseForm>
        </NCard>
      </NGridItem>
    </NGrid>
  </Page>
</template>
