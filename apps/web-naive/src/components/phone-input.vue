<script setup lang="tsx">
import { ref } from 'vue';

import { NInput, NInputGroup, NSelect } from 'naive-ui';

import { countryRegionList } from './country-code';

const { size } = defineProps(['size']);
const value = defineModel<string>('value');
const countryRegionOption = countryRegionList.map((el) => {
  return {
    name: `+${el.tel} (${el.short_upper})`,
    tel: `+${el.tel}`,
  };
});

const telCountryCode = ref('+86');
const telNumber = ref('');
const handleTelUpdate = () => {
  value.value = `${telCountryCode.value}${telNumber.value}`;
};
</script>
<template>
  <NInputGroup>
    <NSelect
      label-field="name"
      value-field="tel"
      :options="countryRegionOption"
      v-model:value="telCountryCode"
      filterable
      style="width: 200px"
      @update:value="handleTelUpdate"
      :size="size"
    />
    <NInput
      :size="size"
      v-model:value="telNumber"
      @update:value="handleTelUpdate"
    />
  </NInputGroup>
</template>
