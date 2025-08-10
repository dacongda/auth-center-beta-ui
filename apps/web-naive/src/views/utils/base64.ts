export function base64UrlTobase64(str: string) {
  let formatedStr = str.replaceAll('-', '+').replaceAll('_', '/');
  while (formatedStr.length % 4) {
    formatedStr += '=';
  }

  return atob(formatedStr);
}
