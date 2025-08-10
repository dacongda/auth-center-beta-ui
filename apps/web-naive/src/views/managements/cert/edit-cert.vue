<script setup lang="tsx">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';

import { NButton, NCard, NGrid, NGridItem, NInput } from 'naive-ui';

import { useVbenForm } from '#/adapter/form';
import { message } from '#/adapter/naive';
import { addCertApi, getCertApi, updateCertApi } from '#/api/core/cert';

const router = useRouter();
const route = useRoute();

const id = route.params?.id;
const curCert = ref<any>();

onMounted(() => {
  if (id) {
    getCertApi({ id, analyseCert: true }).then((res) => {
      curCert.value = res;
      setValues(curCert.value);
    });
  }
});

const onSubmit = (value: any) => {
  value.notAfter = new Date(value.notAfter).toISOString();
  return id
    ? updateCertApi(value).then(() => {
        message.success('证书更新成功');
        router.go(-1);
      })
    : addCertApi(value).then(() => {
        message.success('证书添加成功');
        router.go(-1);
      });
};

const [BaseForm, { setValues }] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  handleSubmit: onSubmit,
  layout: 'horizontal',
  schema: [
    {
      component: 'InputNumber',
      dependencies: {
        show: false,
        triggerFields: [''],
      },
      fieldName: 'id',
      label: 'id',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入证书名',
      },
      fieldName: 'name',
      label: '证书名',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入专有名称',
      },
      defaultValue: 'CN=www.example.com, O=Example Inc., OU=Admin',
      dependencies: {
        show: !id,
        triggerFields: [''],
      },
      fieldName: 'distinguishedName',
      label: '专有名称(DN)',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          {
            label: 'jwk',
            value: 'jwk',
          },
        ],
        placeholder: '请选择',
      },
      defaultValue: 'jwk',
      fieldName: 'type',
      label: '类型',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          {
            label: 'RSA',
            value: 'RS',
          },
          {
            label: 'ECDsa',
            value: 'ES',
          },
        ],
        placeholder: '请选择',
      },
      defaultValue: 'RSA',
      disabled: !!id,
      fieldName: 'cryptoAlgorithm',
      label: '加密算法',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          {
            label: '1024',
            value: '1024',
          },
          {
            label: '2048',
            value: '2048',
          },
          {
            label: '3072',
            value: '3072',
          },
          {
            label: '4096',
            value: '4096',
          },
        ],
        placeholder: '请选择',
      },
      dependencies: {
        show: (props) => {
          return props.cryptoAlgorithm === 'RSA';
        },
        triggerFields: ['cryptoAlgorithm'],
      },
      defaultValue: '2048',
      disabled: !!id,
      fieldName: 'bitSize',
      label: 'Bit size',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          {
            label: '256',
            value: '256',
          },
          {
            label: '384',
            value: '384',
          },
          {
            label: '512',
            value: '512',
          },
        ],
        placeholder: '请选择',
      },
      disabled: !!id,
      defaultValue: '256',
      fieldName: 'cryptoSHASize',
      label: 'SHA大小',
    },
    {
      component: 'Input',
      disabled: true,
      fieldName: 'subject',
      label: 'Subject',
      dependencies: {
        show: !!id,
        triggerFields: [''],
      },
    },
    {
      component: 'DatePicker',
      componentProps: {
        format: 'yyyy-MM-dd HH:mm:ss',
      },
      disabled: !!id,
      fieldName: 'notAfter',
      defaultValue: new Date().setFullYear(new Date().getFullYear() + 10),
      label: '有效期至',
    },
    {
      component: (props) => {
        return (
          <NInput
            autosize
            readonly
            type="textarea"
            value={`-----BEGIN CERTIFICATE-----\n${
              props.modelValue
            }\n-----END CERTIFICATE-----`}
          />
        );
      },
      dependencies: {
        show: !!id,
        triggerFields: [''],
      },
      disabled: true,
      fieldName: 'certificate',
      label: '公钥证书',
    },
  ],
  wrapperClass: 'grid-cols-1',
});
</script>
<template>
  <Page :title="route.name === 'AddCert' ? '新增证书' : '编辑证书'">
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
