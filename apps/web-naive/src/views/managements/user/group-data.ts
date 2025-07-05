import type { VxeGridProps } from '@vben/plugins/vxe-table';

import { getGroupsApi } from '#/api/core/group';

export const gridOptions: VxeGridProps = {
  checkboxConfig: {
    highlight: true,
    labelField: 'name',
  },
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    // { align: 'left', title: 'Name', type: 'checkbox', width: 100 },
    { field: 'id', sortable: false, title: 'Id', width: 80, treeNode: true },
    { field: 'name', sortable: false, title: 'Name' },
    // { field: 'defaultRoles', sortable: false, title: 'DefaultRoles' },
    { field: 'parentId', sortable: false, title: 'ParentId' },
    { field: 'topId', sortable: false, title: 'topId' },
    { field: 'parentChain', sortable: false, title: 'parentChain' },
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
        return await getGroupsApi({
          page: page.currentPage,
          pageSize: page.pageSize,
          sortBy: sort.field,
          sortOrder: sort.order,
          returnType: 'flat',
        });
      },
    },
    sort: true,
  },
  sortConfig: {
    defaultSort: { field: 'category', order: 'desc' },
    remote: true,
  },
  treeConfig: {
    transform: true, // 指定表格为树形表格
    parentField: 'parentId', // 父节点字段名
    rowField: 'id', // 行数据字段名
    showLine: true,
  },
  toolbarConfig: {
    custom: true,
    export: true,
    // import: true,
    refresh: { code: 'query' },
    zoom: true,
  },
};

export const goAddGroup = (router: any, parentId = 0) => {
  router.push({
    name: 'AddGroup',
    state: { parentId },
  });
};

export const goEditGroup = (router: any, row: any) => {
  router.push({
    name: 'EditGroup',
    params: { id: row.id },
  });
};
