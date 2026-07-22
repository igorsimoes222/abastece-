// Polyfills para APIs de browser ausentes no Hermes
if (typeof global.DOMException === 'undefined') {
  global.DOMException = class DOMException extends Error {
    constructor(message, name) {
      super(message);
      this.name = name || 'DOMException';
    }
  };
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = class TextDecoder {
    decode(val) {
      if (!val) return '';
      return String.fromCharCode(...new Uint8Array(val));
    }
  };
}

import 'expo/AppEntry';
