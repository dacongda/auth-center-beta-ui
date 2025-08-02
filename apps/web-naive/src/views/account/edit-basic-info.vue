<script setup lang="tsx">
import { NButton, NForm, NFormItem, NInput, NSpace, NTag } from 'naive-ui';

defineOptions({ name: 'EditBasicInfo' });

const props = defineProps(['inheritRoles', 'groups']);

interface UserBasicInfo {
  email?: string;
  phone?: string;
  roles?: Array<string>;
  groupId?: number;
  number?: string;
  name?: string;
}

const userinfo = defineModel<UserBasicInfo>('userInfo', { default: {} });
</script>
<template>
  <NForm class="m-6" label-placement="left" label-width="90">
    <NFormItem label="ID">
      <NInput v-model:value="userinfo.number" />
    </NFormItem>
    <NFormItem label="姓名">
      <NInput v-model:value="userinfo.name" />
    </NFormItem>
    <NFormItem label="归属群组">
      {{ props.groups?.find((el: any) => el.id === userinfo?.groupId).name }}
    </NFormItem>
    <NFormItem label="角色组">
      <NTag
        v-for="(role, idx) in userinfo.roles"
        :key="idx"
        :bordered="false"
        type="info"
      >
        {{ role }}
      </NTag>
    </NFormItem>
    <NFormItem label="继承角色组">
      <NTag
        v-for="(role, idx) in props.inheritRoles ?? []"
        :key="idx"
        :bordered="false"
        type="info"
      >
        {{ role }}
      </NTag>
    </NFormItem>
    <NFormItem label=" ">
      <NSpace class="w-full" reverse>
        <NButton type="primary">更新</NButton>
      </NSpace>
    </NFormItem>
  </NForm>
</template>
