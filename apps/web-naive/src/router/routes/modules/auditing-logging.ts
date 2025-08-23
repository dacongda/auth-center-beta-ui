import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'uiw:safety',
      keepAlive: true,
      order: 2000,
      title: $t('page.auditing-logging.title'),
      authority: ['admin'],
    },
    name: 'AuditingLogging',
    path: '/auditing-logging',
    redirect: '/auditing-logging/logging',
    children: [
      {
        meta: {
          title: $t('page.auditing-logging.user-session.title'),
          icon: 'material-symbols-light:fiber-smart-record',
        },
        name: 'Loggings',
        path: 'logging',
        component: () => import('#/views/auditing-logging/user-session.vue'),
      },
    ],
  },
];

export default routes;
