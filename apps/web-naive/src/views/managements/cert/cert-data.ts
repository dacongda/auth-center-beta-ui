import type { VxeGridProps } from '@vben/plugins/vxe-table';

import { getCertsApi } from '#/api/core/cert';

export const gridOptions: VxeGridProps = {
  checkboxConfig: {
    highlight: true,
    labelField: 'name',
  },
  columns: [
    // { align: 'left', title: 'Name', type: 'checkbox', width: 100 },
    { field: 'id', sortable: false, title: 'Id', width: 80 },
    { field: 'name', sortable: false, title: 'Name' },
    // { field: 'defaultRoles', sortable: false, title: 'DefaultRoles' },
    { field: 'bitSize', sortable: false, title: 'Bit size' },
    { field: 'cryptoAlgorithm', sortable: false, title: 'Crypto algorithm' },
    { field: 'cryptoSHASize', sortable: false, title: 'Crypto SHA Size' },
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
        return await getCertsApi({
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

export const goAddCert = (router: any, parentId = 0) => {
  router.push({
    name: 'AddCert',
    state: { parentId },
  });
};

export const goEditCert = (router: any, row: any) => {
  router.push({
    name: 'EditCert',
    params: { id: row.id },
  });
};
