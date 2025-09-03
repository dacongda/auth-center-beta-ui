<script setup lang="ts">
import type { ToolbarType } from './types';

import { preferences, usePreferences } from '@vben/preferences';

import { Copyright } from '../basic/copyright';
import AuthenticationFormView from './form.vue';
import Toolbar from './toolbar.vue';

interface Props {
  appName?: string;
  logo?: string;
  favicon?: string;
  pageTitle?: string;
  pageDescription?: string;
  sloganImage?: string;
  toolbar?: boolean;
  copyright?: boolean;
  toolbarList?: ToolbarType[];
  clickLogo?: () => void;
}

withDefaults(defineProps<Props>(), {
  appName: '',
  copyright: false,
  logo: '',
  favicon: '',
  pageDescription: '',
  pageTitle: '',
  sloganImage: '',
  toolbar: true,
  toolbarList: () => ['language', 'theme'],
  clickLogo: () => {},
});

const { authPanelCenter, authPanelLeft, authPanelRight, isDark } =
  usePreferences();
</script>

<template>
  <div
    :class="[
      isDark ? 'dark' : '',
      !preferences.app?.authBackgroundStyle ? 'login-background' : null,
    ]"
    :style="preferences.app?.authBackgroundStyle"
    class="flex min-h-full flex-1 select-none overflow-x-hidden"
  >
    <div class="flex min-h-full flex-1 select-none overflow-x-hidden">
      <template v-if="toolbar">
        <slot name="toolbar">
          <Toolbar :toolbar-list="toolbarList" />
        </slot>
      </template>
      <!-- 左侧认证面板 -->
      <AuthenticationFormView
        v-if="authPanelLeft"
        :style="preferences.app.authPanelStyle ?? ''"
        transition-name="slide-left"
      >
        <template v-if="copyright" #copyright>
          <slot name="copyright">
            <Copyright
              v-if="preferences.copyright.enable"
              v-bind="preferences.copyright"
            />
          </slot>
        </template>
      </AuthenticationFormView>

      <slot name="logo">
        <!-- 头部 Logo 和应用名称 -->
        <div
          v-if="logo || appName"
          class="absolute left-0 top-0 z-10 flex flex-1"
          @click="clickLogo"
        >
          <div
            class="text-foreground lg:text-foreground ml-4 mt-4 flex flex-1 items-center sm:left-6 sm:top-6"
          >
            <img
              v-if="favicon"
              :alt="appName"
              :src="favicon"
              class="mr-2"
              width="42"
            />
            <p v-if="appName" class="m-0 text-xl font-medium">
              {{ appName }}
            </p>
          </div>
        </div>
      </slot>

      <!-- 系统介绍 -->
      <div v-if="!authPanelCenter" class="relative hidden w-0 flex-1 lg:block">
        <div class="absolute inset-0 h-full w-full">
          <div class="absolute left-0 top-0 size-full"></div>
          <div class="flex-col-center -enter-x mr-20 h-full">
            <template
              v-if="
                sloganImage && preferences.app.authPageLogoRule !== 'top-only'
              "
            >
              <img
                :alt="appName"
                :src="sloganImage"
                class="animate-float h-64 w-2/5"
              />
            </template>
            <!-- <SloganIcon v-else :alt="appName" class="animate-float h-64 w-2/5" /> -->
            <img
              v-if="preferences.app.authPageLogoRule !== 'top-only'"
              :src="favicon"
              :alt="appName"
              class="h-32 w-2/5"
            />
            <div class="text-1xl text-foreground mt-6 font-sans lg:text-2xl">
              {{ appName }}
            </div>
            <div class="dark:text-muted-foreground mt-2">
              {{ pageDescription }}
            </div>
          </div>
        </div>
      </div>

      <!-- 中心认证面板 -->
      <div v-if="authPanelCenter" class="flex-center relative w-full">
        <!-- <div class="login-background absolute left-0 top-0 size-full"></div> -->
        <AuthenticationFormView class="min-h-full w-[34%] flex-1">
          <template v-if="copyright" #copyright>
            <slot name="copyright">
              <Copyright
                v-if="preferences.copyright.enable"
                v-bind="preferences.copyright"
              />
            </slot>
          </template>
        </AuthenticationFormView>
      </div>

      <!-- 右侧认证面板 -->
      <AuthenticationFormView
        v-if="authPanelRight"
        class="min-h-full w-[34%] flex-1"
      >
        <template v-if="copyright" #copyright>
          <slot name="copyright">
            <Copyright
              v-if="preferences.copyright.enable"
              v-bind="preferences.copyright"
            />
          </slot>
        </template>
      </AuthenticationFormView>
    </div>
  </div>
</template>

<style scoped>
.login-background {
  background: linear-gradient(
    154deg,
    #07070915 30%,
    hsl(var(--primary) / 30%) 48%,
    #07070915 64%
  );
}

.dark {
  .login-background {
    background: linear-gradient(
      154deg,
      #07070915 30%,
      hsl(var(--primary) / 20%) 48%,
      #07070915 64%
    );
  }
}
</style>
