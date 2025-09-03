<script lang="tsx" setup>
import type { SelectOption } from 'naive-ui';

import type { Application, ApplicationForm } from './application-data';

import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';
import {
  MaterialSymbolsContentCopy,
  MaterialSymbolsDownload,
} from '@vben/icons';
import { preferencesManager } from '@vben/preferences';

import {
  NButton,
  NCard,
  NColorPicker,
  NConfigProvider,
  NDynamicInput,
  NForm,
  NFormItem,
  NGrid,
  NGridItem,
  NInput,
  NInputGroup,
  NInputNumber,
  NPopconfirm,
  NSelect,
  NSlider,
  NSpace,
  NSwitch,
  NTabPane,
  NTabs,
  NTag,
  NTreeSelect,
} from 'naive-ui';

import { message } from '#/adapter/naive';
import {
  addApplicationApi,
  getApplicationApi,
  updateApplicationApi,
} from '#/api/core/application';
import { getCertsApi } from '#/api/core/cert';
import { getGroupTreeApi } from '#/api/core/group';
import { getProvidersApi } from '#/api/core/provider';
import Login from '#/views/_core/authentication/login.vue';

import { loginMethod, providerRule } from './application-data';
import LoginFormSetting from './components/login-form-setting.vue';
import SiderBar from './icon/sider-bar.vue';

const route = useRoute();
const router = useRouter();
const id = route.params?.id;

const certList = ref<any>([]);
const providerList = ref<any>([]);
const groupTree = ref<any>([]);

const samlLinkGroupId = ref<any>(null);

const preference = preferencesManager.getPreferences();

const appFormValue = reactive<ApplicationForm>({
  value: {
    id: 0,
    name: '',
    logoUrl: '/AuthCenterLogo.svg',
    logoDarkUrl: '/AuthCenterWideDarkLogo.svg',
    faviconUrl: '/AuthCenterWideLogo.svg',
    enableAuthorizeConfirm: false,
    clientId: '',
    clientSecret: '',
    failLoginLimit: 5,
    failLoginForzenMinute: 15,
    redirectUrls: [],
    scopes: [],
    expiredSecond: 168 * 3600,
    accessExpiredSecond: 300,
    certId: null,
    providerItems: [],
    loginMethods: [
      { name: 'password', rules: '' },
      { name: 'code', rules: 'all' },
      { name: 'passkey', rules: '' },
    ],
    loginFormSetting: {
      loginPanel: { style: '', rule: 'right', visible: true },
      loginBackground: { style: '', rule: '', visible: true },
      formLogo: { style: '', rule: 'all', visible: true },
      input: { style: '', rule: '', visible: true },
      loginButton: { style: '', rule: '', visible: true },
      thirdPartLogin: { style: '', rule: '', visible: true },
    },
    theme: {
      primaryColor: preference.theme.colorPrimary.replaceAll(' ', ', '),
      radius: preference.theme.radius,
    },
  },
});
const valJsonStr = ref('');

onMounted(async () => {
  if (id) {
    getApplicationApi({ id }).then((res: Application) => {
      if (!res.theme) {
        res.theme = {
          primaryColor: preference.theme.colorPrimary.replaceAll(' ', ', '),
          radius: preference.theme.radius,
        };
      }

      appFormValue.value = res;
      valJsonStr.value = JSON.stringify(res);
    });
  }

  if (route.name === 'AddApplication') {
    appFormValue.value.clientId = crypto.randomUUID().replaceAll('-', '');
    appFormValue.value.clientSecret = crypto.randomUUID().replaceAll('-', '');
  }

  getGroupTreeApi().then((res) => {
    groupTree.value = res.map((el: any) => {
      return {
        name: el.name,
        id: el.id,
      };
    });
  });

  getProvidersApi({}).then((res: any) => {
    providerList.value = res;
  });

  certList.value = await getCertsApi();
});

const onSubmit = () => {
  if (id) {
    appFormValue.value.id = id.toString();
    updateApplicationApi(appFormValue.value).then(() =>
      message.success('成功'),
    );
  } else {
    addApplicationApi(appFormValue.value).then(() => {
      message.success('成功');
      router.push({ name: 'Applications' });
    });
  }
};

const onReset = () => {
  appFormValue.value = JSON.parse(valJsonStr.value);
};

const appFormRef = ref();

const handelCopy = (field: string) => {
  if (field === 'oidc link') {
    const val = `${window.location.origin}/.well-known/openid-configuration`;
    navigator.clipboard.writeText(val);
  } else if (field === 'saml link') {
    if (!samlLinkGroupId.value) {
      message.error('请先选择群组');
      return;
    }
    let val = `${window.location.origin}/api/saml/metadata/${appFormValue.value.clientId}`;
    if (samlLinkGroupId.value) {
      val += `-${samlLinkGroupId.value}`;
    }
    navigator.clipboard.writeText(val);
  } else {
    navigator.clipboard.writeText(
      appFormValue.value[field as keyof Application] || '',
    );
  }
  message.success(`${field} 已复制到剪贴板`);
};

const handleRegenerate = (field: keyof Application) => {
  appFormValue.value[field] = crypto.randomUUID().replaceAll('-', '');
};

const renderCertLabel = (option: SelectOption, _: boolean) => {
  return (
    <div>
      {`${option.name} `}
      <NTag type="success">{option?.cryptoAlgorithm}</NTag>
    </div>
  );
};

const handleProvierItemUpdate = (value: any, index: number) => {
  if (
    providerListOptions.value.some(
      (el: any) => el.value === value && el.disabled,
    )
  ) {
    return;
  }

  const provider = providerList.value?.find((el: any) => el.id === value);
  appFormValue.value.providerItems[index].type = provider?.type;
  appFormValue.value.providerItems[index].providerId = value;
  appFormValue.value.providerItems[index].rule = [];
};

const downloadLink = () => {
  let val = `${window.location.origin}/api/saml/metadata/${appFormValue.value.clientId}`;
  if (samlLinkGroupId.value) {
    val += `-${samlLinkGroupId.value}`;
  } else {
    message.error('请先选择群组');
    return;
  }
  fetch(val)
    .then((response) => response.blob())
    .then((blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'metadata.xml');
      document.body.append(link);
      link.click();
    })
    .catch((error) => {
      message.error(`下载失败: ${error.message}`);
    });
};

const samlLink = computed(() => {
  return `${window.location.origin}/api/saml/metadata/${appFormValue.value.clientId}`;
});
const oidcLink = `${window.location.origin}/.well-known/openid-configuration`;
const oauthLoginLink = computed(
  () => `${window.location.origin}/auth/login/${samlLinkGroupId.value}`,
);
const casLinkGroup = computed(() => {
  return {
    login: `${window.location.origin}/auth/login-cas/${appFormValue.value.clientId}-${samlLinkGroupId.value}`,
    logout: `${window.location.origin}/auth/logout`,
    validate: `${window.location.origin}/cas/${samlLinkGroupId.value}/${appFormValue.value.clientId}/validate`,
    serviceValidate: `${window.location.origin}/cas/${samlLinkGroupId.value}/${appFormValue.value.clientId}/serviceValidate`,
    proxyValidate: `${window.location.origin}/cas/${samlLinkGroupId.value}/${appFormValue.value.clientId}/proxyValidate`,
    proxy: `${window.location.origin}/cas/${samlLinkGroupId.value}/${appFormValue.value.clientId}/proxy`,
    samlValidate: `${window.location.origin}/cas/${samlLinkGroupId.value}/${appFormValue.value.clientId}/samlValidate`,
  };
});

const getProviderRules = (id: any) => {
  const provider = providerList.value.find((el: any) => el.id === id);

  if (!providerRule[provider?.type]) {
    return [];
  }
  if (!providerRule[provider?.type][provider?.subType]) {
    return [];
  }

  return providerRule[provider.type][provider.subType];
};

const providerListOptions = computed(() => {
  return providerList.value.map((el: any) => {
    return {
      label: `${el.name} (${el.type})`,
      value: el.id,
      type: el.type,
      disabled: appFormValue.value.providerItems?.find(
        (pitem: any) => el.id === pitem.providerId,
      ),
    };
  });
});

const loginMethodListOptions = computed(() => {
  const keys = Object.keys(loginMethod);
  return keys.map((k) => {
    return {
      label: loginMethod[k].label,
      value: k,
      disabled: appFormValue.value?.loginMethods?.some(
        (lm: any) => lm.name === k,
      ),
    };
  });
});

const accessGroupOptions = computed(() => {
  return groupTree.value.map((el: any) => {
    const name = groupTree.value.find((g: any) => g.id === el.id)?.name;
    return {
      label: name,
      value: name,
    };
  });
});

const previewApplication = computed(() => {
  const previewApp = appFormValue.value;
  const piIds = new Set(
    appFormValue.value.providerItems.map((el: any) => el.providerId),
  );
  previewApp.providers = providerList.value.filter((el: any) =>
    piIds.has(el.id),
  );
  return previewApp;
});
</script>
<template>
  <Page :title="route.name === 'AddApplication' ? '新增应用' : '编辑应用'">
    <template #extra>
      <NButton @click="router.go(-1)"> 返回上一页 </NButton>
    </template>
    <NGrid item-responsive cols="8" responsive="screen">
      <NGridItem span="8 m:8 l:6" offset="0 m:0 l:1">
        <NCard>
          <NForm ref="appFormRef" label-placement="left" label-width="150">
            <NTabs type="line" animated>
              <!-- Basic info -->
              <NTabPane name="basicSetting" tab="基础信息">
                <NFormItem label="应用名">
                  <NInput v-model:value="appFormValue.value.name" />
                </NFormItem>
                <NFormItem label="显示名">
                  <NInput v-model:value="appFormValue.value.displayName" />
                </NFormItem>
                <NFormItem label="缩略图">
                  <NInput v-model:value="appFormValue.value.faviconUrl" />
                </NFormItem>
                <NFormItem label="缩略图预览">
                  <img
                    style="height: 50px"
                    :src="appFormValue.value.faviconUrl"
                  />
                </NFormItem>
                <NFormItem label="Logo图">
                  <NInput v-model:value="appFormValue.value.logoUrl" />
                </NFormItem>
                <NFormItem label="Logo图预览">
                  <img style="height: 50px" :src="appFormValue.value.logoUrl" />
                </NFormItem>
                <NFormItem label="深色Logo图">
                  <NInput v-model:value="appFormValue.value.logoDarkUrl" />
                </NFormItem>
                <NFormItem label="深色Logo图预览">
                  <img
                    style="height: 50px"
                    :src="appFormValue.value.logoDarkUrl"
                  />
                </NFormItem>
                <NFormItem label="可用群组">
                  <NTreeSelect
                    :options="groupTree"
                    multiple
                    key-field="id"
                    label-field="name"
                    children-field="children"
                    default-expand-all
                    v-model:value="appFormValue.value.groupIds"
                  />
                </NFormItem>
              </NTabPane>
              <!-- Auth info -->
              <NTabPane name="authSetting" tab="认证信息">
                <NFormItem label="Client ID">
                  <NInputGroup>
                    <NInput
                      readonly
                      v-model:value="appFormValue.value.clientId"
                    />
                    <NButton @click="handelCopy('clientId')">
                      <MaterialSymbolsContentCopy />
                    </NButton>
                    <NPopconfirm @positive-click="handleRegenerate('clientId')">
                      <template #trigger>
                        <NButton>重新生成</NButton>
                      </template>
                      是否重置client ID
                    </NPopconfirm>
                  </NInputGroup>
                </NFormItem>
                <NFormItem label="Client Secret">
                  <NInputGroup>
                    <NInput
                      readonly
                      v-model:value="appFormValue.value.clientSecret"
                    />
                    <NButton @click="handelCopy('clientSecret')">
                      <MaterialSymbolsContentCopy />
                    </NButton>
                    <NPopconfirm
                      @positive-click="handleRegenerate('clientSecret')"
                    >
                      <template #trigger>
                        <NButton>重新生成</NButton>
                      </template>
                      是否重置Client Secret
                    </NPopconfirm>
                  </NInputGroup>
                </NFormItem>
                <NFormItem label="启用授权页">
                  <NSwitch
                    v-model:value="appFormValue.value.enableAuthorizeConfirm"
                  />
                </NFormItem>
                <NFormItem label="登陆错误次数限制">
                  <NInputNumber
                    v-model:value="appFormValue.value.failLoginLimit"
                  >
                    <template #suffix> 次 </template>
                  </NInputNumber>
                </NFormItem>
                <NFormItem label="登陆重试等待">
                  <NInputNumber
                    v-model:value="appFormValue.value.failLoginForzenMinute"
                  >
                    <template #suffix> 分钟 </template>
                  </NInputNumber>
                </NFormItem>
                <NFormItem label="重定向地址">
                  <NDynamicInput
                    v-model:value="appFormValue.value.redirectUrls"
                  />
                </NFormItem>
                <NFormItem label="SAML受众">
                  <NDynamicInput
                    v-model:value="appFormValue.value.samlAudiences"
                  />
                </NFormItem>
                <NFormItem label="SAML重定向">
                  <NDynamicInput
                    v-model:value="appFormValue.value.samlRedirects"
                    :on-create="
                      () => {
                        return { issuer: '', redirectUrl: '' };
                      }
                    "
                  >
                    <template #default="{ value }">
                      <NInput
                        v-model:value="value.issuer"
                        placeholder="Issuer"
                      />
                      <NInput
                        v-model:value="value.redirectUrl"
                        placeholder="Redirect URL"
                      />
                    </template>
                  </NDynamicInput>
                </NFormItem>
                <NFormItem label="SAML属性" style="overflow: auto">
                  <NDynamicInput
                    style="min-width: 800px"
                    v-model:value="appFormValue.value.samlAttributes"
                    :on-create="
                      () => {
                        return { name: '', nameFormat: null, value: '' };
                      }
                    "
                  >
                    <template #default="{ value }">
                      <NInputGroup>
                        <NInput
                          v-model:value="value.name"
                          placeholder="name"
                          style="width: 40%"
                        />
                        <NSelect
                          style="width: 20%"
                          :options="[
                            {
                              label: 'unspecified',
                              value:
                                'urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified',
                            },
                            {
                              label: 'persistent',
                              value:
                                'urn:oasis:names:tc:SAML:2.0:nameid-format:persistent',
                            },
                            {
                              label: 'transient',
                              value:
                                'urn:oasis:names:tc:SAML:2.0:nameid-format:transient',
                            },
                            {
                              label: 'basic',
                              value:
                                'urn:oasis:names:tc:SAML:2.0:attrname-format:basic',
                            },
                            {
                              label: 'uri',
                              value:
                                'urn:oasis:names:tc:SAML:2.0:attrname-format:uri',
                            },
                          ]"
                          v-model:value="value.nameFormat"
                          placeholder="nameFormat"
                        />
                        <NInput
                          v-model:value="value.value"
                          placeholder="value"
                          style="width: 40%"
                        />
                      </NInputGroup>
                    </template>
                  </NDynamicInput>
                </NFormItem>
                <NFormItem label="Scopes">
                  <NSelect
                    :options="[
                      {
                        label: 'email',
                        value: 'email',
                      },
                      {
                        label: 'phone',
                        value: 'phone',
                      },
                      {
                        label: 'profile',
                        value: 'profile',
                      },
                    ]"
                    multiple
                    tag
                    v-model:value="appFormValue.value.scopes"
                  />
                </NFormItem>
                <NFormItem label="Token过期时间">
                  <NInputNumber
                    :format="(value: null | number) => {
                  return ((value ?? 0) / 3600).toString();
                }"
                    :parse="(value: string) => {
                  return Number.parseInt(value) * 3600;
                }"
                    v-model:value="appFormValue.value.expiredSecond"
                    :default-value="168 * 3600"
                    :step="3600"
                  >
                    <template #suffix> 小时 </template>
                  </NInputNumber>
                </NFormItem>
                <NFormItem label="Access过期时间">
                  <NInputNumber
                    :format="(value: null | number) => {
                  return ((value ?? 0) / 60).toString();
                }"
                    :parse="(value: string) => {
                  return Number.parseInt(value) * 60;
                }"
                    v-model:value="appFormValue.value.accessExpiredSecond"
                    :default-value="2 * 60"
                    :step="60"
                  >
                    <template #suffix> 分钟 </template>
                  </NInputNumber>
                </NFormItem>
                <NFormItem label="SAML响应压缩">
                  <NSwitch
                    v-model:value="appFormValue.value.samlResponseCompress"
                  />
                </NFormItem>
                <NFormItem label="SAML数据加密">
                  <NSwitch v-model:value="appFormValue.value.samlEncrypt" />
                </NFormItem>
                <NFormItem label="签名证书">
                  <NSelect
                    :options="certList"
                    value-field="id"
                    label-field="name"
                    v-model:value="appFormValue.value.certId"
                    :render-label="renderCertLabel"
                    remote
                  />
                </NFormItem>
              </NTabPane>
              <!-- Auth link -->
              <NTabPane name="authLinke" tab="认证链接">
                <NFormItem label="登入群组">
                  <NSelect
                    style="width: 200px"
                    :options="accessGroupOptions"
                    placeholder="请选择"
                    v-model:value="samlLinkGroupId"
                  />
                </NFormItem>
                <NFormItem label="OAuth登陆链接">
                  <NInput readonly :value="oauthLoginLink" />
                </NFormItem>
                <NFormItem label="Discovery链接">
                  <NInputGroup>
                    <NInput readonly :value="oidcLink" />
                    <NButton @click="handelCopy('oidc link')">
                      <MaterialSymbolsContentCopy />
                    </NButton>
                  </NInputGroup>
                </NFormItem>
                <NFormItem label="SAML元数据">
                  <NInputGroup>
                    <NInput
                      readonly
                      :value="`${samlLink}-${samlLinkGroupId}`"
                    />
                    <NButton @click="handelCopy('saml link')">
                      <MaterialSymbolsContentCopy />
                    </NButton>
                    <NButton @click="downloadLink">
                      <MaterialSymbolsDownload />
                    </NButton>
                  </NInputGroup>
                </NFormItem>
                <NFormItem label="CAS登陆">
                  <NInput readonly :value="casLinkGroup.login" />
                </NFormItem>
                <NFormItem label="CAS注销">
                  <NInput readonly :value="casLinkGroup.logout" />
                </NFormItem>
                <NFormItem label="CAS validate">
                  <NInput readonly :value="casLinkGroup.validate" />
                </NFormItem>
                <NFormItem label="CAS serviceValidate">
                  <NInput readonly :value="casLinkGroup.serviceValidate" />
                </NFormItem>
                <NFormItem label="CAS Proxy validate">
                  <NInput readonly :value="casLinkGroup.proxyValidate" />
                </NFormItem>
                <NFormItem label="CAS Proxy">
                  <NInput readonly :value="casLinkGroup.proxy" />
                </NFormItem>
                <NFormItem label="CAS SAML validate">
                  <NInput readonly :value="casLinkGroup.samlValidate" />
                </NFormItem>
              </NTabPane>
              <!-- Provider and login form -->
              <NTabPane name="providerAndForm" tab="提供商与表单">
                <NFormItem label="登陆方式" style="overflow: auto">
                  <NDynamicInput
                    style="min-width: 800px"
                    show-sort-button
                    v-model:value="appFormValue.value.loginMethods"
                    :on-create="
                      () => {
                        return { name: null, display: '', rule: '' };
                      }
                    "
                  >
                    <template #default="{ value }">
                      <NSelect
                        placeholder="请选择方式"
                        :options="loginMethodListOptions"
                        v-model:value="value.name"
                      />
                      <NSelect
                        v-if="loginMethod[value.name]?.rule"
                        :options="loginMethod[value.name]?.rule ?? []"
                        placeholder="请选择规则"
                        v-model:value="value.rule"
                      />
                    </template>
                  </NDynamicInput>
                </NFormItem>
                <NFormItem label="登陆表单">
                  <LoginFormSetting
                    v-model:value="appFormValue.value.loginFormSetting"
                  />
                </NFormItem>
                <NFormItem label="登陆表单预览">
                  <NCard style="max-width: 600px">
                    <Login
                      style="pointer-events: none"
                      :is-preview="true"
                      :preview-application="previewApplication"
                      :preview-group-name="samlLinkGroupId"
                    />
                  </NCard>
                </NFormItem>
                <NFormItem label="提供商列表" style="overflow: auto">
                  <NDynamicInput
                    style="min-width: 800px"
                    v-model:value="appFormValue.value.providerItems"
                    show-sort-button
                    :on-create="
                      () => {
                        return { providerId: null, type: '', rule: [] };
                      }
                    "
                  >
                    <template #default="{ value, index }">
                      <NSelect
                        style="width: 40%"
                        :options="providerListOptions"
                        placeholder="请选择提供商"
                        v-model:value="value.providerId"
                        :on-update:value="
                      (val :any) => {return handleProvierItemUpdate(val, index)}
                    "
                      />
                      <NInput
                        style="width: 20%"
                        disabled
                        placeholder="类型"
                        v-model:value="value.type"
                      />
                      <NSelect
                        style="width: 40%"
                        :multiple="getProviderRules(value.providerId).multiple"
                        :options="getProviderRules(value.providerId).options"
                        placeholder="请选择规则"
                        :value="
                          getProviderRules(value.providerId).multiple
                            ? value.rule
                            : value.rule[0]
                        "
                        @update:value="
                      (val: any) => {
                        value.rule = getProviderRules(value.providerId).multiple ? val : [val];
                      }"
                      />
                    </template>
                  </NDynamicInput>
                </NFormItem>
              </NTabPane>
              <!-- Theme and custom -->
              <NTabPane name="themeAndCustom" tab="主题与个性化">
                <NFormItem label="主题色">
                  <NColorPicker
                    style="width: 200px"
                    v-model:value="appFormValue.value.theme.primaryColor"
                    :show-alpha="false"
                    :modes="['hsl']"
                  />
                </NFormItem>
                <NFormItem label="圆角尺寸">
                  <NSlider
                    :value="parseFloat(appFormValue.value.theme.radius) * 100"
                    :format-tooltip="(value: number) => `${value / 100} rem`"
                    @update:value="
                      (val) => {
                        appFormValue.value.theme.radius = (
                          val / 100
                        ).toString();
                      }
                    "
                    :step="10"
                  />
                </NFormItem>
                <NFormItem label="应用主题预览">
                  <NConfigProvider
                    :theme-overrides="{
                      common: {
                        primaryColor: appFormValue.value.theme.primaryColor,
                        borderRadius: `${appFormValue.value.theme.radius}rem`,
                      },
                    }"
                  >
                    <SiderBar :color="appFormValue.value.theme.primaryColor" />
                    <NButton class="mt-2" type="primary"> 按钮预览 </NButton>
                  </NConfigProvider>
                </NFormItem>
              </NTabPane>
            </NTabs>
            <NFormItem label=" ">
              <NSpace class="w-full" reverse>
                <NButton type="primary" @click="onSubmit">提交</NButton>
                <NButton @click="onReset">重置</NButton>
              </NSpace>
            </NFormItem>
          </NForm>
        </NCard>
      </NGridItem>
    </NGrid>
  </Page>
</template>
