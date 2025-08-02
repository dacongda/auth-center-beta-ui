export const coerceToArrayBuffer = function (thing: any, name: any) {
  if (typeof thing === 'string') {
    // base64url to base64
    thing = thing.replaceAll('-', '+').replaceAll('_', '/');

    // base64 to Uint8Array
    const str = window.atob(thing);
    const bytes: any = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
      bytes[i] = str.codePointAt(i);
    }
    thing = bytes;
  }

  // Array to Uint8Array
  if (Array.isArray(thing)) {
    thing = new Uint8Array(thing);
  }

  // Uint8Array to ArrayBuffer
  if (thing instanceof Uint8Array) {
    thing = thing.buffer;
  }

  // error if none of the above worked
  if (!(thing instanceof ArrayBuffer)) {
    throw new TypeError(`could not coerce '${name}' to ArrayBuffer`);
  }

  return thing;
};

export const coerceToBase64Url = function (thing: any) {
  // Array or ArrayBuffer to Uint8Array
  if (Array.isArray(thing)) {
    thing = Uint8Array.from(thing);
  }

  if (thing instanceof ArrayBuffer) {
    thing = new Uint8Array(thing);
  }

  // Uint8Array to base64
  if (thing instanceof Uint8Array) {
    let str = '';
    const len = thing.byteLength;

    for (let i = 0; i < len; i++) {
      str += String.fromCodePoint(thing[i] ?? 0);
    }
    thing = window.btoa(str);
  }

  if (typeof thing !== 'string') {
    throw new TypeError('could not coerce to string');
  }

  // base64 to base64url
  // NOTE: "=" at the end of challenge is optional, strip it off here
  thing = thing
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll(/=*$/g, '');

  return thing;
};
