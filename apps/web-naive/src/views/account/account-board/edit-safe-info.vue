<script setup lang="tsx">
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import { useUserStore } from '@vben/stores';

import {
  NButton,
  NCard,
  NDivider,
  NEmpty,
  NFlex,
  NH2,
  NH3,
  NInput,
  NList,
  NListItem,
  NModal,
  NPopconfirm,
  NSpace,
  NTag,
  NText,
  NThing,
} from 'naive-ui';

import { message } from '#/adapter/naive';
import { sendVerificationCodeApi, updateUserSafeInfoApi } from '#/api';
import { disableMfaApi, SetPreferredMfaApi } from '#/api/core/mfa';
import {
  getUserCredentialsApi,
  removeCredApi,
  updateCredNameApi,
} from '#/api/core/webAuthn';
import SendCode from '#/components/send-code.vue';
import VerifyUserPanel from '#/components/verify-user-panel.vue';

defineOptions({ name: 'EditBasicInfo' });

const emit = defineEmits(['updateUserInfo']);

interface UserBasicInfo {
  email?: string;
  phone?: string;
  roles?: Array<string>;
  groupId?: number;
  enableTotpMfa?: boolean;
  enableEmailMfa?: boolean;
  enablePhoneMfa?: boolean;
  preferredMfaType?: string;
  loginApplication?: number;
}
const userinfo = defineModel<UserBasicInfo>('userInfo', { default: {} });

const router = useRouter();
const userCreds = ref<Array<any>>([]);
const showVerifyModal = ref(false);
const curDisableMfa = ref('');

const curModifyItem = ref('');

const safeForm = reactive({
  phone: '',
  email: '',
  newPassword: '',
  confirmNewPassword: '',
  code: '',
  codeId: '',
  verifyCode: '',
  type: '',
});

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

const handleSetPrefered = async (mfaType: string) => {
  await SetPreferredMfaApi({ preferredMfa: mfaType });
  message.success('设置成功');
  emit('updateUserInfo');
};

const handleDisableMfa = async (verifyId: any) => {
  if (['Email', 'Password', 'Phone'].includes(curModifyItem.value)) {
    safeForm.verifyCode = verifyId;
    showVerifyModal.value = false;
    return;
  }
  try {
    await disableMfaApi({
      authType: curDisableMfa.value,
      cacheOptionId: verifyId,
      requestValue: 'h',
    });

    emit('updateUserInfo');
    showVerifyModal.value = false;
    curDisableMfa.value = '';
  } catch {
    message.error('删除失败');
    curDisableMfa.value = '';
  }
};

const handleSafeSubmit = async (type: string) => {
  if (
    type === 'Password' &&
    safeForm.newPassword !== safeForm.confirmNewPassword
  ) {
    message.error('两次输入密码不一致');
    return;
  }

  safeForm.type = type;

  await updateUserSafeInfoApi(safeForm);
  emit('updateUserInfo');
  curModifyItem.value = '';
  message.success('修改成功');
};

const handleCancelEdit = () => {
  curModifyItem.value = '';
  safeForm.verifyCode = '';
  safeForm.code = '';
  safeForm.codeId = '';
};

const dbUserInfo = useUserStore();

const hasPhoneProvider =
  dbUserInfo.userInfo?.loginApplication?.providerItems.filter(
    (el: any) => el.type === 'SMS',
  ).length !== 0;

const hasEmailProvider =
  dbUserInfo.userInfo?.loginApplication?.providerItems.filter(
    (el: any) => el.type === 'Email',
  ).length !== 0;

const captchaProvider = dbUserInfo.userInfo?.loginApplication?.providers.find(
  (el: any) => el.type === 'Captcha',
);

const resendCode = async (captchaInfo: any, captchaCode: string) => {
  const { mfaEnableId } = await sendVerificationCodeApi({
    destination:
      curModifyItem.value === 'Email' ? safeForm.email : safeForm.phone,
    authType: curModifyItem.value === 'Phone' ? 'SMS' : curModifyItem.value,
    captchaId: captchaInfo.captchaId,
    captchaCode,
  });

  safeForm.codeId = mfaEnableId;
  message.success('成功发送');
};

const safeItems = [
  {
    label: '手机号',
    value: 'Phone',
  },
  {
    label: '邮件',
    value: 'Email',
  },
  {
    label: '密码',
    value: 'Password',
  },
];

const mfaItems = [
  {
    label: 'TOTP',
    value: 'TOTP',
    infoField: 'enableTotpMfa',
  },
  {
    label: '邮件',
    value: 'Email',
    infoField: 'enableEmailMfa',
  },
  {
    label: '短信',
    value: 'SMS',
    infoField: 'enablePhoneMfa',
  },
];
</script>
<template>
  <NFlex class="m-6" vertical>
    <NModal
      preset="dialog"
      v-model:show="showVerifyModal"
      title="用户验证"
      @close="curModifyItem = ''"
    >
      <VerifyUserPanel
        :type="curModifyItem"
        @after-verify-user="handleDisableMfa"
      />
    </NModal>
    <NH2>密码安保</NH2>
    <template v-for="(item, idx) in safeItems" :key="idx">
      <NThing>
        <template #header>
          <NH3 strong>{{ item.label }}</NH3>
        </template>
        <template #header-extra>
          <NButton
            v-if="curModifyItem !== item.value"
            type="primary"
            @click="((curModifyItem = item.value), (showVerifyModal = true))"
          >
            设置
          </NButton>
        </template>
        <template #description>
          <template v-if="curModifyItem === item.value && !showVerifyModal">
            <NCard class="m-2">
              <SendCode
                v-if="item.value === 'Phone'"
                type="SMS"
                v-model:value="safeForm.phone"
                v-model:code="safeForm.code"
                :resend="resendCode"
                :application-id="userinfo.loginApplication"
                :captcha-provider="captchaProvider"
                :disable-code-input="!hasPhoneProvider"
              />
              <SendCode
                v-if="item.value === 'Email'"
                type="Email"
                :disable-code-input="!hasEmailProvider"
                v-model:value="safeForm.email"
                v-model:code="safeForm.code"
                :application-id="userinfo.loginApplication"
                :captcha-provider="captchaProvider"
                :resend="resendCode"
              />
              <template v-if="item.value === 'Password'">
                <NInput
                  class="m-2"
                  type="password"
                  placeholder="请输入新密码"
                  show-password-on="mousedown"
                  v-model:value="safeForm.newPassword"
                />
                <NInput
                  class="m-2"
                  type="password"
                  placeholder="请重新输入新密码"
                  show-password-on="mousedown"
                  v-model:value="safeForm.confirmNewPassword"
                />
              </template>
              <NSpace justify="end" class="mt-4">
                <NButton
                  secondary
                  type="primary"
                  @click="handleSafeSubmit(item.value)"
                >
                  提交
                </NButton>
                <NButton secondary type="error" @click="handleCancelEdit">
                  取消
                </NButton>
              </NSpace>
            </NCard>
          </template>
          <template v-else-if="item.value !== 'Password'">
            {{
              item.value === 'Phone'
                ? userinfo.phone
                : (userinfo.email ?? '未设置')
            }}
          </template>
        </template>
      </NThing>
      <NDivider />
    </template>

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
      <NListItem v-for="(item, idx) in mfaItems" :key="idx">
        <NSpace align="center">
          <NText>{{ item.label }}</NText>
          <NTag
            type="success"
            v-if="(userinfo as Record<string, any>)[item.infoField]"
          >
            已配置
          </NTag>
          <NTag type="info" v-if="userinfo?.preferredMfaType === item.value">
            首选项
          </NTag>
        </NSpace>
        <template #suffix>
          <NButton
            v-if="!(userinfo as Record<string, any>)[item.infoField]"
            secondary
            type="primary"
            @click="
              router.push({
                name: 'EnableMfa',
                params: { mfaType: item.value },
              })
            "
          >
            启用
          </NButton>
          <NSpace v-else style="width: max-content">
            <NButton
              v-if="userInfo?.preferredMfaType !== item.value"
              secondary
              type="info"
              @click="handleSetPrefered(item.value)"
            >
              设为首选
            </NButton>
            <NButton
              secondary
              type="error"
              @click="
                ((showVerifyModal = true),
                (curDisableMfa = item.value),
                (curModifyItem = 'MFA'))
              "
            >
              关闭
            </NButton>
          </NSpace>
        </template>
      </NListItem>
    </NList>
  </NFlex>
</template>
