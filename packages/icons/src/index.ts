import { createIconifyIcon } from '@vben-core/icons';

export * from './iconify';
export { default as EmptyIcon } from './icons/empty-icon.vue';
export * from './svg';

export const MaterialSymbolsContentCopy = createIconifyIcon(
  'material-symbols:content-copy',
);

export const MaterialSymbolsEditNoteSharp = createIconifyIcon(
  'material-symbols:edit-note-sharp',
);

export const MaterialSymbolsDownload = createIconifyIcon(
  'material-symbols:download',
);

export const MaterialSymbolsPasskey = createIconifyIcon(
  'material-symbols:passkey',
);
