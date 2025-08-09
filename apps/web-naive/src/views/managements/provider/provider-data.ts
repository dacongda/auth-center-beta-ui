import type { VxeGridProps } from '@vben/plugins/vxe-table';

import { getProvidersApi } from '#/api/core/provider';

export const gridOptions: VxeGridProps = {
  checkboxConfig: {
    highlight: true,
    labelField: 'name',
  },
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    // { align: 'left', title: 'Name', type: 'checkbox', width: 100 },
    { field: 'id', sortable: false, title: 'Id', width: 80 },
    { field: 'name', sortable: false, title: 'Name' },
    // { field: 'defaultRoles', sortable: false, title: 'DefaultRoles' },
    { field: 'type', sortable: false, title: 'Type' },
    { field: 'subType', sortable: false, title: 'Sub Type' },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: '操作',
      width: 300,
    },
  ],
  exportConfig: {},
  height: 'auto',
  // keepSource: true,
  proxyConfig: {
    ajax: {
      query: async ({ page, sort }) => {
        return await getProvidersApi({
          page: page.currentPage,
          pageSize: page.pageSize,
          sortBy: sort.field,
          sortOrder: sort.order,
        });
      },
    },
    sort: true,
  },
  sortConfig: {
    defaultSort: { field: 'category', order: 'desc' },
    remote: true,
  },
  toolbarConfig: {
    custom: true,
    export: true,
    // import: true,
    refresh: { code: 'query' },
    zoom: true,
  },
};

export const goAddProvider = (router: any, parentId = 0) => {
  router.push({
    name: 'AddProvider',
    state: { parentId },
  });
};

export const goEditProvider = (router: any, row: any) => {
  router.push({
    name: 'EditProvider',
    params: { id: row.id },
  });
};

export const providerTypes: any = {
  Captcha: ['Default', 'Aliyun'],
  Email: ['SMTP'],
  Auth: ['OIDC', 'SAML'],
};

export const providerTypesObject = Object.keys(providerTypes).map((el) => {
  return { label: el, value: el };
});

export const providerFieldArray: any = {
  Captcha: {
    Default: [{ name: 'port', label: '验证码长度' }],
    Aliyun: [
      { name: 'clientId', label: 'accessKeyId' },
      { name: 'clientSecret', label: 'accessKeySecret' },
      { name: 'configureUrl', label: '场景ID' },
    ],
  },
  Auth: {
    OIDC: [
      { name: 'clientId', label: 'accessKeyId' },
      { name: 'clientSecret', label: 'accessKeySecret' },
      { name: 'configureUrl', label: 'OIDC Discovery' },
    ],
  },
  Email: {
    SMTP: [
      { name: 'clientId', label: '用户名' },
      { name: 'clientSecret', label: '密码' },
      { name: 'configureUrl', label: 'SMTP服务器' },
      { name: 'port', label: '端口', default: 463 },
      { name: 'enableSSL', label: '启用加密' },
      { name: 'subject', label: '主题' },
      { name: 'body', label: '内容' },
    ],
  },
};
