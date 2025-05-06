import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'qlementine-icons:file-manager-16',
      keepAlive: true,
      order: 1000,
      title: $t('managements.title'),
    },
    name: 'Management',
    path: '/management',
    children: [
      {
        meta: {
          title: $t('managements.user_list'),
          icon: 'material-symbols:inbox-text-person-rounded',
        },
        name: 'Users',
        path: 'user',
        component: () => import('#/views/managements/user/user.vue'),
      },
      {
        meta: {
          title: $t('managements.add_group'),
          hideInMenu: true,
          icon: 'ic:baseline-group-add',
        },
        name: 'AddGroup',
        path: 'add-group',
        component: () => import('#/views/managements/user/add-group.vue'),
      },
    ],
  },
];

export default routes;
