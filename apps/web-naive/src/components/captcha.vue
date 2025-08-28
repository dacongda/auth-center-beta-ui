<script setup lang="tsx">
import { onMounted, ref } from 'vue';

import { usePreferences } from '@vben/preferences';

import { NFlex, NModal, NSpin } from 'naive-ui';

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

const preference = usePreferences();

const captchaInstance = ref();
const authCallback = ref();
const authCallbackParams = ref();
const captchaImg = ref();

const captchaLoading = ref(true);

const showDefaultCaptchaModal = ref(false);

const divId = `c${Date.now()}`;
const divIdModal = `c${Date.now()}re`;

const onModalShowed = ref();

const showPopupCaptcha = (func: Function, params: any) => {
  switch (provider.subType) {
    case 'Aliyun': {
      if (captchaInstance.value) {
        captchaInstance.value?.show();
      } else {
        recreateCaptchaInstance().then(() => {
          captchaInstance.value?.show();
        });
      }

      break;
    }
    case 'Cloudflare':
    case 'HCaptcha':
    case 'ReCaptchaV2': {
      showDefaultCaptchaModal.value = true;
      onModalShowed.value = recreateCaptchaInstance;
      break;
    }
    case 'TencentTsec': {
      recreateCaptchaInstance();
      break;
    }
    default: {
      showDefaultCaptchaModal.value = true;
      captchaLoading.value = false;
      refetchCaptcha();
    }
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
  captchaLoading.value = true;
  switch (provider?.subType) {
    case 'Aliyun': {
      // Aliyun
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
          captchaLoading.value = false;
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
    case 'Cloudflare': {
      const callback = () => {
        (window as any).turnstile.render(`#${divIdModal}`, {
          sitekey: provider?.clientId,
          theme: preference.isDark ? 'dark' : 'light',
          size: 'flexible',
          callback: (res: any) => {
            captchaId.value = '-';
            value.value = res;
            if (authCallbackParams.value) {
              authCallbackParams.value.code = res;
            }
            authCallback.value(authCallbackParams.value ?? {}, true);
            showDefaultCaptchaModal.value = false;
          },
        });
        captchaLoading.value = false;
      };

      if ((window as any).turnstile) {
        callback();
      } else {
        loadScript(
          `https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit`,
        ).then(() => {
          return callback();
        });
      }

      break;
    }
    case 'HCaptcha': {
      // HCaptcha
      const callback = () => {
        const widgetId = (window as any).hcaptcha.render(divIdModal, {
          sitekey: provider?.clientId,
          theme: preference.isDark ? 'dark' : 'light',
        });
        (window as any).hcaptcha
          .execute(widgetId, { async: true })
          .then((res: any) => {
            captchaId.value = res?.key;
            value.value = res?.response;
            if (authCallbackParams.value) {
              authCallbackParams.value.code = res?.response;
            }
            authCallback.value(authCallbackParams.value ?? {}, true);
            showDefaultCaptchaModal.value = false;
          });
        captchaLoading.value = false;
      };
      if ((window as any).hcaptcha) {
        callback();
      } else {
        loadScript(`https://js.hcaptcha.com/1/api.js`).then(() => {
          return callback();
        });
      }

      break;
    }
    case 'ReCaptchaV2': {
      // ReCaptcha
      const callback = () => {
        (window as any).grecaptcha.render(divIdModal, {
          sitekey: provider?.clientId,
          theme: preference.isDark ? 'dark' : 'light',
          callback: (response: any) => {
            captchaId.value = '-';
            value.value = response;
            if (authCallbackParams.value) {
              authCallbackParams.value.code = response;
            }
            authCallback.value(authCallbackParams.value ?? {}, true);
            showDefaultCaptchaModal.value = false;
          },
        });
        captchaLoading.value = false;
      };
      if ((window as any).grecaptcha) {
        (window as any).grecaptcha.ready(callback);
      } else {
        loadScript(`https://www.google.com/recaptcha/api.js`).then(() => {
          return (window as any).grecaptcha.ready(callback);
        });
      }

      break;
    }
    case 'TencentTsec': {
      // Tencent T-sec
      const callback = () => {
        const captcha = new (window as any).TencentCaptcha(
          provider?.authEndpoint,
          (res: any) => {
            captchaId.value = res?.randstr;
            value.value = res?.ticket;
            if (authCallbackParams.value) {
              authCallbackParams.value.code = res?.ticket;
              authCallbackParams.value.captchaId = res?.randstr;
            }
            authCallback.value(authCallbackParams.value ?? {}, true);
            // showDefaultCaptchaModal.value = false;
          },
          {
            enableDarkMode: true,
          },
        );
        captcha.show();
        captchaLoading.value = false;
      };
      if ((window as any).TencentCaptcha) {
        callback();
      } else {
        loadScript(`https://turing.captcha.qcloud.com/TJCaptcha.js`).then(
          callback,
        );
      }

      break;
    }
    default: {
      captchaLoading.value = false;
    }
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
  <div class="w-full text-center">
    <div :id="divId"></div>
    <NModal
      v-model:show="showDefaultCaptchaModal"
      preset="dialog"
      title="验证码"
      @after-enter="onModalShowed"
      :positive-text="provider?.subType === 'Default' ? '确认' : undefined"
      @positive-click="
        () => {
          authCallbackParams.code = value;
          authCallback(authCallbackParams, true);
        }
      "
    >
      <div>
        <NFlex v-if="provider?.subType === 'Default'" style="flex-flow: row">
          <Input v-model:model-value="value" :placeholder="placeholder" />
          <img
            @click="refetchCaptcha"
            :src="captchaImg"
            style="max-width: 120px; height: 2.5rem"
          />
        </NFlex>
        <NSpin v-if="captchaLoading" size="large" />
        <div :id="divIdModal"></div>
      </div>
    </NModal>
  </div>
</template>
