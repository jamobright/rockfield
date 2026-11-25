// Staff sign-in gate for the results portal (browser-side; see notes in the project README)
(function () {
  'use strict';
  var UK = 'rockfield-users', LK = 'rockfield-lock', SK = 'rockfield-session', IDLE = 15 * 60 * 1000;
  function $(i) { return document.getElementById(i); }
  function users() { try { return JSON.parse(localStorage.getItem(UK)) || []; } catch (e) { return []; } }
  function put(u) { localStorage.setItem(UK, JSON.stringify(u)); }
  function lock() { try { return JSON.parse(localStorage.getItem(LK)) || {}; } catch (e) { return {}; } }
  function make(name, u, pw, role, cls) {
    var salt = RFC.b64(RFC.rnd(16));
    return RFC.hash(pw, salt).then(function (h) { return { name: name, u: u.toLowerCase().trim(), role: role, cls: cls || [], salt: salt, hash: h }; });
  }
  function box(h) { $('gate').innerHTML = '<form id="gf" class="gbox">' + h + '<p class="err" id="ge" role="alert"></p></form>'; }
  function err(m) { $('ge').textContent = m; }
  function out() { sessionStorage.removeItem(SK); location.reload(); }
  function idle() {
    var t; function r() { clearTimeout(t); t = setTimeout(out, IDLE); }
    ['click', 'keydown', 'touchstart'].forEach(function (n) { document.addEventListener(n, r); }); r();
  }
  function enter(u) { sessionStorage.setItem(SK, u.u); idle(); window.startPortal(u); }
  function setup() {
    box('<h2>Create administrator account</h2><p class="lead">This first account manages teachers, settings and published results.</p><label>Full name<input id="gn" required></label><label>Username<input id="gu" autocomplete="username" required></label><label>Password (at least 8 characters)<input id="gp" type="password" autocomplete="new-password" minlength="8" required></label><label>Confirm password<input id="gc" type="password" autocomplete="new-password" required></label><button class="btn" type="submit">Create account</button>');
    $('gf').onsubmit = function (e) {
      e.preventDefault();
      if ($('gp').value !== $('gc').value) return err('Passwords do not match.');
      make($('gn').value.trim(), $('gu').value, $('gp').value, 'admin', []).then(function (u) { put([u]); enter(u); });
    };
  }
  function login() {
    box('<h2>Staff sign in</h2><label>Username<input id="gu" autocomplete="username" required></label><label>Password<input id="gp" type="password" autocomplete="current-password" required></label><button class="btn" type="submit">Sign in</button>');
    $('gf').onsubmit = function (e) {
      e.preventDefault();
      var L = lock();
      if (L.until > Date.now()) return err('Too many attempts. Try again in ' + Math.ceil((L.until - Date.now()) / 1000) + ' seconds.');
      var u = users().filter(function (x) { return x.u === $('gu').value.toLowerCase().trim(); })[0];
      (u ? RFC.hash($('gp').value, u.salt) : Promise.resolve(null)).then(function (h) {
        if (u && h === u.hash) { localStorage.removeItem(LK); enter(u); }
        else { L.n = (L.n || 0) + 1; if (L.n >= 5) { L.until = Date.now() + 60000; L.n = 0; } localStorage.setItem(LK, JSON.stringify(L)); err('Wrong username or password.'); }
      });
    };
  }
  window.Auth = { users: users, save: put, make: make, out: out };
  if (!window.crypto || !crypto.subtle) { box('<h2>Secure connection needed</h2><p class="lead">Open this site over https (for example on GitHub Pages) or from localhost so sign-in can work.</p>'); return; }
  var s = sessionStorage.getItem(SK), cur = users().filter(function (x) { return x.u === s; })[0];
  if (cur) enter(cur); else if (users().length) login(); else setup();
})();
