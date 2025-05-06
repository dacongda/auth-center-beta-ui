import type { VxeGridProps } from '@vben/plugins/vxe-table';

import { getUserListApi } from '#/api';

interface RowType {
  category: string;
  color: string;
  id: string;
  price: string;
  productName: string;
  releaseDate: string;
}

export const gridOptions: VxeGridProps<RowType> = {
  checkboxConfig: {
    highlight: true,
    labelField: 'name',
  },
  columns: [
    // { title: '序号', type: 'seq', width: 50 },
    // { align: 'left', title: 'Name', type: 'checkbox', width: 100 },
    { field: 'id', sortable: false, title: 'Id', width: 50 },
    { field: 'name', sortable: false, title: 'Name' },
    { field: 'number', sortable: false, title: 'Number' },
    { field: 'email', sortable: false, title: 'Email' },
    { field: 'phone', sortable: false, title: 'Phone' },
  ],
  exportConfig: {},
  height: 'auto',
  keepSource: true,
  proxyConfig: {
    ajax: {
      query: async ({ page, sort }) => {
        return await getUserListApi({
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
