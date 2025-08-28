<script setup lang="tsx">
import { onMounted, ref } from 'vue';

import { NFlex, NModal } from 'naive-ui';

import { getCaptcha } from '#/api/core/captcha';
import { loadScript } from '#/utils/captcha';

import { Input } from '../../../../packages/@core/ui-kit/shadcn-ui/src/ui';

const { provider, applicationId, placeholder } = defineProps([
  'provider',
  'applicationId',
  'placeholder',
]);

const value = defineModel<string>('value');
const captchaId = defineModel<string>('captchaId');

const captchaInstance = ref();
const authCallback = ref();
const authCallbackParams = ref();
const captchaImg = ref();

const showDefaultCaptchaModal = ref(false);

const divId = `c${Date.now()}`;

const showPopupCaptcha = (func: Function, params: any) => {
  if (provider.subType === 'Aliyun') {
    if (captchaInstance.value) {
      captchaInstance.value?.show();
    } else {
      recreateCaptchaInstance().then(() => {
        captchaInstance.value?.show();
      });
    }
  } else {
    showDefaultCaptchaModal.value = true;
  }

  authCallback.value = func;
  authCallbackParams.value = params;
};

const refetchCaptcha = async () => {
  if (provider.subType === 'Aliyun') {
    captchaInstance.value.refresh();
  } else if (provider.subType === 'Default') {
    const info = await getCaptcha({
      applicationId,
    });

    captchaId.value = info.captchaId;
    value.value = '';
    captchaImg.value = `data:image/bmp;base64,${info.captchaImg}`;
  }
};

defineExpose({ showPopupCaptcha, refetchCaptcha });

const recreateCaptchaInstance = () => {
  if (provider?.subType === 'Aliyun') {
    const aliyunParmas = {
      SceneId: provider?.sceneId,
      mode: 'popup',
      element: `#${divId}`,
      success(captchaVerifyParam: any) {
        captchaId.value = '-';
        value.value = captchaVerifyParam;
        if (authCallbackParams.value) {
          authCallbackParams.value.code = captchaVerifyParam;
        }
        authCallback.value(authCallbackParams.value ?? {}, true);
      },
      fail(result: any) {
        window.console.error(result);
      },
      getInstance(instance: any) {
        captchaInstance.value = instance;
        window.console.log(instance);
      },
      slideStyle: {
        width: 360,
        height: 40,
      },
    };
    if ((window as any).initAliyunCaptcha) {
      return (window as any).initAliyunCaptcha(aliyunParmas);
    }
    return loadScript(
      'https://o.alicdn.com/captcha-frontend/aliyunCaptcha/AliyunCaptcha.js',
    ).then(() => {
      return (window as any).initAliyunCaptcha(aliyunParmas);
    });
  }
};

onMounted(() => {
  if (provider?.subType === 'Aliyun') {
    (window as any).AliyunCaptchaConfig = {
      region: 'cn',
      prefix: provider?.authEndpoint,
    };
  } else if (provider?.subType === 'Default') {
    refetchCaptcha();
  }
});
</script>
<template>
  <div class="w-full">
    <div :id="divId"></div>
    <NModal
      v-model:show="showDefaultCaptchaModal"
      preset="dialog"
      title="验证码"
      positive-text="确认"
      @positive-click="
        () => {
          authCallbackParams.code = value;
          authCallback(authCallbackParams, true);
        }
      "
    >
      <NFlex v-if="provider?.subType === 'Default'" style="flex-flow: row">
        <Input v-model:model-value="value" :placeholder="placeholder" />
        <img
          @click="refetchCaptcha"
          :src="captchaImg"
          style="max-width: 120px; height: 2.5rem"
        />
      </NFlex>
    </NModal>
  </div>
</template>
