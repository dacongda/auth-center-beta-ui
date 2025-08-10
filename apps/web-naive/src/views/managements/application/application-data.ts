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
      query: async ({ page, sort }) => {
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
    Default: [
      { label: '计算题', value: 'Calculate' },
      { label: '数字', value: 'Number' },
      { label: '字母', value: 'Alphabet' },
      { label: '字母与数字', value: 'Letter' },
    ],
  },
  Email: {
    SMTP: [{ label: '默认', value: 'Default' }],
  },
  Auth: {
    OAuth2: [
      { label: '登陆', value: 'Login' },
      { label: '注册', value: 'Register' },
    ],
  },
};
