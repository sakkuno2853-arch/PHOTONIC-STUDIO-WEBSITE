/* ==========================================================================
   APP.JS — the engine that builds every page from site-content.js
   You do not need to edit this file. Edit site-content.js instead.
   ========================================================================== */
(function () {
  "use strict";
  Array.prototype.slice.call(document.querySelectorAll("body style, body link[rel=stylesheet]")).forEach(function(e){document.head.appendChild(e);});
  var S = window.SITE;
  if (!S) { document.body.innerHTML = "<p style='padding:40px;color:#fff'>site-content.js could not be loaded. Make sure it is in the same folder as the pages.</p>"; return; }

  var PAGE = document.body.getAttribute("data-page") || "home";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- helpers ---------- */
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  // "Line one\n*gold italic*"  ->  safe HTML
  function fmt(s) { return esc(s).replace(/\\n|\n/g, "<br>").replace(/\*(.+?)\*/g, "<em>$1</em>"); }
  function waLink(msg) { return "https://wa.me/" + S.contact.whatsappNumber + "?text=" + encodeURIComponent(msg || S.contact.whatsappMessage); }
  function arrow() { return "<span class='arr'>↗</span>"; }
  function btn(b, cls) { return b && b.label ? "<a class='button " + (cls || "light") + "' href='" + esc(b.link) + "'>" + esc(b.label) + " " + arrow() + "</a>" : ""; }
  function img(src, alt, extra) { return "<img src='" + esc(src) + "' alt='" + esc(alt || "") + "' loading='lazy' decoding='async' " + (extra || "") + " onerror=\"this.classList.add('img-missing')\">"; }
  function label(t) { return "<div class='section-label'>" + esc(t) + "</div>"; }
  function sectionHead(lab, title, text, btnObj, light) {
    return label(lab) + "<div class='section-head'><h2>" + fmt(title) + "</h2>" + (text || btnObj ? "<div class='sh-side'>" + (text ? "<p>" + esc(text) + "</p>" : "") + (btnObj ? btn(btnObj, light ? "dark" : "outline") : "") + "</div>" : "") + "</div>";
  }

  /* ---------- video detection (YouTube / Vimeo / own file) ---------- */
  function parseVideo(url) {
    url = String(url || "");
    var m = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/i);
    if (m) return { type: "youtube", id: m[1] };
    m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
    if (m) return { type: "vimeo", id: m[1] };
    return { type: "file", src: url };
  }
  function videoThumb(v) {
    if (v.thumb) return "<img src='" + esc(v.thumb) + "' alt='" + esc(v.title) + "' loading='lazy' onerror=\"this.classList.add('img-missing')\">";
    var p = parseVideo(v.url);
    if (p.type === "youtube") return "<img src='https://i.ytimg.com/vi/" + p.id + "/hqdefault.jpg' alt='" + esc(v.title) + "' loading='lazy'>";
    if (p.type === "file") return "<video src='" + esc(p.src) + "#t=0.8' preload='metadata' muted playsinline></video>";
    return "<div class='thumb-fallback'></div>";
  }
  function playerHTML(url, auto) {
    var p = parseVideo(url);
    if (p.type === "youtube") return "<iframe src='https://www.youtube-nocookie.com/embed/" + p.id + "?autoplay=1&rel=0&modestbranding=1' allow='autoplay; encrypted-media; picture-in-picture; fullscreen' allowfullscreen title='Video'></iframe>";
    if (p.type === "vimeo") return "<iframe src='https://player.vimeo.com/video/" + p.id + "?autoplay=1' allow='autoplay; fullscreen; picture-in-picture' allowfullscreen title='Video'></iframe>";
    return "<video src='" + esc(p.src) + "' controls autoplay playsinline></video>";
  }
  function filmCard(v) {
    return "<article class='film-card" + (v.vertical ? " vertical" : "") + "' data-video='" + esc(v.url) + "' data-vertical='" + (v.vertical ? 1 : 0) + "' tabindex='0' role='button' aria-label='Play " + esc(v.title) + "'>" +
      "<div class='film-thumb'>" + videoThumb(v) + "<span class='play'><svg viewBox='0 0 24 24' width='22' height='22'><path d='M8 5v14l11-7z' fill='currentColor'/></svg></span>" +
      (v.duration ? "<span class='dur'>" + esc(v.duration) + "</span>" : "") + "</div>" +
      "<div class='film-meta'><small>" + esc(v.category || "") + "</small><h3>" + esc(v.title) + "</h3></div></article>";
  }
  function photoItem(p) {
    return "<figure class='ph-item " + esc(p.size || "normal") + "' data-lb data-src='" + esc(p.src) + "' data-title='" + esc(p.title || "") + "' data-cat='" + esc(p.category || "") + "' tabindex='0'>" +
      img(p.src, p.title) + "<figcaption><span>" + esc(p.category || "") + "</span><b>" + esc(p.title || "") + "</b></figcaption></figure>";
  }

  /* ---------- shared pieces ---------- */
  function logoHTML() {
    var b = S.brand;
    if (b.logoImage) return "<a class='logo has-img' href='index.html' aria-label='" + esc(b.fullName) + "'><img src='" + esc(b.logoImage) + "' alt='" + esc(b.fullName) + "'></a>";
    var mark = b.logoMark ? "<img class='logo-mark' src='" + esc(b.logoMark) + "' alt='' onerror=\"this.remove()\">" : "";
    return "<a class='logo' href='index.html' aria-label='" + esc(b.fullName) + "'>" + mark + "<b>" + esc(b.name) + "<span>" + esc(b.dot) + "</span></b></a>";
  }
  function header() {
    var cur = { home: "index.html", about: "about.html", services: "services.html", portfolio: "portfolio.html", films: "films.html", packages: "packages.html", contact: "contact.html" }[PAGE];
    var links = S.menu.map(function (m) { return "<a href='" + esc(m.link) + "'" + (m.link === cur ? " class='active'" : "") + ">" + esc(m.label) + "</a>"; }).join("");
    return "<header class='nav' id='nav'>" + logoHTML() +
      "<nav id='menu' aria-label='Main'>" + links + "</nav>" +
      "<a class='nav-cta' href='" + esc(S.menuButton.link) + "'>" + esc(S.menuButton.label) + "</a>" +
      "<button class='menu-toggle' id='menuToggle' aria-label='Open menu' aria-expanded='false'><span></span><span></span></button></header>";
  }
  var WA_PATH = "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z";
  // Brand logos in their official colours
  function brandIcon(k) {
    var o = "<svg class='ico' viewBox='0 0 24 24' aria-hidden='true'>";
    if (k === "instagram") return o + "<defs><radialGradient id='igG' cx='.3' cy='1.07' r='1.2'><stop offset='0' stop-color='#fd5'/><stop offset='.1' stop-color='#fd5'/><stop offset='.5' stop-color='#ff543e'/><stop offset='1' stop-color='#c837ab'/></radialGradient></defs><rect x='0' y='0' width='24' height='24' rx='6.2' fill='url(#igG)'/><rect x='4.4' y='4.4' width='15.2' height='15.2' rx='4.3' fill='none' stroke='#fff' stroke-width='1.7'/><circle cx='12' cy='12' r='3.6' fill='none' stroke='#fff' stroke-width='1.7'/><circle cx='16.6' cy='7.4' r='1.05' fill='#fff'/></svg>";
    if (k === "facebook") return o + "<circle cx='12' cy='12' r='11' fill='#fff'/><path fill='#1877F2' d='M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z'/></svg>";
    if (k === "youtube") return o + "<polygon points='9.545,15.568 9.545,8.432 15.818,12' fill='#fff'/><path fill='#FF0000' d='M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z'/></svg>";
    if (k === "whatsapp") return o + "<circle cx='12' cy='12' r='12' fill='#25D366'/><g transform='translate(3.6 3.6) scale(.7)'><path fill='#fff' d='" + WA_PATH + "'/></g></svg>";
    return "";
  }
  function footer() {
    var c = S.contact, so = S.social, f = S.footer;
    var explore = S.menu.map(function (m) { return "<a href='" + esc(m.link) + "'>" + esc(m.label) + "</a>"; }).join("");
    var socials = ["instagram", "facebook", "youtube", "pinterest"].filter(function (k) { return so[k]; })
      .map(function (k) { return "<a class='soc' href='" + esc(so[k]) + "' target='_blank' rel='noopener'>" + brandIcon(k) + "<span>" + k.charAt(0).toUpperCase() + k.slice(1) + "</span></a>"; }).join("");
    return "<footer><div class='footer-big'>" + esc(S.brand.name) + "</div><div class='footer-top'>" +
      "<div class='f-col f-brand'>" + logoHTML() + "<p>" + esc(f.blurb) + "</p></div>" +
      "<div class='f-col'><h4>Explore</h4>" + explore + "</div>" +
      "<div class='f-col'><h4>Contact</h4><a href='tel:" + esc(c.phoneLink) + "'>" + esc(c.phoneDisplay) + "</a><a href='mailto:" + esc(c.email) + "'>" + esc(c.email) + "</a><span>" + esc(c.addressLine) + "</span><span>" + esc(c.hours) + "</span></div>" +
      "<div class='f-col'><h4>Follow</h4>" + socials + "<a class='soc' href='" + waLink() + "' target='_blank' rel='noopener'>" + brandIcon("whatsapp") + "<span>WhatsApp</span></a></div></div>" +
      "<div class='footer-bottom'><span>© " + new Date().getFullYear() + " " + esc(S.brand.fullName) + ". " + esc(f.copyright) + (f.credit ? " • " + esc(f.credit) : "") + "</span><a href='#top' id='toTop'>Back to top ↑</a></div></footer>";
  }
  // Official-style WhatsApp glyph (green circle, white speech bubble with phone)
  function whatsappBtn() {
    return "<a class='whatsapp' href='" + waLink() + "' target='_blank' rel='noopener' aria-label='Chat on WhatsApp'>" +
      "<span class='wa-tip'>Chat with us</span>" +
      "<svg viewBox='0 0 24 24' width='34' height='34' role='img' aria-hidden='true'><path fill='#fff' d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z'/></svg></a>";
  }
  function pageHero(h) {
    return "<section class='page-hero'><div class='ph-bg'>" + img(h.heroImage, "", "fetchpriority='high'").replace("loading='lazy'", "") + "</div><div class='ph-shade'></div>" +
      "<div class='ph-content reveal'><p class='eyebrow'>" + esc(S.brand.fullName) + "</p><h1>" + fmt(h.heroTitle) + "</h1><p>" + esc(h.heroText) + "</p></div></section>";
  }
  function faqSection(light) {
    var f = S.faq;
    return "<section class='section faq" + (light ? " light" : "") + "'>" + label(f.label) + "<div class='faq-grid'><h2>" + fmt(f.title) + "</h2><div>" +
      f.items.map(function (i, n) { return "<details" + (n === 0 ? " open" : "") + "><summary>" + esc(i.q) + "</summary><p>" + esc(i.a) + "</p></details>"; }).join("") + "</div></div></section>";
  }
  function ctaBand(c) {
    return "<section class='cta-band'><div class='cta-inner reveal'><h2>" + fmt(c.title) + "</h2><p>" + esc(c.text) + "</p>" + btn(c.button, "light") + "</div></section>";
  }

  /* ======================================================================
     PAGE BUILDERS
     ====================================================================== */
  var pages = {};

  /* ---------- HOME ---------- */
  pages.home = function () {
    var H = S.home, h = H.hero, out = "";

    // hero with video
    var vp = h.video ? parseVideo(h.video) : null, media = "";
    media += "<img class='hero-poster' src='" + esc(h.poster) + "' alt=''>";
    if (vp && vp.type === "file") media += "<video class='hero-video' id='heroVideo' autoplay muted loop playsinline preload='auto' poster='" + esc(h.poster) + "'><source src='" + esc(vp.src) + "'></video>";
    if (vp && vp.type === "youtube") media += "<iframe class='hero-yt' src='https://www.youtube-nocookie.com/embed/" + vp.id + "?autoplay=1&mute=1&loop=1&playlist=" + vp.id + "&controls=0&showinfo=0&modestbranding=1&rel=0&playsinline=1' allow='autoplay; encrypted-media' tabindex='-1' title='Background video'></iframe>";
    out += "<section class='hero' id='home'><div class='hero-media'>" + media + "</div><div class='hero-overlay'></div>" +
      "<div class='hero-content reveal'><p class='eyebrow'>" + esc(h.eyebrow) + "</p><h1>" + fmt(h.title) + "</h1><p class='hero-copy'>" + esc(h.text) + "</p>" +
      "<div class='hero-actions'>" + btn(h.button1, "light") + btn(h.button2, "ghost") + "</div></div>" +
      (vp && vp.type === "file" ? "<button class='sound-btn' id='soundBtn' aria-label='Toggle sound'><span>Sound off</span></button>" : "") +
      "<div class='scroll-cue'><i></i><span>" + esc(h.scrollText || "Scroll") + "</span></div>" +
      "<div class='hero-bottom'><span>" + esc(h.bottomLeft) + "</span><span>" + esc(h.bottomRight) + "</span></div></section>";

    // marquee
    var words = H.marquee.map(function (w) { return "<span>" + esc(w) + "</span><i>✦</i>"; }).join("");
    out += "<div class='marquee'><div class='marquee-track'>" + words + words + words + words + "</div></div>";

    // intro
    var I = H.intro;
    out += "<section class='section intro'>" + label(I.label) + "<div class='intro-grid'><div><h2>" + fmt(I.title) + "</h2>" +
      "<div class='intro-text'>" + I.paragraphs.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("") +
      "<a class='text-link' href='" + esc(I.link.link) + "'>" + esc(I.link.label) + " " + arrow() + "</a></div></div>" +
      "<div class='intro-media reveal'>" + img(I.image, "") + "</div></div></section>";

    // stats
    out += "<section class='section numbers light'><div class='number-grid'>" + H.stats.map(function (s) {
      return "<div><strong><b data-count='" + s.number + "'>0</b>" + esc(s.suffix || "") + "</strong><span>" + esc(s.label) + "</span></div>";
    }).join("") + "</div></section>";

    // services preview
    var SP = H.servicesPreview;
    out += "<section class='section services'>" + sectionHead(SP.label, SP.title, SP.text, { label: SP.buttonLabel, link: "services.html" }) +
      "<div class='service-list'>" + S.services.list.map(function (s, i) {
        return "<a class='service' href='services.html'><span>" + String(i + 1).padStart(2, "0") + "</span><h3>" + esc(s.title) + "</h3><p>" + esc(s.text) + "</p><b>↗</b></a>";
      }).join("") + "</div></section>";

    // featured work
    var F = H.featured, feat = S.portfolio.photos.filter(function (p) { return p.featured; }).slice(0, 6);
    out += "<section class='section work light'>" + sectionHead(F.label, F.title, F.text, { label: F.buttonLabel, link: "portfolio.html" }, true) +
      "<div class='masonry' data-lb-group>" + feat.map(photoItem).join("") + "</div></section>";

    // statement
    var ST = H.statement;
    out += "<section class='statement'><div class='statement-bg' style=\"background-image:url('" + esc(ST.image) + "')\"></div><div class='statement-content reveal'><p class='eyebrow'>" + esc(ST.eyebrow) + "</p><h2>" + fmt(ST.title) + "</h2></div></section>";

    // films preview
    var FP = H.filmsPreview, fv = S.films.videos.filter(function (v) { return v.featured; }).slice(0, 3);
    out += "<section class='section films-prev'>" + sectionHead(FP.label, FP.title, FP.text, { label: FP.buttonLabel, link: "films.html" }) +
      "<div class='film-grid'>" + fv.map(filmCard).join("") + "</div></section>";

    // process
    var P = H.process;
    out += "<section class='section process light'>" + label(P.label) + "<div class='section-head'><h2>" + fmt(P.title) + "</h2></div><div class='step-grid'>" +
      P.steps.map(function (s, i) { return "<div class='step'><em>" + String(i + 1).padStart(2, "0") + "</em><h3>" + esc(s.title) + "</h3><p>" + esc(s.text) + "</p></div>"; }).join("") + "</div></section>";

    // testimonials
    var T = H.testimonials;
    out += "<section class='section testi'>" + label(T.label) + "<div class='section-head'><h2>" + fmt(T.title) + "</h2></div><div class='testi-grid'>" +
      T.items.map(function (t) { return "<blockquote><p>“" + esc(t.quote) + "”</p><footer><b>" + esc(t.name) + "</b><span>" + esc(t.role) + "</span></footer></blockquote>"; }).join("") + "</div></section>";

    out += faqSection(true) + ctaBand(H.cta);
    return out;
  };

  /* ---------- ABOUT ---------- */
  pages.about = function () {
    var A = S.about, out = pageHero(A);
    out += "<section class='section split-sec'>" + label(A.story.label) + "<div class='intro-grid'><div><h2>" + fmt(A.story.title) + "</h2><div class='intro-text'>" +
      A.story.paragraphs.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("") + "</div></div><div class='intro-media tall-img reveal'>" + img(A.story.image, "") + "</div></div></section>";

    out += "<section class='section light'>" + label(A.values.label) + "<div class='value-grid'>" + A.values.items.map(function (v, i) {
      return "<div class='value'><em>" + String(i + 1).padStart(2, "0") + "</em><h3>" + esc(v.title) + "</h3><p>" + esc(v.text) + "</p></div>";
    }).join("") + "</div></section>";

    out += "<section class='section team'>" + label(A.team.label) + "<div class='section-head'><h2>" + fmt(A.team.title) + "</h2></div><div class='team-grid'>" +
      A.team.members.map(function (m) { return "<figure class='member'><div>" + img(m.photo, m.name) + "</div><figcaption><b>" + esc(m.name) + "</b><span>" + esc(m.role) + "</span></figcaption></figure>"; }).join("") + "</div></section>";

    out += "<section class='section timeline-sec light'>" + label("Milestones") + "<div class='timeline'>" + A.milestones.map(function (m) {
      return "<div class='tl'><strong>" + esc(m.year) + "</strong><p>" + esc(m.text) + "</p></div>"; }).join("") + "</div></section>";

    out += "<section class='section gear'>" + label(A.gear.label) + "<div class='chips'>" + A.gear.items.map(function (g) { return "<span>" + esc(g) + "</span>"; }).join("") + "</div></section>";
    out += ctaBand(S.home.cta);
    return out;
  };

  /* ---------- SERVICES ---------- */
  pages.services = function () {
    var V = S.services, out = pageHero(V);
    out += "<section class='section svc-sec'>" + V.list.map(function (s, i) {
      return "<article class='svc-block reveal" + (i % 2 ? " flip" : "") + "'><div class='svc-img'>" + img(s.image, s.title) + "</div><div class='svc-text'><span class='num'>" + String(i + 1).padStart(2, "0") + "</span><h3>" + esc(s.title) + "</h3><p>" + esc(s.text) + "</p><ul>" +
        (s.points || []).map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("") + "</ul><a class='text-link' href='contact.html'>Enquire about this " + arrow() + "</a></div></article>";
    }).join("") + "</section>";
    out += "<section class='section light'>" + label(V.addons.label) + "<div class='section-head'><h2>" + fmt(V.addons.title) + "</h2></div><div class='chips dark'>" + V.addons.items.map(function (g) { return "<span>" + esc(g) + "</span>"; }).join("") + "</div></section>";
    out += ctaBand(S.home.cta);
    return out;
  };

  /* ---------- PORTFOLIO ---------- */
  pages.portfolio = function () {
    var P = S.portfolio, out = pageHero(P);
    out += "<section class='section work light'><div class='filters' id='filters'><button class='on' data-f='all'>All</button>" +
      P.categories.map(function (c) { return "<button data-f='" + esc(c) + "'>" + esc(c) + "</button>"; }).join("") + "</div>" +
      "<div class='masonry' data-lb-group>" + P.photos.map(photoItem).join("") + "</div></section>";
    out += "<section class='section cta-mini'><p>Like what you see?</p>" + btn({ label: "Book your shoot", link: "contact.html" }, "light") + "</section>";
    return out;
  };

  /* ---------- FILMS ---------- */
  pages.films = function () {
    var F = S.films, out = pageHero(F), v = F.videos;
    var wide = v.filter(function (x) { return !x.vertical; }), vert = v.filter(function (x) { return x.vertical; });
    out += "<section class='section films-sec'>" + label("All films") + "<div class='film-grid big'>" + wide.map(filmCard).join("") + "</div>" +
      (vert.length ? "<div class='section-label' style='margin-top:90px'>Reels</div><div class='film-grid reels'>" + vert.map(filmCard).join("") + "</div>" : "") + "</section>";
    if (S.social.youtube) out += "<section class='section cta-mini light'><p>" + esc(F.channelCta.text) + "</p>" + btn({ label: F.channelCta.label, link: S.social.youtube }, "dark") + "</section>";
    out += ctaBand(S.home.cta);
    return out;
  };

  /* ---------- PACKAGES ---------- */
  pages.packages = function () {
    var K = S.packages, out = pageHero(K);
    out += "<section class='section pricing'><div class='price-grid'>" + K.plans.map(function (p) {
      return "<article class='plan reveal" + (p.highlight ? " hl" : "") + "'>" + (p.badge ? "<span class='badge'>" + esc(p.badge) + "</span>" : "") + "<h3>" + esc(p.name) + "</h3><p class='ptext'>" + esc(p.text) + "</p>" +
        "<div class='price'><small>" + esc(p.per) + "</small><strong>" + esc(p.price) + "</strong></div><ul>" + p.features.map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("") + "</ul>" +
        "<a class='button " + (p.highlight ? "light" : "ghost") + "' href='contact.html'>Choose " + esc(p.name) + " " + arrow() + "</a></article>";
    }).join("") + "</div><p class='note'>" + esc(K.note) + "</p></section>";
    out += "<section class='section light'>" + label(K.compare.label) + "<div class='value-grid four'>" + K.compare.items.map(function (v, i) {
      return "<div class='value'><em>" + String(i + 1).padStart(2, "0") + "</em><h3>" + esc(v.title) + "</h3><p>" + esc(v.text) + "</p></div>"; }).join("") + "</div></section>";
    out += faqSection(false) + ctaBand(S.home.cta);
    return out;
  };

  /* ---------- CONTACT ---------- */
  pages.contact = function () {
    var C = S.contactPage, c = S.contact, out = pageHero(C);
    var cards = [
      { t: C.cards[0].title, big: c.phoneDisplay, s: C.cards[0].text, href: "tel:" + c.phoneLink },
      { t: C.cards[1].title, big: c.email, s: C.cards[1].text, href: "mailto:" + c.email },
      { t: C.cards[2].title, big: c.addressLine, s: C.cards[2].text, href: "" }
    ];
    out += "<section class='section contact-sec light'><div class='contact-layout'><div class='contact-form-wrap'><h2>" + esc(C.formTitle) + "</h2><p class='lead'>" + esc(C.formText) + "</p>" +
      "<form id='enquiry' novalidate><div class='f-row'><label>Your name<input name='name' required placeholder='Full name'></label><label>Phone / WhatsApp<input name='phone' required placeholder='+91 ...'></label></div>" +
      "<div class='f-row'><label>Email<input type='email' name='email' placeholder='you@email.com'></label><label>Type of shoot<select name='type'>" + C.shootTypes.map(function (t) { return "<option>" + esc(t) + "</option>"; }).join("") + "</select></label></div>" +
      "<div class='f-row'><label>Event date<input type='date' name='date'></label><label>Location<input name='location' placeholder='City / venue'></label></div>" +
      "<label>Tell us about your idea<textarea name='message' rows='5' placeholder='Share a few details...'></textarea></label>" +
      "<button class='button dark' type='submit'>" + (C.formspreeUrl ? "Send enquiry" : "Send on WhatsApp") + " " + arrow() + "</button><p class='form-status' id='formStatus' role='status'></p></form></div>" +
      "<aside class='contact-info'>" + cards.map(function (k) {
        return "<div class='info-card'><small>" + esc(k.t) + "</small>" + (k.href ? "<a href='" + esc(k.href) + "'>" + esc(k.big) + "</a>" : "<strong>" + esc(k.big) + "</strong>") + "<span>" + esc(k.s) + "</span></div>"; }).join("") +
      "<a class='info-card wa' href='" + waLink() + "' target='_blank' rel='noopener'><small>WhatsApp</small><strong>Chat instantly</strong><span>" + esc(c.replyTime) + "</span></a></aside></div></section>";
    if (c.mapEmbed) out += "<section class='map'><iframe src='" + esc(c.mapEmbed) + "' loading='lazy' referrerpolicy='no-referrer-when-downgrade' title='Map'></iframe></section>";
    out += faqSection(false);
    return out;
  };

  /* ======================================================================
     RENDER
     ====================================================================== */
  var seo = (S.seo[PAGE] || S.seo.home);
  document.title = seo.title;
  var md = $("meta[name=description]"); if (!md) { md = document.createElement("meta"); md.name = "description"; document.head.appendChild(md); } md.content = seo.description;
  document.documentElement.style.setProperty("--gold", S.brand.accentColor || "#d7b47b");
  if (S.brand.favicon) { var ic = document.createElement("link"); ic.rel = "icon"; ic.href = S.brand.favicon; document.head.appendChild(ic); }
  var ld = document.createElement("script"); ld.type = "application/ld+json";
  ld.textContent = JSON.stringify({ "@context": "https://schema.org", "@type": "Photographer", name: S.brand.fullName, telephone: S.contact.phoneLink, email: S.contact.email, address: S.contact.addressLine, sameAs: Object.keys(S.social).map(function (k) { return S.social[k]; }).filter(Boolean) });
  document.head.appendChild(ld);

  var showLoader = false; try { showLoader = !sessionStorage.getItem("seen"); sessionStorage.setItem("seen", "1"); } catch (e) {}
  document.body.innerHTML = (showLoader ? "<div class='loader' id='loader'>" + (S.brand.logoImage ? "<img class='loader-logo' src='" + esc(S.brand.logoImage) + "' alt='" + esc(S.brand.fullName) + "'>" : "<span>" + esc(S.brand.name) + "</span>") + "</div>" : "") + "<a id='top'></a>" + header() +
    "<main>" + (pages[PAGE] || pages.home)() + "</main>" + footer() + whatsappBtn() +
    "<div class='lightbox' id='lightbox' aria-hidden='true'><button class='lb-close' aria-label='Close'>×</button><button class='lb-nav prev' aria-label='Previous'>‹</button><button class='lb-nav next' aria-label='Next'>›</button><figure><img alt=''><figcaption></figcaption></figure></div>" +
    "<div class='modal' id='modal' aria-hidden='true'><button class='lb-close' aria-label='Close'>×</button><div class='modal-body' id='modalBody'></div></div>";

  /* ======================================================================
     BEHAVIOUR
     ====================================================================== */
  var loader = $("#loader");
  function hideLoader() { if (loader) loader.classList.add("hide"); }
  if (document.readyState === "complete") setTimeout(hideLoader, 350); else window.addEventListener("load", function () { setTimeout(hideLoader, 450); });
  setTimeout(hideLoader, 3500);

  // menu
  var nav = $("#nav"), toggle = $("#menuToggle");
  toggle.addEventListener("click", function () { var o = nav.classList.toggle("open"); toggle.setAttribute("aria-expanded", o); document.body.classList.toggle("lock", o); });
  $$("#menu a").forEach(function (a) { a.addEventListener("click", function () { nav.classList.remove("open"); document.body.classList.remove("lock"); }); });
  function onScroll() { nav.classList.toggle("scrolled", window.scrollY > 60); }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  // reveal on scroll
  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); } }); }, { threshold: 0.1 }) : null;
  $$("section, .film-card, .ph-item, .plan, .step, .value, .member, .tl, blockquote, .info-card, .service, details").forEach(function (el, i) { if (!el.classList.contains("hero") && !el.classList.contains("page-hero")) el.classList.add("reveal"); });
  $$(".reveal").forEach(function (el) { el.style.transitionDelay = (Math.min(($$(".reveal", el.parentNode).indexOf(el)) * 60, 360)) + "ms"; if (io) io.observe(el); else el.classList.add("visible"); });

  // counters
  var cio = "IntersectionObserver" in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return; cio.unobserve(e.target);
      var end = +e.target.getAttribute("data-count"), t0 = performance.now();
      (function step(t) { var p = Math.min((t - t0) / 1400, 1); e.target.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); })(t0);
    });
  }, { threshold: 0.5 }) : null;
  $$("[data-count]").forEach(function (el) { if (cio) cio.observe(el); else el.textContent = el.getAttribute("data-count"); });

  // hero video: fall back to poster if the file is missing; sound toggle
  var hv = $("#heroVideo");
  if (hv) {
    var srcEl = $("source", hv);
    if (srcEl) srcEl.addEventListener("error", function () { hv.remove(); var sb = $("#soundBtn"); if (sb) sb.remove(); });
    hv.addEventListener("playing", function () { hv.classList.add("on"); });
    var p = hv.play && hv.play(); if (p && p.catch) p.catch(function () {});
    var sb2 = $("#soundBtn");
    if (sb2) sb2.addEventListener("click", function () { hv.muted = !hv.muted; $("span", sb2).textContent = hv.muted ? "Sound off" : "Sound on"; sb2.classList.toggle("on", !hv.muted); });
  }

  // parallax on page hero
  var phBg = $(".ph-bg, .hero-media");
  if (phBg && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var tick = false;
    window.addEventListener("scroll", function () { if (tick) return; tick = true; requestAnimationFrame(function () { if (window.scrollY < window.innerHeight * 1.2) phBg.style.transform = "translate3d(0," + (window.scrollY * 0.18) + "px,0)"; tick = false; }); }, { passive: true });
  }

  // portfolio filters
  var fb = $("#filters");
  if (fb) fb.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    $$("button", fb).forEach(function (x) { x.classList.toggle("on", x === b); });
    var f = b.getAttribute("data-f");
    $$(".ph-item").forEach(function (it) { it.classList.toggle("hide", f !== "all" && it.getAttribute("data-cat") !== f); });
  });

  // photo lightbox
  var lb = $("#lightbox"), lbImg = $("img", lb), lbCap = $("figcaption", lb), lbItems = [], lbIdx = 0;
  function lbShow() { var it = lbItems[lbIdx]; lbImg.src = it.getAttribute("data-src"); lbCap.textContent = it.getAttribute("data-title") || ""; }
  function lbOpen(items, idx) { lbItems = items; lbIdx = idx; lbShow(); lb.classList.add("open"); document.body.classList.add("lock"); }
  function lbClose() { lb.classList.remove("open"); document.body.classList.remove("lock"); lbImg.src = ""; }
  function lbStep(d) { lbIdx = (lbIdx + d + lbItems.length) % lbItems.length; lbShow(); }
  document.addEventListener("click", function (e) {
    var it = e.target.closest("[data-lb]");
    if (it) { var grp = it.closest("[data-lb-group]"); var items = $$("[data-lb]:not(.hide)", grp); lbOpen(items, items.indexOf(it)); }
  });
  $(".lb-close", lb).addEventListener("click", lbClose);
  $(".prev", lb).addEventListener("click", function () { lbStep(-1); });
  $(".next", lb).addEventListener("click", function () { lbStep(1); });
  lb.addEventListener("click", function (e) { if (e.target === lb) lbClose(); });

  // video modal
  var modal = $("#modal"), mBody = $("#modalBody");
  function mOpen(url, vertical) { mBody.className = "modal-body" + (vertical ? " vertical" : ""); mBody.innerHTML = playerHTML(url); modal.classList.add("open"); document.body.classList.add("lock"); }
  function mClose() { modal.classList.remove("open"); document.body.classList.remove("lock"); mBody.innerHTML = ""; }
  document.addEventListener("click", function (e) { var c = e.target.closest("[data-video]"); if (c) mOpen(c.getAttribute("data-video"), c.getAttribute("data-vertical") === "1"); });
  $(".lb-close", modal).addEventListener("click", mClose);
  modal.addEventListener("click", function (e) { if (e.target === modal) mClose(); });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { lbClose(); mClose(); nav.classList.remove("open"); document.body.classList.remove("lock"); }
    if (lb.classList.contains("open")) { if (e.key === "ArrowRight") lbStep(1); if (e.key === "ArrowLeft") lbStep(-1); }
    if ((e.key === "Enter" || e.key === " ") && e.target.matches && e.target.matches("[data-lb],[data-video]")) { e.preventDefault(); e.target.click(); }
  });

  // back to top
  var tt = $("#toTop"); if (tt) tt.addEventListener("click", function (e) { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); });

  // enquiry form
  var form = $("#enquiry");
  if (form) form.addEventListener("submit", function (e) {
    e.preventDefault();
    var d = {}; $$("input,select,textarea", form).forEach(function (f) { d[f.name] = f.value.trim(); });
    var st = $("#formStatus");
    if (!d.name || !d.phone) { st.textContent = "Please add your name and phone number."; st.className = "form-status err"; return; }
    var url = S.contactPage.formspreeUrl;
    if (url) {
      fetch(url, { method: "POST", headers: { "Accept": "application/json", "Content-Type": "application/json" }, body: JSON.stringify(d) })
        .then(function (r) { if (!r.ok) throw 0; st.textContent = "Thank you! We'll be in touch within 24 hours."; st.className = "form-status ok"; form.reset(); })
        .catch(function () { st.textContent = "Something went wrong. Please message us on WhatsApp instead."; st.className = "form-status err"; });
    } else {
      var msg = "Hello " + S.brand.fullName + "!\n\nName: " + d.name + "\nPhone: " + d.phone + (d.email ? "\nEmail: " + d.email : "") + "\nShoot type: " + d.type + (d.date ? "\nDate: " + d.date : "") + (d.location ? "\nLocation: " + d.location : "") + (d.message ? "\n\n" + d.message : "");
      window.open(waLink(msg), "_blank", "noopener");
      st.textContent = "Opening WhatsApp with your message…"; st.className = "form-status ok";
    }
  });
})();
