(function(){
  const qs=(s,el=document)=>el.querySelector(s); const qsa=(s,el=document)=>[...el.querySelectorAll(s)];
  const debounce=(fn,wait=220)=>{let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),wait)};};

  function initMegaMenu(){
    const btn=qs('[data-amz-depts]'); const menu=qs('#amz-mega');
    if(!btn||!menu) return;
    const open=()=>{ menu.setAttribute('aria-hidden','false'); btn.setAttribute('aria-expanded','true'); };
    const close=()=>{ menu.setAttribute('aria-hidden','true'); btn.setAttribute('aria-expanded','false'); };
    btn.addEventListener('mouseenter',open); btn.addEventListener('focus',open);
    btn.addEventListener('mouseleave',debounce(close,150)); menu.addEventListener('mouseleave',close);
    document.addEventListener('keydown',e=>{ if(e.key==='Escape') close(); });
  }

  function initSearchCategory(){
    const form=qs('[data-amz-search]'); if(!form) return;
    form.addEventListener('submit',e=>{
      const cat=qs('[name="type"]',form)?.value; if(!cat) return;
      // keep Shopify native search, add type param
      const q=qs('[name="q"]',form)?.value||'';
      const url=new URL('/search', window.location.origin);
      url.searchParams.set('q',q); url.searchParams.set('type',cat);
      e.preventDefault(); window.location.assign(url.toString());
    });
  }

  function initOffcanvasFacets(){
    const openBtn=qs('[data-open-facets]'); const closeBtn=qs('[data-close-facets]'); const oc=qs('#amz-facets');
    if(!oc||!openBtn) return;
    const open=()=> oc.setAttribute('aria-hidden','false');
    const close=()=> oc.setAttribute('aria-hidden','true');
    openBtn.addEventListener('click',open); closeBtn?.addEventListener('click',close);
    oc.addEventListener('click',e=>{ if(e.target===oc) close(); });
    document.addEventListener('keydown',e=>{ if(e.key==='Escape') close(); });
  }

  document.addEventListener('DOMContentLoaded',function(){
    initMegaMenu();
    initSearchCategory();
    initOffcanvasFacets();
  });
})();
