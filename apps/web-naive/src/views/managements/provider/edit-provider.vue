<script setup lang="tsx">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';

import {
  NButton,
  NCard,
  NForm,
  NFormItem,
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
        router.go(-1);
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
</script>
<template>
  <Page :title="route.name === 'AddProvider' ? '新增提供商' : '编辑提供商'">
    <template #extra>
      <NButton @click="router.go(-1)"> 返回上一页 </NButton>
    </template>
    <NGrid item-responsive cols="8" responsive="screen">
      <NGridItem span="8 m:6 l:6" offset="0 m:1 l:1">
        <NCard>
          <NForm ref="providerFormRef" label-placement="left" label-width="150">
            <NFormItem label="提供商名">
              <NInput v-model:value="providerFormValue.value.name" />
            </NFormItem>
            <NFormItem label="显示名称">
              <NInput v-model:value="providerFormValue.value.displayName" />
            </NFormItem>
            <NFormItem label="类型">
              <NSelect
                :options="providerTypesObject"
                v-model:value="providerFormValue.value.type"
                @change="(val: any)=>{
                  providerFormValue.value.subType = providerTypes[val][0]
                }"
              />
            </NFormItem>
            <NFormItem label="子类型">
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
            </NFormItem>

            <NFormItem label="缩略图">
              <NInput v-model:value="providerFormValue.value.faviconUrl" />
            </NFormItem>
            <NFormItem label="缩略图预览">
              <img
                style="height: 50px"
                :src="providerFormValue.value.faviconUrl"
              />
            </NFormItem>

            <template v-for="(field, index) in providerFieldList" :key="index">
              <NFormItem v-if="field.name === 'clientId'" :label="field.label">
                <NInput v-model:value="providerFormValue.value.clientId" />
              </NFormItem>

              <NFormItem
                v-if="field.name === 'clientSecret'"
                :label="field.label"
              >
                <NInput
                  type="password"
                  v-model:value="providerFormValue.value.clientSecret"
                />
              </NFormItem>

              <NFormItem
                v-if="field.name === 'configureUrl'"
                :label="field.label"
              >
                <NInput v-model:value="providerFormValue.value.configureUrl" />
              </NFormItem>

              <NFormItem
                v-if="field.name === 'authEndpoint'"
                :label="field.label"
              >
                <NInput v-model:value="providerFormValue.value.authEndpoint" />
              </NFormItem>

              <NFormItem
                v-if="field.name === 'tokenEndpoint'"
                :label="field.label"
              >
                <NInput v-model:value="providerFormValue.value.tokenEndpoint" />
              </NFormItem>

              <NFormItem
                v-if="field.name === 'userInfoEndpoint'"
                :label="field.label"
              >
                <NInput
                  v-model:value="providerFormValue.value.userInfoEndpoint"
                />
              </NFormItem>

              <NFormItem v-if="field.name === 'scopes'" :label="field.label">
                <NInput v-model:value="providerFormValue.value.scopes" />
              </NFormItem>

              <NFormItem
                v-if="field.name === 'userInfoMap'"
                :label="field.label"
              >
                <NSpace vertical class="w-full">
                  <NFormItem
                    size="small"
                    label="Id"
                    label-placement="top"
                    :show-feedback="false"
                  >
                    <NInput
                      v-model:value="providerFormValue.value.userInfoMap.id"
                    />
                  </NFormItem>
                  <NFormItem
                    size="small"
                    label="Name"
                    label-placement="top"
                    :show-feedback="false"
                  >
                    <NInput
                      v-model:value="providerFormValue.value.userInfoMap.name"
                    />
                  </NFormItem>
                  <NFormItem
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
                  </NFormItem>
                  <NFormItem
                    size="small"
                    label="Email"
                    label-placement="top"
                    :show-feedback="false"
                  >
                    <NInput
                      v-model:value="providerFormValue.value.userInfoMap.email"
                    />
                  </NFormItem>
                  <NFormItem
                    size="small"
                    label="Phone"
                    label-placement="top"
                    :show-feedback="false"
                  >
                    <NInput
                      v-model:value="providerFormValue.value.userInfoMap.phone"
                    />
                  </NFormItem>
                </NSpace>
              </NFormItem>

              <NFormItem v-if="field.name === 'port'" :label="field.label">
                <NInputNumber
                  v-model:value="providerFormValue.value.port"
                  :default-value="providerFormValue.value?.default"
                />
              </NFormItem>

              <NFormItem v-if="field.name === 'subject'" :label="field.label">
                <NInput v-model:value="providerFormValue.value.subject" />
              </NFormItem>

              <NFormItem v-if="field.name === 'body'" :label="field.label">
                <NInput
                  type="textarea"
                  :rows="10"
                  v-model:value="providerFormValue.value.body"
                />
                <!-- <div v-html="providerFormValue.value.body"></div> -->
              </NFormItem>

              <NFormItem v-if="field.name === 'regionId'" :label="field.label">
                <NInput v-model:value="providerFormValue.value.regionId" />
              </NFormItem>

              <NFormItem v-if="field.name === 'domain'" :label="field.label">
                <NInput v-model:value="providerFormValue.value.domain" />
              </NFormItem>

              <NFormItem v-if="field.name === 'enableSSL'" :label="field.label">
                <NSwitch v-model:value="providerFormValue.value.enableSSL" />
              </NFormItem>
            </template>

            <NFormItem label=" ">
              <NSpace class="w-full" reverse>
                <NButton type="primary" @click="onSubmit">提交</NButton>
                <NButton @click="onReset">重置</NButton>
              </NSpace>
            </NFormItem>

            <NFormItem
              v-if="providerFormValue.value.type === 'Mail'"
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
            </NFormItem>
          </NForm>
        </NCard>
      </NGridItem>
    </NGrid>
  </Page>
</template>
