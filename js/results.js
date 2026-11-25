(function () {
  'use strict';
  var K = 'rockfield-results';
  var CL = ['Creche', 'Nursery 1', 'Nursery 2', 'Nursery 3', 'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6', 'JSS 1', 'JSS 2', 'JSS 3'];
  var SN = { creche: 'Creche', nursery: 'Nursery', primary: 'Primary', jss: 'Junior Secondary' };
  var DF = {
    creche: 'Numeracy,Literacy,Social Habits,Health Habits,Rhymes',
    nursery: 'Numeracy,Literacy,Science,Social Habits,Rhymes,Creative Art',
    primary: 'English Language,Mathematics,Basic Science,Social Studies,Civic Education,Computer Studies,Creative Arts,Physical Education',
    jss: 'English Language,Mathematics,Basic Science,Basic Technology,Social Studies,Civic Education,Business Studies,Computer Studies,Agricultural Science,French,Religious Studies'
  };
  var AF = 'Punctuality,Neatness,Politeness,Honesty,Attentiveness,Self-control,Relationship with others,Leadership';
  var PS = 'Handwriting,Fluency,Games,Sports,Handling of tools,Drawing and painting,Musical skills,Crafts';
  var TN = ['', '1st Term', '2nd Term', '3rd Term'];
  var user = null, tab = 'students', ui = { cls: 'Primary 1', term: 1, sub: '', stu: '' }, db = load();

  function $(i) { return document.getElementById(i); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function load() {
    var d = {};
    try { d = JSON.parse(localStorage.getItem(K)) || {}; } catch (e) {}
    d.session = d.session || '2026/2027'; d.pass = d.pass || 50; d.next = d.next || '';
    d.students = d.students || []; d.scores = d.scores || {}; d.subjects = d.subjects || {}; d.sk = d.sk || {}; d.cd = d.cd || {};
    d.aff = d.aff && d.aff.length ? d.aff : AF.split(','); d.psy = d.psy && d.psy.length ? d.psy : PS.split(',');
    for (var k in DF) if (!d.subjects[k] || !d.subjects[k].length) d.subjects[k] = DF[k].split(',');
    return d;
  }
  function save() { try { localStorage.setItem(K, JSON.stringify(db)); } catch (e) {} }

  /* data helpers */
  function sec(c) { return c.split(' ')[0].toLowerCase(); }
  function subs(c) { return db.subjects[sec(c)]; }
  function stu(c) { return db.students.filter(function (s) { return s.cls === c; }).sort(function (a, b) { return a.name.localeCompare(b.name); }); }
  function sc(t, id, x) { var r = db.scores[db.session + '|' + t]; return (r && r[id] && r[id][x]) || [null, null]; }
  function tot(a) { return a[0] == null && a[1] == null ? null : (a[0] || 0) + (a[1] || 0); }
  function gr(v) { return v >= 70 ? ['A', 'Excellent'] : v >= 60 ? ['B', 'Very Good'] : v >= 50 ? ['C', 'Good'] : v >= 45 ? ['D', 'Fair'] : v >= 40 ? ['E', 'Pass'] : ['F', 'Fail']; }
  function f1(v) { return v == null ? '' : Math.round(v * 10) / 10; }
  function nn(z) { return z != null; }
  function mean(a) { return a.length ? a.reduce(function (p, c) { return p + c; }, 0) / a.length : null; }
  function ord(n) { var s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); }
  function rank(l) {
    l.forEach(function (r) { r.pos = r.avg == null ? null : 1 + l.filter(function (o) { return o.avg != null && o.avg > r.avg; }).length; });
    return l;
  }
  function nxt(c) { var i = CL.indexOf(c); return i < CL.length - 1 ? CL[i + 1] : 'SS 1'; }
  function summ(c, t) {
    var x = subs(c);
    return rank(stu(c).map(function (s) {
      var v = x.map(function (y) { return tot(sc(t, s.id, y)); }).filter(nn);
      return { s: s, n: v.length, sum: v.reduce(function (p, q) { return p + q; }, 0), avg: mean(v) };
    }));
  }
  function cum(c) {
    var x = subs(c);
    return rank(stu(c).map(function (s) {
      var rows = x.map(function (y) {
        var v = [1, 2, 3].map(function (t) { return tot(sc(t, s.id, y)); });
        return { x: y, v: v, avg: mean(v.filter(nn)) };
      });
      return {
        s: s, rows: rows,
        t: [0, 1, 2].map(function (k) { return mean(rows.map(function (o) { return o.v[k]; }).filter(nn)); }),
        avg: mean(rows.map(function (o) { return o.avg; }).filter(nn))
      };
    }));
  }

  /* printable cards */
function mm(v) { v = v.filter(nn); return v.length ? [Math.min.apply(0, v), Math.max.apply(0, v)] : ['', '']; }
  function skl(t, id) { var r = db.sk[db.session + '|' + t]; return (r && r[id]) || {}; }
  function setsk(t, id, f, v) {
    var key = db.session + '|' + t; db.sk[key] = db.sk[key] || {};
    var o = db.sk[key][id] = db.sk[key][id] || {}; o.r = o.r || {};
    if (f.charAt(0) === '#') { var n = f.slice(1); if (v) o.r[n] = v; else delete o.r[n]; } else o[f] = v;
    save();
  }
  function head(t) {
    return '<div class="rh"><img src="images/logo.png" alt="" width="68"><div><h2>ROCKFIELD SCHOOLS</h2><p class="sx">Creche | Nursery | Primary | Junior Secondary</p><p>3, Salau Adetola Close, Olopo Meji B/Stop, Odogunyan, Ikorodu, Lagos<br>Tel: 09033957680</p><p><i>Hardwork and Honesty</i></p></div></div><h3>' + t + '</h3>';
  }
  function info(s, c) { return '<p class="ri"><b>Name:</b> ' + esc(s.name) + ' &nbsp; <b>Class:</b> ' + c + ' &nbsp; <b>Session:</b> ' + esc(db.session) + '</p>'; }
  function sign(c) { return '<div class="sg"><span>Class teacher</span><span>' + (sec(c) === 'jss' ? 'Principal' : 'Head teacher') + '</span></div>'; }
  function skHTML(t, id) {
    var r = skl(t, id).r || {};
    function tb(h, l) { return '<table class="tbl"><tr><th>' + h + '</th><th>Rating</th></tr>' + l.map(function (x) { return '<tr><td>' + esc(x) + '</td><td>' + (r[x] || '') + '</td></tr>'; }).join('') + '</table>'; }
    return '<div class="two">' + tb('Affective domain', db.aff) + tb('Psychomotor skills', db.psy) + '</div><p class="ky">Key: 5 Excellent, 4 Very Good, 3 Good, 2 Fair, 1 Poor</p>';
  }
  function cmHTML(t, id, c) {
    var k = skl(t, id);
    function b(l, v) { return '<div class="cm"><b>' + l + ':</b> ' + esc(v || '') + '</div>'; }
    return b('Class teacher’s comment', k.tc) + b((sec(c) === 'jss' ? 'Principal' : 'Head teacher') + '’s comment', k.hm);
  }
  function termCard(r, c, t, n) {
    var rows = subs(c).map(function (y) {
      var a = sc(t, r.s.id, y), T = tot(a), g = T == null ? ['', ''] : gr(T);
      var m = mm(stu(c).map(function (s) { return tot(sc(t, s.id, y)); }));
      return '<tr><td>' + esc(y) + '</td><td>' + (a[0] == null ? '' : a[0]) + '</td><td>' + (a[1] == null ? '' : a[1]) + '</td><td>' + (T == null ? '' : T) + '</td><td>' + m[0] + '</td><td>' + m[1] + '</td><td>' + g[0] + '</td><td>' + g[1] + '</td></tr>';
    }).join('');
    var g = r.avg == null ? ['', ''] : gr(r.avg), k = skl(t, r.s.id);
    return '<div class="report">' + head(TN[t] + ' Result') + info(r.s, c) +
      '<table class="tbl"><tr><th>Subject</th><th>CA (40)</th><th>Exam (60)</th><th>Total (100)</th><th>Min</th><th>Max</th><th>Grade</th><th>Remark</th></tr>' + rows + '</table>' +
      '<p class="ky">Min and Max are the lowest and highest total scores in the class for the subject.</p>' +
      '<p class="ri"><b>Total:</b> ' + r.sum + ' &nbsp; <b>Average:</b> ' + f1(r.avg) + ' &nbsp; <b>Grade:</b> ' + g[0] + ' (' + g[1] + ') &nbsp; <b>Position:</b> ' + (r.pos ? ord(r.pos) + ' of ' + n : '-') + '</p>' +
      '<p class="ri"><b>Attendance:</b> present ' + (k.pr || '-') + ' of ' + (k.op || '-') + ' days' + (db.next ? ' &nbsp; <b>Next term begins:</b> ' + esc(db.next) : '') + '</p>' +
      skHTML(t, r.s.id) + cmHTML(t, r.s.id, c) + sign(c) + '</div>';
  }
  function decision(r, c) {
    return r.avg == null ? '-' : r.avg >= db.pass ? 'Promoted to ' + nxt(c) : 'Not promoted. To repeat ' + c;
  }
  function cumCard(r, c, m) {
    var j = -1, rows = r.rows.map(function (o) {
      j++; var jj = j, g = o.avg == null ? ['', ''] : gr(o.avg), x = mm(m.map(function (q) { return q.rows[jj].avg; }));
      return '<tr><td>' + esc(o.x) + '</td>' + o.v.map(function (v) { return '<td>' + (v == null ? '' : v) + '</td>'; }).join('') + '<td>' + f1(o.avg) + '</td><td>' + f1(x[0]) + '</td><td>' + f1(x[1]) + '</td><td>' + g[0] + '</td><td>' + g[1] + '</td></tr>';
    }).join('');
    return '<div class="report">' + head('Cumulative Result: 1st, 2nd and 3rd Term') + info(r.s, c) +
      '<table class="tbl"><tr><th>Subject</th><th>1st Term</th><th>2nd Term</th><th>3rd Term</th><th>Average</th><th>Min</th><th>Max</th><th>Grade</th><th>Remark</th></tr>' + rows + '</table>' +
      '<p class="ky">Min and Max are the lowest and highest cumulative averages in the class for the subject.</p>' +
      '<p class="ri"><b>Cumulative average:</b> ' + f1(r.avg) + ' &nbsp; <b>Position:</b> ' + (r.pos ? ord(r.pos) + ' of ' + m.length : '-') + '</p>' +
      '<p class="ri"><b>Decision:</b> ' + decision(r, c) + '</p>' + cmHTML(3, r.s.id, c) + sign(c) + '</div>';
  }
    function pr(h) { $('sheet').innerHTML = h; window.print(); }

  /* panels */
  function pStudents() {
    var l = stu(ui.cls);
    return '<h2>' + ui.cls + ': ' + l.length + ' student(s)</h2>' +
      '<label class="blk">Add students, one full name per line<textarea id="names" rows="4"></textarea></label><button class="btn" data-a="add">Add students</button>' +
      (l.length ? '<table class="tbl"><tr><th>#</th><th>Name</th><th></th></tr>' + l.map(function (s, i) {
        return '<tr><td>' + (i + 1) + '</td><td>' + esc(s.name) + '</td><td><button class="lnk" data-a="del" data-i="' + s.id + '">Remove</button></td></tr>';
      }).join('') + '</table>' : '<p class="lead">No students in this class yet.</p>');
  }
  function pScores() {
    var x = subs(ui.cls), l = stu(ui.cls);
    if (x.indexOf(ui.sub) < 0) ui.sub = x[0];
    var inp = function (v, k, m) { return '<td><input class="n" type="number" min="0" max="' + m + '" step="any" inputmode="decimal" data-k="' + k + '" value="' + (v == null ? '' : v) + '"></td>'; };
    return '<h2>Enter scores: ' + TN[ui.term] + ', ' + esc(db.session) + '</h2><label class="blk">Subject<select id="sub">' +
      x.map(function (y) { return '<option' + (y === ui.sub ? ' selected' : '') + '>' + esc(y) + '</option>'; }).join('') + '</select></label>' +
      (l.length ? '<div class="ov"><table class="tbl"><tr><th>Student</th><th>CA (40)</th><th>Exam (60)</th><th>Total</th><th>Grade</th></tr>' + l.map(function (s) {
        var a = sc(ui.term, s.id, ui.sub), T = tot(a);
        return '<tr data-id="' + s.id + '"><td>' + esc(s.name) + '</td>' + inp(a[0], 0, 40) + inp(a[1], 1, 60) + '<td class="t">' + (T == null ? '' : T) + '</td><td class="g">' + (T == null ? '' : gr(T)[0]) + '</td></tr>';
      }).join('') + '</table></div><p class="lead">Scores save automatically as you type.</p>' : '<p class="lead">Add students to this class first.</p>');
  }
  function pTerm() {
    var l = summ(ui.cls, ui.term);
    return '<h2>' + ui.cls + ': ' + TN[ui.term] + ' results</h2>' + (l.length ? '<div class="row"><button class="btn" data-a="ptall">Print all results</button></div><div class="ov"><table class="tbl"><tr><th>Student</th><th>Subjects scored</th><th>Total</th><th>Average</th><th>Position</th><th></th></tr>' +
      l.map(function (r) {
        return '<tr><td>' + esc(r.s.name) + '</td><td>' + r.n + '</td><td>' + r.sum + '</td><td>' + (f1(r.avg) || '-') + '</td><td>' + (r.pos ? ord(r.pos) : '-') + '</td><td><button class="lnk" data-a="pt" data-i="' + r.s.id + '">Print</button></td></tr>';
      }).join('') + '</table></div>' : '<p class="lead">Add students and scores first.</p>');
  }
  function pCum() {
    var l = cum(ui.cls);
    return '<h2>' + ui.cls + ': cumulative for ' + esc(db.session) + '</h2><p class="lead">Averages across the three terms. Promotion mark is ' + db.pass + '% (change it in Settings).</p>' + (l.length ? '<div class="row"><button class="btn" data-a="pcall">Print all cumulative results</button></div><div class="ov"><table class="tbl"><tr><th>Student</th><th>1st</th><th>2nd</th><th>3rd</th><th>Cumulative</th><th>Position</th><th>Decision</th><th></th></tr>' +
      l.map(function (r) {
        return '<tr><td>' + esc(r.s.name) + '</td>' + r.t.map(function (v) { return '<td>' + (f1(v) || '-') + '</td>'; }).join('') + '<td>' + (f1(r.avg) || '-') + '</td><td>' + (r.pos ? ord(r.pos) : '-') + '</td><td>' + decision(r, ui.cls) + '</td><td><button class="lnk" data-a="pc" data-i="' + r.s.id + '">Print</button></td></tr>';
      }).join('') + '</table></div>' : '<p class="lead">Add students and scores first.</p>');
  }
  function adm() { return user && user.role === 'admin'; }
  function gen(pre, n) { var A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', r = crypto.getRandomValues(new Uint8Array(n)), o = pre; for (var i = 0; i < n; i++) o += A[r[i] % 32]; return o; }
  function codes() { db.students.forEach(function (s) { if (!db.cd[s.id]) db.cd[s.id] = { c: gen('RF', 6), p: gen('', 10) }; }); save(); }
  function fc(c) { return c.slice(0, 2) + '-' + c.slice(2); }
  function fp(p) { return p.slice(0, 5) + '-' + p.slice(5); }
  function slips(c) {
    codes();
    var url = new URL('check-result.html', location.href).href;
    pr('<div class="slips">' + stu(c).map(function (s) {
      var k = db.cd[s.id];
      return '<div class="slip"><b>ROCKFIELD SCHOOLS</b><br>Result checking details<br><br><b>Name:</b> ' + esc(s.name) + '<br><b>Class:</b> ' + c + '<br><b>Student code:</b> <span class="cd">' + fc(k.c) + '</span><br><b>PIN:</b> <span class="cd">' + fp(k.p) + '</span><br><br>Go to ' + esc(url) + ', enter the code and PIN, then print your result.<br><i>Keep the PIN private.</i></div>';
    }).join('') + '</div>');
  }
  function publishAll() {
    codes();
    var by = {}, cards = {};
    db.students.forEach(function (s) { (by[s.cls] = by[s.cls] || []).push(s); });
    Object.keys(by).forEach(function (c) {
      [1, 2, 3].forEach(function (t) {
        var l = summ(c, t);
        l.forEach(function (r) { if (r.n) (cards[r.s.id] = cards[r.s.id] || []).push(termCard(r, c, t, l.length)); });
      });
      var m = cum(c);
      m.forEach(function (r) { if (r.avg != null) (cards[r.s.id] = cards[r.s.id] || []).push(cumCard(r, c, m)); });
    });
    var out = { v: 1, session: db.session, date: new Date().toISOString().slice(0, 10), r: {} }, list = db.students.filter(function (s) { return cards[s.id]; });
    return Promise.all(list.map(function (s) {
      var k = db.cd[s.id];
      return RFC.enc(k.p, { n: s.name, c: s.cls, s: db.session, h: cards[s.id] }).then(function (e) { out.r[k.c] = e; });
    })).then(function () {
      var u = URL.createObjectURL(new Blob([JSON.stringify(out)], { type: 'application/json' })), d = document.createElement('a');
      d.href = u; d.download = 'published.json'; d.click(); URL.revokeObjectURL(u);
      return list.length;
    });
  }
  function pPub() {
    return '<h2>Publish results for students</h2><p class="lead">Every student gets a code and a private PIN. Results are encrypted, so only the student with the right PIN can open them.</p><ol><li>Print the PIN slips for each class and give every student theirs.</li><li>Click Publish. It downloads one published.json file for the whole school.</li><li>Upload that file to the website’s data folder, replacing the old one. Students then use the Check result page.</li></ol><div class="row"><button class="btn" data-a="slips">Print PIN slips for ' + ui.cls + '</button><button class="btn" data-a="publish">Publish all results</button></div><p id="pmsg" class="lead"></p>';
  }
  function pUsers() {
    var us = Auth.users();
    return '<h2>Staff accounts</h2><div class="ov"><table class="tbl"><tr><th>Name</th><th>Username</th><th>Role</th><th>Classes</th><th></th></tr>' + us.map(function (x) {
      return '<tr><td>' + esc(x.name) + '</td><td>' + esc(x.u) + '</td><td>' + x.role + '</td><td>' + (x.role === 'admin' ? 'All' : (esc((x.cls || []).join(', ')) || '-')) + '</td><td><button class="lnk" data-a="ures" data-i="' + esc(x.u) + '">Reset password</button> ' + (x.u === user.u ? '' : '<button class="lnk" data-a="udel" data-i="' + esc(x.u) + '">Remove</button>') + '</td></tr>';
    }).join('') + '</table></div><h2>Add an account</h2><label class="blk">Full name<input id="un"></label><label class="blk">Username<input id="uu" autocomplete="off"></label><label class="blk">Password (8 or more characters)<input id="up" type="password" autocomplete="new-password"></label><label class="blk">Role<select id="ur"><option value="teacher">Teacher (own classes only)</option><option value="admin">Administrator</option></select></label><p class="lead">Classes this teacher can use:</p><div class="g3">' +
      CL.map(function (c) { return '<label><input type="checkbox" data-c="' + c + '"> ' + c + '</label>'; }).join('') + '</div><div class="row"><button class="btn" data-a="uadd">Add account</button></div>';
  }
  function pSkills() {
    var l = stu(ui.cls);
    if (!l.length) return '<h2>Skills and comments</h2><p class="lead">Add students to this class first.</p>';
    if (!l.some(function (s) { return s.id === ui.stu; })) ui.stu = l[0].id;
    var k = skl(ui.term, ui.stu), r = k.r || {}, jss = sec(ui.cls) === 'jss';
    function sel(x) { return '<label class="blk">' + esc(x) + '<select data-r="' + esc(x) + '"><option value="">-</option>' + [5, 4, 3, 2, 1].map(function (v) { return '<option' + (r[x] == v ? ' selected' : '') + '>' + v + '</option>'; }).join('') + '</select></label>'; }
    function inp(l2, f) { return '<label class="blk">' + l2 + '<input type="number" min="0" data-f="' + f + '" value="' + (k[f] || '') + '"></label>'; }
    function ta(l2, f) { return '<label class="blk wide">' + l2 + '<textarea rows="3" data-f="' + f + '">' + esc(k[f] || '') + '</textarea></label>'; }
    return '<h2>Skills and comments: ' + TN[ui.term] + '</h2><label class="blk">Student<select id="stu">' + l.map(function (s) { return '<option value="' + s.id + '"' + (s.id === ui.stu ? ' selected' : '') + '>' + esc(s.name) + '</option>'; }).join('') + '</select></label>' +
      '<p class="lead">Rate each trait: 5 Excellent, 4 Very Good, 3 Good, 2 Fair, 1 Poor. Changes save automatically.</p><h2>Affective domain</h2><div class="g3">' + db.aff.map(function (x) { return sel(x); }).join('') + '</div><h2>Psychomotor skills</h2><div class="g3">' + db.psy.map(function (x) { return sel(x); }).join('') + '</div>' +
      '<h2>Attendance</h2><div class="row">' + inp('Times school opened', 'op') + inp('Times present', 'pr') + '</div><h2>Comments</h2>' + ta('Class teacher’s comment', 'tc') + ta(jss ? 'Principal’s comment' : 'Head teacher’s comment', 'hm');
  }
  function pSettings() {
    return '<h2>Settings</h2><label class="blk">Promotion pass mark (cumulative average)<input id="pass" type="number" min="0" max="100" value="' + db.pass + '"></label>' +
      '<label class="blk">Next term begins (printed on term results)<input id="next" value="' + esc(db.next) + '" placeholder="e.g. 12 January 2027"></label><h2>Subjects (separate with commas)</h2>' +
      Object.keys(SN).map(function (k) { return '<label class="blk">' + SN[k] + '<textarea rows="2" data-s="' + k + '">' + esc(db.subjects[k].join(', ')) + '</textarea></label>'; }).join('') +
      '<h2>Skills lists (separate with commas)</h2><label class="blk">Affective domain<textarea rows="2" data-t="aff">' + esc(db.aff.join(', ')) + '</textarea></label><label class="blk">Psychomotor skills<textarea rows="2" data-t="psy">' + esc(db.psy.join(', ')) + '</textarea></label>' +
      '<h2>Backup</h2><div class="row"><button class="btn" data-a="exp">Download backup</button><label class="btn alt" style="cursor:pointer">Restore backup<input id="imp" type="file" accept=".json" hidden></label></div>';
  }

  function render() {
    $('ses').value = db.session; $('ses').disabled = !adm(); $('term').value = ui.term; $('cls').value = ui.cls;
    Array.prototype.forEach.call(document.querySelectorAll('.tabs button'), function (b) { b.classList.toggle('on', b.dataset.i === tab); });
    $('panel').innerHTML = { students: pStudents, scores: pScores, skills: pSkills, pub: pPub, users: pUsers, term: pTerm, cum: pCum, settings: pSettings }[tab]();
  }

  /* events */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-a]'); if (!b) return;
    var a = b.dataset.a, i = b.dataset.i, c = ui.cls, t = ui.term, n;
    if (a === 'tab') { if (!adm() && (i === 'pub' || i === 'users' || i === 'settings')) return; tab = i; render(); }
    else if (a === 'slips') slips(c);
    else if (a === 'publish') {
      $('pmsg').textContent = 'Encrypting results, please wait...';
      publishAll().then(function (k) { $('pmsg').textContent = 'Done: ' + k + ' student(s) published. Upload the downloaded published.json to the data folder.'; }, function () { $('pmsg').textContent = 'Publishing failed. Try again.'; });
    } else if (a === 'uadd') {
      var nm = $('un').value.trim(), us = $('uu').value.trim().toLowerCase(), pw = $('up').value;
      if (!nm || !us || pw.length < 8) return alert('Enter a name, a username and a password of 8 or more characters.');
      if (Auth.users().some(function (x) { return x.u === us; })) return alert('That username is taken.');
      var cl = [].slice.call(document.querySelectorAll('[data-c]')).filter(function (x) { return x.checked; }).map(function (x) { return x.dataset.c; });
      Auth.make(nm, us, pw, $('ur').value, cl).then(function (u) { var l2 = Auth.users(); l2.push(u); Auth.save(l2); render(); });
    } else if (a === 'ures') {
      var p2 = prompt('New password for this account (8 or more characters):');
      if (p2 && p2.length >= 8) { var l3 = Auth.users(), t3 = l3.filter(function (x) { return x.u === i; })[0]; Auth.make(t3.name, t3.u, p2, t3.role, t3.cls).then(function (u) { l3[l3.indexOf(t3)] = u; Auth.save(l3); alert('Password changed.'); }); }
    } else if (a === 'udel') {
      if (i !== user.u && confirm('Remove this account?')) { Auth.save(Auth.users().filter(function (x) { return x.u !== i; })); render(); }
    }
    else if (a === 'add') {
      $('names').value.split('\n').forEach(function (nm) { nm = nm.trim(); if (nm) db.students.push({ id: 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name: nm, cls: c }); });
      save(); render();
    } else if (a === 'del') {
      if (confirm('Remove this student and their scores?')) { db.students = db.students.filter(function (s) { return s.id !== i; }); save(); render(); }
    } else if (a === 'pt' || a === 'ptall') {
      var l = summ(c, t); n = l.length;
      pr(l.filter(function (r) { return a === 'ptall' || r.s.id === i; }).map(function (r) { return termCard(r, c, t, n); }).join(''));
    } else if (a === 'pc' || a === 'pcall') {
      var m = cum(c);
      pr(m.filter(function (r) { return a === 'pcall' || r.s.id === i; }).map(function (r) { return cumCard(r, c, m); }).join(''));
    } else if (a === 'exp') {
      var u = URL.createObjectURL(new Blob([JSON.stringify(db)], { type: 'application/json' })), d = document.createElement('a');
      d.href = u; d.download = 'rockfield-results-backup.json'; d.click(); URL.revokeObjectURL(u);
    }
  });
  document.addEventListener('input', function (e) {
    var el = e.target; if (!el.classList.contains('n')) return;
    var tr = el.closest('tr'), id = tr.dataset.id, k = +el.dataset.k, max = k ? 60 : 40;
    var v = el.value === '' ? null : Math.min(max, Math.max(0, Math.round(+el.value * 10) / 10));
    var key = db.session + '|' + ui.term;
    db.scores[key] = db.scores[key] || {};
    var o = db.scores[key][id] = db.scores[key][id] || {};
    var a = o[ui.sub] = o[ui.sub] || [null, null];
    a[k] = v; if (v !== null && +el.value !== v) el.value = v;
    save();
    var T = tot(a); tr.querySelector('.t').textContent = T == null ? '' : T; tr.querySelector('.g').textContent = T == null ? '' : gr(T)[0];
  });
  document.addEventListener('change', function (e) {
    var el = e.target, id = el.id;
    if (id === 'ses') { db.session = el.value.trim() || db.session; save(); render(); }
    else if (id === 'term') { ui.term = +el.value; render(); }
    else if (id === 'cls') { ui.cls = el.value; render(); }
    else if (id === 'stu') { ui.stu = el.value; render(); }
    else if (el.dataset.r) { setsk(ui.term, ui.stu, '#' + el.dataset.r, el.value); }
    else if (el.dataset.f) { setsk(ui.term, ui.stu, el.dataset.f, el.value.trim()); }
    else if (el.dataset.t) { var w = el.value.split(',').map(function (z) { return z.trim(); }).filter(Boolean); if (w.length) { db[el.dataset.t] = w; save(); } }
    else if (id === 'sub') { ui.sub = el.value; render(); }
    else if (id === 'pass') { db.pass = Math.min(100, Math.max(0, +el.value || 50)); save(); }
    else if (id === 'next') { db.next = el.value.trim(); save(); }
    else if (el.dataset.s) { var v = el.value.split(',').map(function (z) { return z.trim(); }).filter(Boolean); if (v.length) { db.subjects[el.dataset.s] = v; save(); } }
    else if (id === 'imp' && el.files[0]) {
      var r = new FileReader();
      r.onload = function () { try { var d = JSON.parse(r.result); if (!d.students) throw 0; localStorage.setItem(K, JSON.stringify(d)); db = load(); render(); alert('Backup restored.'); } catch (x) { alert('That file is not a valid backup.'); } };
      r.readAsText(el.files[0]);
    }
  });

  window.startPortal = function (u) {
    user = u;
    var allowed = adm() ? CL : (u.cls || []);
    $('gate').hidden = true; $('app').hidden = false;
    $('lo').hidden = false; $('lo').onclick = function (e) { e.preventDefault(); Auth.out(); };
    Array.prototype.forEach.call(document.querySelectorAll('.tabs button[data-adm]'), function (b) { b.hidden = !adm(); });
    if (!allowed.length) { $('panel').innerHTML = '<p class="lead">No classes have been assigned to your account yet. Ask the administrator.</p>'; return; }
    $('cls').innerHTML = Object.keys(SN).map(function (k) {
      var o = CL.filter(function (c) { return sec(c) === k && allowed.indexOf(c) > -1; });
      return o.length ? '<optgroup label="' + SN[k] + '">' + o.map(function (c) { return '<option>' + c + '</option>'; }).join('') + '</optgroup>' : '';
    }).join('');
    ui.cls = allowed[0]; render();
  };
})();
