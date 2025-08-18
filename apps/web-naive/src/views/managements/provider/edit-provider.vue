<script setup lang="tsx">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';

import DOMPurify from 'dompurify';
import {
  NButton,
  NCard,
  NForm,
  NFormItemGi,
  NGrid,
  NGridItem,
  NInput,
  NInputNumber,
  NSelect,
  NSpace,
  NSwitch,
} from 'naive-ui';

import { message } from '#/adapter/naive';
import {
  addProviderApi,
  getProviderApi,
  testSendEmailApi,
  updateProviderApi,
} from '#/api/core/provider';

import {
  DefaultEmailTemplate,
  providerFieldArray,
  providerTypes,
  providerTypesObject,
} from './provider-data';

const router = useRouter();
const route = useRoute();

const id = route.params?.id;
const curProvider = ref<any>();

const providerFormValue: any = reactive({ value: { userInfoMap: {} } });
const providerFormRef = ref();

const valJsonStr = ref();

onMounted(() => {
  if (id) {
    getProviderApi({ id, analyseCert: true }).then((res) => {
      curProvider.value = res;
      providerFormValue.value = res;
      valJsonStr.value = JSON.stringify(res);
    });
  }
});

const onSubmit = () => {
  return id
    ? updateProviderApi(providerFormValue.value).then(() => {
        message.success('提供商更新成功');
      })
    : addProviderApi(providerFormValue.value).then(() => {
        message.success('提供商添加成功');
        router.go(-1);
      });
};

const onReset = () => {
  providerFormValue.value = JSON.parse(valJsonStr.value);
};

const providerFieldList = computed(() => {
  if (!providerFieldArray[providerFormValue.value.type]) {
    return [];
  }

  return (
    providerFieldArray[providerFormValue.value.type][
      providerFormValue.value.subType
    ] ?? []
  );
});

const testSendEmail = () => {
  testSendEmailApi(providerFormValue.value).then(() => {
    message.success('发送成功');
  });
};

const getPurifiedBody = (body: string) => {
  return DOMPurify.sanitize(
    body?.replace('%code%', '123456').replace('%link%', window.location.href),
    {
      USE_PROFILES: { html: true },
    },
  );
};
</script>
<template>
  <Page :title="route.name === 'AddProvider' ? '新增提供商' : '编辑提供商'">
    <!-- eslint-disable vue/no-v-html -->
    <template #extra>
      <NButton @click="router.go(-1)"> 返回上一页 </NButton>
    </template>
    <NGrid item-responsive cols="8" responsive="screen">
      <NGridItem span="8 m:6 l:6" offset="0 m:1 l:1">
        <NCard>
          <NForm ref="providerFormRef" label-placement="left" label-width="150">
            <NGrid :cols="2" item-responsive responsive="screen">
              <NFormItemGi :span="2" label="提供商名">
                <NInput v-model:value="providerFormValue.value.name" />
              </NFormItemGi>
              <NFormItemGi :span="2" label="显示名称">
                <NInput v-model:value="providerFormValue.value.displayName" />
              </NFormItemGi>
              <NFormItemGi :span="2" label="类型">
                <NSelect
                  :options="providerTypesObject"
                  v-model:value="providerFormValue.value.type"
                  @change="(val: any)=>{
                  providerFormValue.value.subType = providerTypes[val][0]
                  if (val === 'Email') {
                    providerFormValue.value.body = DefaultEmailTemplate.body;
                    providerFormValue.value.linkBody =
                      DefaultEmailTemplate.linkBody;
                  }
                }"
                />
              </NFormItemGi>
              <NFormItemGi :span="2" label="子类型">
                <NSelect
                  :options="
                  providerTypes[providerFormValue.value.type]?.map(
                    (el: any) => {
                      return { label: el, value: el };
                    },
                  )
                "
                  v-model:value="providerFormValue.value.subType"
                />
              </NFormItemGi>

              <NFormItemGi :span="2" label="缩略图">
                <NInput v-model:value="providerFormValue.value.faviconUrl" />
              </NFormItemGi>
              <NFormItemGi :span="2" label="缩略图预览">
                <img
                  style="height: 50px"
                  :src="providerFormValue.value.faviconUrl"
                />
              </NFormItemGi>

              <template
                v-for="(field, index) in providerFieldList"
                :key="index"
              >
                <NFormItemGi
                  :span="2"
                  v-if="field.name === 'clientId'"
                  :label="field.label"
                >
                  <NInput v-model:value="providerFormValue.value.clientId" />
                </NFormItemGi>

                <NFormItemGi
                  :span="2"
                  v-if="field.name === 'clientSecret'"
                  :label="field.label"
                >
                  <NInput
                    type="password"
                    v-model:value="providerFormValue.value.clientSecret"
                  />
                </NFormItemGi>

                <NFormItemGi
                  :span="2"
                  v-if="field.name === 'configureUrl'"
                  :label="field.label"
                >
                  <NInput
                    v-model:value="providerFormValue.value.configureUrl"
                  />
                </NFormItemGi>

                <NFormItemGi
                  :span="2"
                  v-if="field.name === 'authEndpoint'"
                  :label="field.label"
                >
                  <NInput
                    v-model:value="providerFormValue.value.authEndpoint"
                  />
                </NFormItemGi>

                <NFormItemGi
                  :span="2"
                  v-if="field.name === 'tokenEndpoint'"
                  :label="field.label"
                >
                  <NInput
                    v-model:value="providerFormValue.value.tokenEndpoint"
                  />
                </NFormItemGi>

                <NFormItemGi
                  :span="2"
                  v-if="field.name === 'tokenType'"
                  :label="field.label"
                >
                  <NInput v-model:value="providerFormValue.value.tokenType" />
                </NFormItemGi>

                <NFormItemGi
                  :span="2"
                  v-if="field.name === 'userInfoEndpoint'"
                  :label="field.label"
                >
                  <NInput
                    v-model:value="providerFormValue.value.userInfoEndpoint"
                  />
                </NFormItemGi>

                <NFormItemGi
                  :span="2"
                  v-if="field.name === 'scopes'"
                  :label="field.label"
                >
                  <NInput v-model:value="providerFormValue.value.scopes" />
                </NFormItemGi>

                <NFormItemGi
                  :span="2"
                  v-if="field.name === 'userInfoMap'"
                  :label="field.label"
                >
                  <NSpace vertical class="w-full">
                    <NFormItemGi
                      size="small"
                      label="Id"
                      label-placement="top"
                      :show-feedback="false"
                    >
                      <NInput
                        v-model:value="providerFormValue.value.userInfoMap.id"
                      />
                    </NFormItemGi>
                    <NFormItemGi
                      size="small"
                      label="Name"
                      label-placement="top"
                      :show-feedback="false"
                    >
                      <NInput
                        v-model:value="providerFormValue.value.userInfoMap.name"
                      />
                    </NFormItemGi>
                    <NFormItemGi
                      size="small"
                      label="PreferredName"
                      label-placement="top"
                      :show-feedback="false"
                    >
                      <NInput
                        v-model:value="
                          providerFormValue.value.userInfoMap.preferredName
                        "
                      />
                    </NFormItemGi>
                    <NFormItemGi
                      size="small"
                      label="Email"
                      label-placement="top"
                      :show-feedback="false"
                    >
                      <NInput
                        v-model:value="
                          providerFormValue.value.userInfoMap.email
                        "
                      />
                    </NFormItemGi>
                    <NFormItemGi
                      size="small"
                      label="Phone"
                      label-placement="top"
                      :show-feedback="false"
                    >
                      <NInput
                        v-model:value="
                          providerFormValue.value.userInfoMap.phone
                        "
                      />
                    </NFormItemGi>
                  </NSpace>
                </NFormItemGi>

                <NFormItemGi
                  :span="2"
                  v-if="field.name === 'port'"
                  :label="field.label"
                >
                  <NInputNumber
                    v-model:value="providerFormValue.value.port"
                    :default-value="providerFormValue.value?.default"
                  />
                </NFormItemGi>

                <NFormItemGi
                  :span="2"
                  v-if="field.name === 'subject'"
                  :label="field.label"
                >
                  <NInput v-model:value="providerFormValue.value.subject" />
                </NFormItemGi>

                <NFormItemGi :span="2" v-if="field.name === 'body'" label=" ">
                  <NButton
                    type="primary"
                    secondary
                    @click="
                      providerFormValue.value.body = DefaultEmailTemplate.body
                    "
                  >
                    重置默认
                  </NButton>
                </NFormItemGi>
                <NFormItemGi
                  span="2 l:1"
                  v-if="field.name === 'body'"
                  :label="field.label"
                >
                  <NInput
                    type="textarea"
                    :rows="10"
                    v-model:value="providerFormValue.value.body"
                  />
                </NFormItemGi>
                <NFormItemGi
                  span="2 l:1"
                  v-if="field.name === 'body'"
                  :label="`${field.label}预览`"
                >
                  <NCard>
                    <div
                      v-html="getPurifiedBody(providerFormValue.value.body)"
                    ></div>
                  </NCard>
                </NFormItemGi>

                <NFormItemGi
                  :span="2"
                  v-if="field.name === 'linkBody'"
                  label=" "
                >
                  <NButton
                    type="primary"
                    secondary
                    @click="
                      providerFormValue.value.linkBody =
                        DefaultEmailTemplate.linkBody
                    "
                  >
                    重置默认
                  </NButton>
                </NFormItemGi>
                <NFormItemGi
                  span="2 l:1"
                  v-if="field.name === 'linkBody'"
                  :label="field.label"
                >
                  <NInput
                    type="textarea"
                    :rows="10"
                    v-model:value="providerFormValue.value.linkBody"
                  />
                </NFormItemGi>
                <NFormItemGi
                  span="2 l:1"
                  v-if="field.name === 'linkBody'"
                  :label="`${field.label}预览`"
                >
                  <NCard>
                    <div
                      v-html="getPurifiedBody(providerFormValue.value.linkBody)"
                    ></div>
                  </NCard>
                </NFormItemGi>

                <NFormItemGi
                  :span="2"
                  v-if="field.name === 'regionId'"
                  :label="field.label"
                >
                  <NInput v-model:value="providerFormValue.value.regionId" />
                </NFormItemGi>

                <NFormItemGi
                  :span="2"
                  v-if="field.name === 'domain'"
                  :label="field.label"
                >
                  <NInput v-model:value="providerFormValue.value.domain" />
                </NFormItemGi>

                <NFormItemGi
                  :span="2"
                  v-if="field.name === 'enableSSL'"
                  :label="field.label"
                >
                  <NSwitch v-model:value="providerFormValue.value.enableSSL" />
                </NFormItemGi>
              </template>

              <NFormItemGi :span="2" label=" ">
                <NSpace class="w-full" reverse>
                  <NButton type="primary" @click="onSubmit">提交</NButton>
                  <NButton @click="onReset">重置</NButton>
                </NSpace>
              </NFormItemGi>

              <NFormItemGi
                :span="2"
                v-if="providerFormValue.value.type === 'Email'"
                label="邮件测试"
              >
                <NInput
                  v-model:value="providerFormValue.value.destination"
                  placeholder="请输入接收者"
                />
                <NButton
                  @click="
                    () => {
                      testSendEmail();
                    }
                  "
                >
                  发送
                </NButton>
              </NFormItemGi>
            </NGrid>
          </NForm>
        </NCard>
      </NGridItem>
    </NGrid>
  </Page>
</template>
