import type { VxeGridProps } from '@vben/plugins/vxe-table';

import { getApplicationsApi } from '#/api/core/application';

export const applicationGridOptions: VxeGridProps = {
  checkboxConfig: {
    highlight: true,
    labelField: 'name',
  },
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    // { align: 'left', title: 'Name', type: 'checkbox', width: 100 },
    { field: 'id', sortable: false, title: 'Id', width: 80 },
    { field: 'name', sortable: false, title: 'Name' },
    { field: 'clientId', sortable: false, title: 'Client ID' },
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
  keepSource: true,
  proxyConfig: {
    ajax: {
      query: async ({ page, sort }: any) => {
        return await getApplicationsApi({
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

export const goAddApplication = (router: any) => {
  router.push({
    name: 'AddApplication',
  });
};

export const goEditApplication = (router: any, row: any) => {
  router.push({
    name: 'EditApplication',
    params: { id: row.id },
  });
};

export const providerRule: any = {
  Captcha: {
    Default: {
      options: [
        { label: '计算题', value: 'Calculate' },
        { label: '数字', value: 'Number' },
        { label: '字母', value: 'Alphabet' },
        { label: '字母与数字', value: 'Letter' },
      ],
      multiple: false,
    },
  },
  Email: {
    SMTP: {
      options: [
        { label: '默认', value: 'Default' },
        { label: '注册', value: 'Register' },
        { label: '忘记密码', value: 'ForgetPassword' },
      ],
      multiple: true,
    },
  },
  Auth: {
    OAuth2: {
      options: [
        { label: '登陆', value: 'Login' },
        { label: '注册', value: 'Register' },
      ],
      multiple: true,
    },
    SAML: {
      options: [
        { label: '登陆', value: 'Login' },
        { label: '注册', value: 'Register' },
        { label: '压缩请求', value: 'Compressed' },
      ],
      multiple: true,
    },
  },
  Storage: {
    Local: {
      options: [],
      multiple: true,
    },
    S3: {
      options: [],
      multiple: true,
    },
  },
  SMS: {
    Tencent: {
      options: [
        { label: '默认', value: 'Default' },
        { label: '注册', value: 'Register' },
      ],
      multiple: true,
    },
    Twilio: {
      options: [
        { label: '默认', value: 'Default' },
        { label: '注册', value: 'Register' },
      ],
      multiple: true,
    },
  },
};
