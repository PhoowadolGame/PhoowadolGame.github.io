(function(){
  var lang = "th";
  var T = {
    mailCopied:["คัดลอกอีเมลแล้ว","Email copied to clipboard"],
    copyFail:["คัดลอกไม่สำเร็จ ลองคัดลอกด้วยตนเอง","Could not copy, please copy it manually"]
  };

  /* contact details are assembled here (not written in the HTML) so basic scrapers/spam bots can't harvest them */
  function dec(s){ try{ return atob(s); }catch(e){ return ""; } }
  var mailEl = document.getElementById("mail"), mailAddr = dec(mailEl.dataset.u);
  mailEl.dataset.copy = mailAddr;
  document.getElementById("mailText").textContent = mailAddr;
  var telEl = document.getElementById("telLink");
  telEl.href = "tel:" + dec(telEl.dataset.u); telEl.textContent = dec(telEl.dataset.t);
  var lineTxt = document.getElementById("lineText"); lineTxt.textContent = dec(lineTxt.dataset.u);
  document.getElementById("footContact").textContent = " Tel: " + dec(telEl.dataset.t) + "    |    Gmail: " + mailAddr;

  /* only allow local files from /images (blocks javascript:, data:, external URLs) */
  function safeImg(s){ return typeof s === "string" && /^images\/[\w\-. ]+\.(png|jpe?g|webp|gif)$/i.test(s); }
  function safePdf(s){ return typeof s === "string" && /^images\/[\w\-. ]+\.pdf$/i.test(s); }

  /* assets -> img */
  Array.prototype.forEach.call(document.querySelectorAll("img[data-asset]"), function(img){ if(safeImg(ASSETS[img.dataset.asset])) img.src = ASSETS[img.dataset.asset]; });

  /* toast + copy */
  var toast = document.getElementById("toast"), toastText = document.getElementById("toastText"), toastTimer;
  function showToast(key){
    toastText.textContent = T[key][lang === "en" ? 1 : 0];
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ toast.classList.remove("show"); }, 2200);
  }
  function copyText(text, okKey, card){
    function ok(){
      showToast(okKey);
      if(card){ card.classList.add("done"); setTimeout(function(){ card.classList.remove("done"); }, 2200); }
    }
    function fallback(){
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly",""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      var good = false;
      try{ good = document.execCommand("copy"); }catch(e){}
      document.body.removeChild(ta);
      good ? ok() : showToast("copyFail");
    }
    if(navigator.clipboard && window.isSecureContext){ navigator.clipboard.writeText(text).then(ok, fallback); }
    else{ fallback(); }
  }
  var mail = document.getElementById("mail");
  mail.addEventListener("click", function(){ copyText(mail.dataset.copy, "mailCopied", mail); });

  /* viewer dialog (resume, certificates, photos, QR) */
  var dlg = document.getElementById("viewer"), vImg = document.getElementById("vImg"),
      vTitle = document.getElementById("vTitle"), vDl = document.getElementById("vDl"), vClose = document.getElementById("vClose");
var addLineBtn = document.getElementById("vAddLine");
  function openViewer(o){
    if(!safeImg(o.src)) return;
    dlg.className = o.size || "";
    vImg.src = o.src; vImg.alt = o.title || "";
    vTitle.textContent = o.title || "";

    /* "Add friend" only for the LINE QR, "Download PDF" only for the resume */
    addLineBtn.hidden = !o.line;
    if(safePdf(o.download)){
      vDl.href = o.download; vDl.setAttribute("download", o.downloadName || ""); vDl.hidden = false;
    }else{
      vDl.hidden = true; vDl.removeAttribute("href");
    }

    dlg.querySelector(".v-body").scrollTop = 0;
    if(dlg.open) return;
    if(dlg.showModal){ dlg.showModal(); } else { dlg.setAttribute("open",""); }
  }

  vClose.addEventListener("click", function(){ dlg.close(); });
  dlg.addEventListener("click", function(e){ if(e.target === dlg) dlg.close(); });
  document.getElementById("resumeBtn").addEventListener("click", function(){
    openViewer({src:ASSETS.resume_img, title:"Resume", size:"narrow", download:ASSETS.resume_pdf, downloadName:"Resume-Phoowadol-Sornsom.pdf"});
  });

  /* the whole LINE card opens the QR viewer, same as clicking the QR itself */
  var lineCard = document.getElementById("line");
  function openLine(){ openViewer({src:ASSETS.line_qr, title:"LINE", size:"small", line:true}); }
  lineCard.addEventListener("click", openLine);
  lineCard.addEventListener("keydown", function(e){
    if(e.key === "Enter" || e.key === " "){ e.preventDefault(); openLine(); }
  });
  Array.prototype.forEach.call(document.querySelectorAll("[data-asset-view]"), function(b){
    b.addEventListener("click", function(){ openViewer({src:ASSETS[b.dataset.assetView], title:b.dataset.title}); });
  });

  /* activity photos: up to 2, revealed when the card is hovered / focused */
  Array.prototype.forEach.call(document.querySelectorAll(".shots"), function(box){
    var list = (PHOTOS[box.dataset.photos] || []).slice(0, 2);
    if(!list.length) return;
    var card = box.closest(".card, .proj"), title = card.querySelector("h3");
    card.classList.add("has-photos");
    card.tabIndex = 0;
    list.forEach(function(src){
      if(!safeImg(src)) return;
      var b = document.createElement("button"); b.type = "button"; b.className = "shot";
      var im = document.createElement("img"); im.src = src; im.alt = ""; im.loading = "lazy";
      b.appendChild(im);
      b.addEventListener("click", function(){ openViewer({src:src, title:title ? title.textContent : ""}); });
      box.appendChild(b);
    });
  });

  /* language */
  var texts = Array.prototype.slice.call(document.querySelectorAll("[data-en]"));
  var labels = Array.prototype.slice.call(document.querySelectorAll("[data-en-label]"));
  texts.forEach(function(el){ el.dataset.th = el.textContent; });
  labels.forEach(function(el){ el.dataset.thLabel = el.getAttribute("aria-label"); });
  var titles = ["ภูวดล สอนสม | Network · Cloud · System","Phoowadol Sornsom | Network · Cloud · System"];
  var buttons = Array.prototype.slice.call(document.querySelectorAll(".lang button"));

  function setLang(l){
    lang = l;
    document.documentElement.lang = l;
    texts.forEach(function(el){ el.textContent = l === "en" ? el.dataset.en : el.dataset.th; });
    labels.forEach(function(el){ el.setAttribute("aria-label", l === "en" ? el.dataset.enLabel : el.dataset.thLabel); });
    document.title = titles[l === "en" ? 1 : 0];
    buttons.forEach(function(b){ b.setAttribute("aria-pressed", b.dataset.l === l); });
    try{ localStorage.setItem("lang", l); }catch(e){}
  }
  buttons.forEach(function(b){ b.addEventListener("click", function(){ setLang(b.dataset.l); }); });
  var saved = "th";
  try{ saved = localStorage.getItem("lang") || "th"; }catch(e){}
  setLang(saved === "en" ? "en" : "th");
})();

/* ============ NAV: highlight the section being viewed ============ */
(function(){
  var links = Array.prototype.slice.call(document.querySelectorAll("#nav a"));
  var items = links.map(function(a){ return {a:a, el:document.querySelector(a.getAttribute("href"))}; })
                   .filter(function(x){ return x.el; });
  var nav = document.getElementById("nav"), last = null;
  function spy(){
    var y = window.scrollY + 120, cur = null, best = -1;
    items.forEach(function(x){
      var top = x.el.getBoundingClientRect().top + window.scrollY;
      if(top <= y && top > best){ best = top; cur = x; }
    });
    if(window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) cur = items[items.length-1];
    links.forEach(function(a){ a.classList.toggle("active", !!cur && cur.a === a); });
    if(cur && cur.a !== last){            /* keep the active item visible when the nav scrolls sideways */
      last = cur.a;
      nav.scrollTo({left: cur.a.offsetLeft - (nav.clientWidth - cur.a.offsetWidth)/2, behavior:"smooth"});
    }
  }
  window.addEventListener("scroll", spy, {passive:true});
  window.addEventListener("resize", spy);
  spy();
})();