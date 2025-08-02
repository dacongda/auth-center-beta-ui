import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'mingcute:safe-lock-line',
      keepAlive: true,
      order: 1000,
      title: $t('managements.auth-safe'),
    },
    name: 'AuthSafe',
    path: '/auth-safe',
    children: [
      {
        meta: {
          title: $t('managements.application_list'),
          icon: 'material-symbols:apps',
        },
        name: 'Applications',
        path: 'application',
        component: () =>
          import('#/views/managements/application/application.vue'),
      },
      {
        meta: {
          title: $t('managements.add_application'),
          hideInMenu: true,
          icon: 'ic:baseline-group-add',
        },
        name: 'AddApplication',
        path: 'add-application',
        component: () =>
          import('#/views/managements/application/edit-application.vue'),
      },
      {
        meta: {
          title: $t('managements.edit_application'),
          hideInMenu: true,
          icon: 'ic:baseline-group-add',
        },
        name: 'EditApplication',
        path: 'edit-application/:id',
        component: () =>
          import('#/views/managements/application/edit-application.vue'),
      },
      {
        meta: {
          title: $t('managements.cert_list'),
          icon: 'fluent:certificate-16-regular',
        },
        name: 'Certs',
        path: 'cert',
        component: () => import('#/views/managements/cert/cert.vue'),
      },
      {
        meta: {
          title: $t('managements.add_cert'),
          hideInMenu: true,
          icon: 'ic:baseline-group-add',
        },
        name: 'AddCert',
        path: 'add-cert',
        component: () => import('#/views/managements/cert/edit-cert.vue'),
      },
      {
        meta: {
          title: $t('managements.edit_cert'),
          hideInMenu: true,
          icon: 'ic:baseline-group-add',
        },
        name: 'EditCert',
        path: 'edit-cert/:id',
        component: () => import('#/views/managements/cert/edit-cert.vue'),
      },
      {
        meta: {
          title: $t('managements.provider_list'),
          icon: 'material-symbols:tools-wrench-outline-rounded',
        },
        name: 'Providers',
        path: 'provider',
        component: () => import('#/views/managements/provider/provider.vue'),
      },
      {
        meta: {
          title: $t('managements.add_provider'),
          hideInMenu: true,
          icon: 'hugeicons:pen-tool-add',
        },
        name: 'AddProvider',
        path: 'add-provider',
        component: () =>
          import('#/views/managements/provider/edit-provider.vue'),
      },
      {
        meta: {
          title: $t('managements.edit_provider'),
          hideInMenu: true,
          icon: 'hugeicons:pen-tool-add',
        },
        name: 'EditProvider',
        path: 'edit-provider/:id',
        component: () =>
          import('#/views/managements/provider/edit-provider.vue'),
      },
    ],
  },
];

export default routes;
