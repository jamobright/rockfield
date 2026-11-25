(function () {
  'use strict';
  function norm(s) { return s.toUpperCase().replace(/[^A-Z0-9]/g, ''); }
  var f = document.getElementById('f'), msg = document.getElementById('msg'), out = document.getElementById('out');
  f.addEventListener('submit', function (e) {
    e.preventDefault(); out.innerHTML = '';
    if (!window.crypto || !crypto.subtle) { msg.textContent = 'Please open this page over https.'; return; }
    msg.textContent = 'Checking...';
    fetch('data/published.json', { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (d) {
        var rec = d.r[norm(document.getElementById('code').value)];
        if (!rec) throw 1;
        return RFC.dec(norm(document.getElementById('pin').value), rec);
      })
      .then(function (p) {
        msg.textContent = '';
        var n = document.createElement('div');
        n.className = 'noprint';
        n.innerHTML = '<h2></h2><p class="lead">Session ' + p.s + '. Use the button to print all results shown below.</p><div class="row"><button class="btn" id="pb">Print result</button></div>';
        n.querySelector('h2').textContent = p.n + ' (' + p.c + ')';
        out.appendChild(n);
        var w = document.createElement('div'); w.innerHTML = p.h.join(''); out.appendChild(w);
        document.getElementById('pb').onclick = function () { window.print(); };
        n.scrollIntoView({ behavior: 'smooth' });
      })
      .catch(function () { msg.textContent = 'Wrong code or PIN, or results are not published yet.'; });
  });
})();
