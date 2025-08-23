<script setup lang="tsx">
import type { UploadFileInfo } from 'naive-ui';

import { ref } from 'vue';
import { VueCropper } from 'vue-cropper';
import 'vue-cropper/dist/index.css';

import { preferences } from '@vben/preferences';

import {
  NAvatar,
  NButton,
  NCard,
  NForm,
  NFormItem,
  NInput,
  NModal,
  NSpace,
  NSwitch,
  NTag,
  NUpload,
} from 'naive-ui';

import { message } from '#/adapter/naive';
import { updateUserAvatarApi } from '#/api';
import { useAuthStore } from '#/store';

defineOptions({ name: 'EditBasicInfo' });

const props = defineProps(['inheritRoles', 'groups']);
const emit = defineEmits(['updateUserInfo']);

const origialAvatarFile = ref<any>();
const showCropper = ref(false);

const option = {
  size: 1,
  outputType: 'webp',
};

const cropperRef = ref();

const avatarFileList = ref<UploadFileInfo[]>([]);

const authStore = useAuthStore();

interface UserBasicInfo {
  email?: string;
  phone?: string;
  roles?: Array<string>;
  groupId?: number;
  id?: string;
  name?: string;
  isAdmin?: boolean;
  avatar?: string;
}

const handleChange = async (options: { fileList: UploadFileInfo[] }) => {
  const reader = new FileReader();
  reader.readAsDataURL(options.fileList[0]?.file as any);
  reader.addEventListener('load', () => {
    origialAvatarFile.value = reader.result;
    showCropper.value = true;
  });
};

const handleChangeAvatar = () => {
  cropperRef.value.getCropBlob((data: Blob) => {
    const file = new File([data], 'avatar.webp', {
      type: 'image/webp',
    });

    updateUserAvatarApi(file).then(() => {
      message.success('头像更新成功');
      showCropper.value = false;
      avatarFileList.value = [];

      authStore.fetchUserInfo();
      emit('updateUserInfo');
    });
  });
};

const userinfo = defineModel<UserBasicInfo>('userInfo', { default: {} });
</script>
<template>
  <div>
    <NForm class="m-6" label-placement="left" label-width="90">
      <NFormItem label="头像">
        <NSpace>
          <NAvatar
            :size="96"
            :src="userinfo.avatar ?? preferences.app.defaultAvatar"
          />
          <NUpload
            accept="image/png, image/jpeg, image/webp"
            :max="1"
            v-model:file-list="avatarFileList"
            list-type="image-card"
            :default-upload="false"
            @before-upload="(options: {file: UploadFileInfo}) => {
              if ((options.file?.file?.size ?? 0) > 1024 * 1024 * 2) {
                message.error('头像大小不能超过2MB');
                return false;
              }
              return true;
            }"
            @change="handleChange"
          >
            上传头像
          </NUpload>
        </NSpace>
      </NFormItem>
      <NFormItem label="ID">
        <NInput disabled v-model:value="userinfo.id" />
      </NFormItem>
      <NFormItem label="姓名">
        <NInput v-model:value="userinfo.name" />
      </NFormItem>
      <NFormItem label="管理员">
        <NSwitch disabled v-model:value="userinfo.isAdmin" />
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
    <NModal
      :show="showCropper"
      @close="((showCropper = false), (avatarFileList = []))"
      style="width: 600px; height: 500px"
    >
      <NCard style="width: 600px" title="修改头像" :bordered="false">
        <VueCropper
          ref="cropperRef"
          v-if="origialAvatarFile"
          :can-scale="false"
          fixed
          :fixed-number="[1, 1]"
          :img="origialAvatarFile"
          :output-size="option.size"
          :output-type="option.outputType"
          auto-crop
          :can-move="false"
        />
        <template #footer>
          <NSpace justify="end">
            <NButton type="primary" @click="handleChangeAvatar"> 确认 </NButton>
            <NButton @click="((showCropper = false), (avatarFileList = []))">
              取消
            </NButton>
          </NSpace>
        </template>
      </NCard>
    </NModal>
  </div>
</template>
