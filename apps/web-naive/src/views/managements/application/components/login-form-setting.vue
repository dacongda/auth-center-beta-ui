<script lang="tsx" setup>
import type { LoginFormSetting } from '../application-data';

import { NInput, NSelect, NSwitch, NTable } from 'naive-ui';

const loginFormSetting = defineModel<LoginFormSetting>('value', {
  required: true,
});

const setField = (topKey: any, key: any, value: any) => {
  if (!(loginFormSetting.value as any)[topKey])
    (loginFormSetting.value as any)[topKey] = {};
  window.console.log(topKey, loginFormSetting);
  (loginFormSetting.value as any)[topKey][key] = value;
};
</script>
<template>
  <NTable size="small">
    <thead>
      <tr>
        <th>表单项</th>
        <th>样式</th>
        <th style="width: 200px">规则</th>
        <th>可见</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>登陆面板</td>
        <td>
          <NInput
            size="small"
            :value="loginFormSetting.loginPanel?.style"
            @update:value="
              (v) => {
                setField('loginPanel', 'style', v);
              }
            "
          />
        </td>
        <td>
          <NSelect
            size="small"
            :options="
              ['center', 'left', 'right'].map((el) => {
                return { label: el, value: el };
              })
            "
            :value="loginFormSetting.loginPanel?.rule"
            @update:value="
              (v) => {
                setField('loginPanel', 'rule', v);
              }
            "
          />
        </td>
        <td></td>
      </tr>
      <tr>
        <td>登陆背景</td>
        <td>
          <NInput
            size="small"
            :value="loginFormSetting.loginBackground?.style"
            @update:value="
              (v) => {
                setField('loginBackground', 'style', v);
              }
            "
          />
        </td>
        <td></td>
        <td>
          <NSwitch
            :value="loginFormSetting.loginBackground?.visible"
            @update:value="
              (v) => {
                setField('loginBackground', 'visible', v);
              }
            "
            size="small"
          />
        </td>
      </tr>
      <tr>
        <td>表单LOGO</td>
        <td>
          <NInput
            :value="loginFormSetting.formLogo?.style"
            @update:value="
              (v) => {
                setField('formLogo', 'style', v);
              }
            "
            size="small"
          />
        </td>
        <td>
          <NSelect
            size="small"
            :options="
              ['side-only', 'top-only', 'all'].map((el) => {
                return { label: el, value: el };
              })
            "
            :value="loginFormSetting.formLogo?.rule"
            @update:value="
              (v) => {
                setField('formLogo', 'rule', v);
              }
            "
          />
        </td>
        <td>
          <NSwitch
            :value="loginFormSetting.formLogo?.visible"
            @update:value="
              (v) => {
                setField('formLogo', 'visible', v);
              }
            "
            size="small"
          />
        </td>
      </tr>
      <tr>
        <td>输入框</td>
        <td>
          <NInput
            size="small"
            :value="loginFormSetting.input?.style"
            @update:value="
              (v) => {
                setField('input', 'style', v);
              }
            "
          />
        </td>
        <td></td>
        <td></td>
      </tr>
      <tr>
        <td>登陆按钮</td>
        <td>
          <NInput
            :value="loginFormSetting.loginButton?.style"
            @update:value="
              (v) => {
                setField('loginButton', 'style', v);
              }
            "
            size="small"
          />
        </td>
        <td></td>
        <td></td>
      </tr>
      <tr>
        <td>第三方登陆</td>
        <td>
          <NInput
            :value="loginFormSetting.thirdPartLogin?.style"
            @update:value="
              (v) => {
                setField('thirdPartLogin', 'style', v);
              }
            "
            size="small"
          />
        </td>
        <td></td>
        <td></td>
      </tr>
    </tbody>
  </NTable>
</template>
