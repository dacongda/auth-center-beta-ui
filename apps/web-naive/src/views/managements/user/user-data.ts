import type { VxeGridProps } from '@vben/plugins/vxe-table';

export const getGridOptions = (userApi: any): VxeGridProps => {
  return {
    checkboxConfig: {
      highlight: true,
      labelField: 'name',
    },
    columns: [
      // { title: '序号', type: 'seq', width: 50 },
      // { align: 'left', title: 'Name', type: 'checkbox', width: 100 },
      { field: 'id', sortable: false, title: 'Id' },
      { field: 'name', sortable: false, title: 'Name' },
      { field: 'email', sortable: false, title: 'Email' },
      { field: 'phone', sortable: false, title: 'Phone' },
      { field: 'groupName', sortable: false, title: 'Group' },
      {
        field: 'isAdmin',
        slots: { default: 'isAdmin' },
        sortable: false,
        title: '用户类型',
      },
      {
        field: 'action',
        fixed: 'right',
        slots: { default: 'action' },
        title: '操作',
        width: 120,
      },
    ],
    exportConfig: {},
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: userApi,
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
};

export const goAddUser = (router: any) => {
  router.push({
    name: 'AddUser',
  });
};

export const goEditUser = (router: any, row: any) => {
  router.push({
    name: 'EditUser',
    params: { id: row.id },
  });
};
