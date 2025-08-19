// Production-only redirect logic for locale paths
(function() {
  try {
    // Normalize GitHub Pages SPA fallback: /?p=/path -> /path (no reload)
    try {
      var u = new URL(window.location.href);
      var p = u.searchParams.get('p');
      if (p) {
        var q = u.searchParams.get('q');
        var target = decodeURIComponent(p) + (q ? ('?' + decodeURIComponent(q)) : '') + (u.hash || '');
        window.history.replaceState(null, '', target);
      }
    } catch (_) {}

    var path = window.location.pathname || '/';
    if (path === '/') {
      var pref = localStorage.getItem('octalysisLocale');
      if (pref === '"ru"' || pref === 'ru') { window.location.replace('/ru/'); return; }
      if (!pref) {
        var langs = (navigator.languages || [navigator.language || '']).map(function(x){ return (x||'').toLowerCase(); });
        var isRuLang = langs.some(function(l){ return l.startsWith('ru'); });
        var tz = (Intl.DateTimeFormat().resolvedOptions().timeZone || '').toString();
        var ruTZ = ['Europe/Kaliningrad','Europe/Moscow','Europe/Simferopol','Europe/Kirov','Europe/Volgograd','Europe/Astrakhan','Europe/Saratov','Europe/Ulyanovsk','Asia/Yekaterinburg','Asia/Omsk','Asia/Novosibirsk','Asia/Barnaul','Asia/Tomsk','Asia/Novokuznetsk','Asia/Krasnoyarsk','Asia/Irkutsk','Asia/Chita','Asia/Yakutsk','Asia/Khandyga','Asia/Vladivostok','Asia/Ust-Nera','Asia/Magadan','Asia/Sakhalin','Asia/Srednekolymsk','Asia/Kamchatka','Asia/Anadyr'];
        var isRuTZ = ruTZ.indexOf(tz) >= 0;
        if (isRuLang || isRuTZ) { window.location.replace('/ru/'); }
      }
    }
  } catch (e) { /* ignore */ }
})();

