<script setup lang="tsx">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import {
  NButton,
  NDivider,
  NEmpty,
  NFlex,
  NH2,
  NH3,
  NInput,
  NList,
  NListItem,
  NPopconfirm,
  NSpace,
  NTag,
  NText,
  NThing,
} from 'naive-ui';

import { message } from '#/adapter/naive';
import {
  getUserCredentialsApi,
  removeCredApi,
  updateCredNameApi,
} from '#/api/core/webAuthn';

defineOptions({ name: 'EditBasicInfo' });

// const props = defineProps(['inheritRoles', 'groups']);

interface UserBasicInfo {
  email?: string;
  phone?: string;
  roles?: Array<string>;
  groupId?: number;
  enableTotpMfa?: boolean;
  enableEmailMfa?: boolean;
  enablePhoneMfa?: boolean;
}
const userinfo = defineModel<UserBasicInfo>('userInfo', { default: {} });

const router = useRouter();
const userCreds = ref<Array<any>>([]);
onMounted(async () => {
  userCreds.value = await getUserCredentialsApi();
});

const handleEditPasskey = async (cred: any) => {
  try {
    await updateCredNameApi({
      id: cred.id,
      name: cred.editName,
      publicKey: '',
      userId: '',
    });
    cred.name = cred.editName;
    cred.editing = false;
    message.success('修改成功');
  } catch {
    message.error('修改失败');
  }
};

const handleRemovePasskey = async (id: any) => {
  try {
    await removeCredApi({ id });
    userCreds.value = await getUserCredentialsApi();
  } catch {
    message.error('删除失败');
  }
};
</script>
<template>
  <NFlex class="m-6" vertical>
    <NH2>密码安保</NH2>
    <NThing>
      <template #header> <NH3 strong>手机号</NH3> </template>
      <template #header-extra>
        <NButton type="primary">设置</NButton>
      </template>
      <template #description>
        {{ userinfo.phone ?? '未设置' }}
      </template>
    </NThing>
    <NDivider />
    <NThing>
      <template #header> <NH3 strong>邮箱</NH3> </template>
      <template #header-extra>
        <NButton type="primary">设置</NButton>
      </template>
      <template #description>
        {{ userinfo.email ?? '未设置' }}
      </template>
    </NThing>
    <NDivider />
    <NThing>
      <template #header> <NH3 strong>密码</NH3> </template>
      <template #header-extra>
        <NButton type="primary">修改</NButton>
      </template>
    </NThing>

    <NH2>Passkeys</NH2>

    <NSpace justify="space-between" align="center">
      <NText style="font-size: medium; font-weight: bold"> Passkey 列表 </NText>
      <NButton
        type="success"
        secondary
        @click="router.push({ name: 'AddPasskey' })"
      >
        增加
      </NButton>
    </NSpace>
    <NList bordered>
      <NEmpty
        v-if="!userCreds || userCreds.length === 0"
        class="m-2"
        description=""
      />
      <NListItem v-for="(cred, idx) in userCreds" :key="idx">
        <template v-if="!cred.editing">
          {{ cred.name }}
        </template>

        <NInput v-else v-model:value="cred.editName" />
        <template #suffix>
          <NSpace style="width: max-content">
            <template v-if="!cred.editing">
              <NButton
                type="primary"
                secondary
                @click="
                  () => {
                    cred.editing = true;
                    cred.editName = cred.name;
                  }
                "
              >
                编辑
              </NButton>
              <NPopconfirm @positive-click="handleRemovePasskey(cred.id)">
                <template #trigger>
                  <NButton secondary type="error"> 删除 </NButton>
                </template>
                是否删除证书 {{ cred.name }}
              </NPopconfirm>
            </template>
            <template v-else>
              <NButton
                type="primary"
                secondary
                @click="handleEditPasskey(cred)"
              >
                提交
              </NButton>
              <NButton
                type="error"
                secondary
                @click="
                  () => {
                    cred.editing = false;
                  }
                "
              >
                取消
              </NButton>
            </template>
          </NSpace>
        </template>
      </NListItem>
    </NList>

    <NH2>双因素认证</NH2>
    <NText style="font-size: medium; font-weight: bold"> 认证项列表 </NText>
    <NList bordered>
      <NListItem>
        TOTP
        <template v-if="userInfo?.enableTotpMfa">
          <NTag type="success">已配置</NTag>
        </template>
        <template #suffix>
          <NButton
            v-if="!userInfo?.enableTotpMfa"
            type="primary"
            @click="
              router.push({ name: 'EnableMfa', params: { mfaType: 'TOTP' } })
            "
          >
            启用
          </NButton>
          <NButton v-else type="error"> 关闭 </NButton>
        </template>
      </NListItem>
      <NListItem>
        邮件
        <template v-if="userInfo?.enableEmailMfa">
          <NTag type="success">已配置</NTag>
        </template>
        <template #suffix>
          <NButton
            v-if="!userInfo?.enableEmailMfa"
            type="primary"
            @click="
              router.push({ name: 'EnableMfa', params: { mfaType: 'Email' } })
            "
          >
            启用
          </NButton>
          <NButton v-else type="error"> 关闭 </NButton>
        </template>
      </NListItem>
      <NListItem>
        短信
        <template #suffix>
          <NButton
            v-if="!userInfo?.enablePhoneMfa"
            type="primary"
            @click="
              router.push({ name: 'EnableMfa', params: { mfaType: 'Phone' } })
            "
          >
            启用
          </NButton>
          <NButton v-else type="error"> 关闭 </NButton>
        </template>
      </NListItem>
    </NList>
  </NFlex>
</template>
