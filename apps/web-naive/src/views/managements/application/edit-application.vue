<script lang="tsx" setup>
import type { SelectOption } from 'naive-ui';

import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';
import {
  MaterialSymbolsContentCopy,
  MaterialSymbolsDownload,
} from '@vben/icons';

import {
  NButton,
  NCard,
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
  NSpace,
  NSwitch,
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

import { providerRule } from './application-data';

const route = useRoute();
const router = useRouter();
const id = route.params?.id;

const certList = ref<any>([]);
const providerList = ref<any>([]);
const groupTree = ref<any>([]);

const samlLinkGroupId = ref<any>(null);

const appFormValue: any = reactive({
  value: {
    id: null,
    name: '',
    clientId: '',
    clientSecret: '',
    redirectUrls: [],
    scopes: [],
    expiredSecond: 168 * 3600,
    certId: null,
    providerItems: [],
  },
});
const valJsonStr = ref('');

onMounted(async () => {
  if (id) {
    getApplicationApi({ id }).then((res) => {
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
    appFormValue.value.id = id;
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
    let val = `${window.location.origin}/api/saml/metadata/${appFormValue.value.clientId}`;
    if (samlLinkGroupId.value) {
      val += `-${samlLinkGroupId.value}`;
    }
    navigator.clipboard.writeText(val);
  } else {
    navigator.clipboard.writeText(appFormValue.value[field] || '');
  }
  message.success(`${field} 已复制到剪贴板`);
};

const handleRegenerate = (field: string) => {
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
  // window.console.log(value, index);
  const provider = providerList.value?.find((el: any) => el.id === value);
  // window.console.log(provider);
  appFormValue.value.providerItems[index].type = provider?.type;
  appFormValue.value.providerItems[index].providerId = value;
  appFormValue.value.providerItems[index].rule = [];
};

const downloadLink = () => {
  let val = `${window.location.origin}/api/saml/metadata/${appFormValue.value.clientId}`;
  if (samlLinkGroupId.value) {
    val += `-${samlLinkGroupId.value}`;
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
      label: el.name,
      value: el.id,
      type: el.type,
      disabled: appFormValue.value.providerItems.find(
        (pitem: any) => el.id === pitem.providerId,
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
</script>
<template>
  <Page :title="route.name === 'AddApplication' ? '新增应用' : '编辑应用'">
    <template #extra>
      <NButton @click="router.go(-1)"> 返回上一页 </NButton>
    </template>
    <NGrid item-responsive cols="8" responsive="screen">
      <NGridItem span="8 m:6 l:6" offset="0 m:1 l:1">
        <NCard>
          <NForm ref="appFormRef" label-placement="left" label-width="150">
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
              <img style="height: 50px" :src="appFormValue.value.faviconUrl" />
            </NFormItem>
            <NFormItem label="Logo图">
              <NInput v-model:value="appFormValue.value.logoUrl" />
            </NFormItem>
            <NFormItem label="Logo图预览">
              <img style="height: 50px" :src="appFormValue.value.logoUrl" />
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
            <NFormItem label="Client ID">
              <NInputGroup>
                <NInput readonly v-model:value="appFormValue.value.clientId" />
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
                <NPopconfirm @positive-click="handleRegenerate('clientSecret')">
                  <template #trigger>
                    <NButton>重新生成</NButton>
                  </template>
                  是否重置Client Secret
                </NPopconfirm>
              </NInputGroup>
            </NFormItem>
            <NFormItem label="重定向地址">
              <NDynamicInput v-model:value="appFormValue.value.redirectUrls" />
            </NFormItem>
            <NFormItem label="SAML受众">
              <NDynamicInput v-model:value="appFormValue.value.samlAudiences" />
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
                  <NInput v-model:value="value.issuer" placeholder="Issuer" />
                  <NInput
                    v-model:value="value.redirectUrl"
                    placeholder="Redirect URL"
                  />
                </template>
              </NDynamicInput>
            </NFormItem>
            <NFormItem label="SAML属性">
              <NDynamicInput
                v-model:value="appFormValue.value.samlAttributes"
                :on-create="
                  () => {
                    return { name: '', nameFormat: null, value: '' };
                  }
                "
              >
                <template #default="{ value }">
                  <NInput v-model:value="value.name" placeholder="name" />
                  <NSelect
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
                  <NInput v-model:value="value.value" placeholder="value" />
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
            <NFormItem label="证书">
              <NSelect
                :options="certList"
                value-field="id"
                label-field="name"
                v-model:value="appFormValue.value.certId"
                :render-label="renderCertLabel"
                remote
              />
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
                <NInput readonly :value="`${samlLink}-${samlLinkGroupId}`" />
                <NSelect
                  style="width: 200px"
                  :options="accessGroupOptions"
                  placeholder="请选择"
                  v-model:value="samlLinkGroupId"
                />
                <NButton @click="handelCopy('saml link')">
                  <MaterialSymbolsContentCopy />
                </NButton>
                <NButton @click="downloadLink">
                  <MaterialSymbolsDownload />
                </NButton>
              </NInputGroup>
            </NFormItem>
            <NFormItem label="提供商列表">
              <NDynamicInput
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
                    :options="providerListOptions"
                    placeholder="请选择提供商"
                    v-model:value="value.providerId"
                    :on-update:value="
                      (val :any) => {return handleProvierItemUpdate(val, index)}
                    "
                  />
                  <NInput
                    disabled
                    placeholder="类型"
                    v-model:value="value.type"
                  />
                  <NSelect
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
