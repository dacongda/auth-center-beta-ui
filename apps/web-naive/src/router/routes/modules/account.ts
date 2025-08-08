import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:layout-dashboard',
      order: -1,
      title: $t('managements.account'),
      hideInMenu: true,
    },
    name: 'Account',
    path: '/account',
    redirect: '/account/editAccount/BasicInfo',
    children: [
      {
        name: 'EditAccount',
        path: 'editAccount/:path',
        component: () => import('#/views/account/edit-account.vue'),
        meta: {
          hideInMenu: true,
          icon: 'lucide:area-chart',
          title: $t('managements.editAccount'),
          menuKey: 'editAccount',
          keepAlive: true,
        },
      },
      {
        name: 'AddPasskey',
        path: 'addPasskey',
        component: () => import('#/views/account/add-passkey.vue'),
        meta: {
          hideInMenu: true,
          hideInTab: true,
          icon: 'material-symbols:passkey',
          title: $t('managements.addPasskey'),
        },
      },
      {
        name: 'EnableMfa',
        path: 'enableMfa/:mfaType',
        component: () => import('#/views/account/enable-mfa.vue'),
        meta: {
          hideInMenu: true,
          hideInTab: true,
          icon: 'material-symbols:passkey',
          title: $t('managements.enableMfa'),
        },
      },
    ],
  },
];

export default routes;
