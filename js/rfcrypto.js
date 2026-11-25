// Shared crypto helpers (WebCrypto): password hashing and result encryption
window.RFC = (function () {
  var te = new TextEncoder(), td = new TextDecoder(), IT = 100000;
  function b64(u) { var s = ''; u = new Uint8Array(u); for (var i = 0; i < u.length; i++) s += String.fromCharCode(u[i]); return btoa(s); }
  function ub(s) { var b = atob(s), u = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
  function rnd(n) { return crypto.getRandomValues(new Uint8Array(n)); }
  function base(p) { return crypto.subtle.importKey('raw', te.encode(p), 'PBKDF2', false, ['deriveBits', 'deriveKey']); }
  function hash(p, salt) {
    return base(p).then(function (k) { return crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: ub(salt), iterations: IT }, k, 256); }).then(b64);
  }
  function key(p, salt) {
    return base(p).then(function (k) { return crypto.subtle.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt: ub(salt), iterations: IT }, k, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']); });
  }
  function enc(p, obj) {
    var salt = b64(rnd(16)), iv = rnd(12);
    return key(p, salt).then(function (k) { return crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, k, te.encode(JSON.stringify(obj))); })
      .then(function (ct) { return { s: salt, i: b64(iv), c: b64(ct) }; });
  }
  function dec(p, r) {
    return key(p, r.s).then(function (k) { return crypto.subtle.decrypt({ name: 'AES-GCM', iv: ub(r.i) }, k, ub(r.c)); })
      .then(function (b) { return JSON.parse(td.decode(b)); });
  }
  return { b64: b64, rnd: rnd, hash: hash, enc: enc, dec: dec };
})();
