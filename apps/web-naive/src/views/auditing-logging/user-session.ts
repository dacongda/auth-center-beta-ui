import type { VxeGridProps } from '@vben/plugins/vxe-table';

import { getUserSessionApi } from '#/api/core/logging';

export const userSessionGridOptions: VxeGridProps = {
  checkboxConfig: {
    highlight: true,
    labelField: 'name',
  },
  columns: [
    // { align: 'left', title: 'Name', type: 'checkbox', width: 100 },
    {
      fixed: 'left',
      field: 'sessionId',
      sortable: false,
      title: 'Id',
      width: 200,
    },
    { field: 'userId', sortable: false, title: '用户ID', minWidth: 100 },
    { field: 'loginType', sortable: false, title: '登陆类型', width: 100 },
    { field: 'loginMethod', sortable: false, title: '登陆方式', width: 100 },
    {
      field: 'loginApplication',
      sortable: false,
      title: '登陆应用',
      width: 80,
    },
    { field: 'loginIp', sortable: false, title: '登陆IP', minWidth: 150 },
    { field: 'loginVia', sortable: false, title: '登陆来源', minWidth: 100 },
    {
      field: 'action',
      fixed: 'right',
      slots: { default: 'action' },
      title: '操作',
      width: 100,
    },
  ],
  exportConfig: {},
  height: 'auto',
  keepSource: true,
  proxyConfig: {
    ajax: {
      query: async ({ page, sort }) => {
        return await getUserSessionApi({
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
