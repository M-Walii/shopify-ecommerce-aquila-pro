/* Aquila Pro main.js */
(function(){
  const dataLayer = window.dataLayer = window.dataLayer || [];

  // Utilities
  const qs = (s, el=document) => el.querySelector(s);
  const qsa = (s, el=document) => [...el.querySelectorAll(s)];
  const money = (cents) => {
    try { return (cents/100).toLocaleString(undefined, { style: 'currency', currency: window.themeSettings.shopCurrency }); }
    catch(e){ return `$${(cents/100).toFixed(2)}`; }
  };
  const debounce = (fn, wait=220) => { let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), wait); }; };

  // Predictive Search
  function initPredictiveSearch(){
    if(!window.themeSettings.predictiveSearchEnabled) return;
    const trigger = qs('#search-trigger');
    const panel = qs('#predictive-search');
    const input = qs('#predictive-search-input');
    const results = qs('#predictive-results');
    const closeBtn = qs('[data-close-predictive]');
    if(!trigger || !panel || !input || !results) return;

    const open = () => { panel.hidden = false; trigger.setAttribute('aria-expanded','true'); input.focus(); };
    const close = () => { panel.hidden = true; trigger.setAttribute('aria-expanded','false'); trigger.focus(); };

    trigger.addEventListener('click', open);
    closeBtn?.addEventListener('click', close);
    panel.addEventListener('click', (e)=>{ if(e.target === panel) close(); });
    document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape' && !panel.hidden) close(); });

    let focusables = [];
    let focusIndex = -1;
    const updateFocusables = () => { focusables = qsa('#predictive-results a'); focusIndex = -1; };
    const moveFocus = (delta) => {
      if(focusables.length === 0) return;
      focusIndex = (focusIndex + delta + focusables.length) % focusables.length;
      focusables[focusIndex].focus();
    };

    const renderResults = (groups) => {
      if(!groups || (!groups.products?.length && !groups.collections?.length && !groups.pages?.length)){
        results.innerHTML = `<p role="status">No results</p>`;
        updateFocusables();
        return;
      }
      let html = '';
      const renderGroup = (title, items, make) => {
        if(!items?.length) return; html += `<div class="ps-group"><h3>${title}</h3><ul role="listbox">`;
        items.slice(0,6).forEach((it, idx)=>{ html += make(it, idx); });
        html += `</ul></div>`;
      };
      renderGroup('Products', groups.products, (p, i)=>`<li role="option"><a href="${p.url}"><img alt="" loading="lazy" src="${p.image}" width="40" height="40"> ${p.title}</a></li>`);
      renderGroup('Collections', groups.collections, (c)=>`<li role="option"><a href="${c.url}">${c.title}</a></li>`);
      renderGroup('Pages', groups.pages, (p)=>`<li role="option"><a href="${p.url}">${p.title}</a></li>`);
      results.innerHTML = html;
      updateFocusables();
    };

    const fetchResults = debounce(async (q)=>{
      if(!q){ results.innerHTML = ''; updateFocusables(); return; }
      try{
        const url = `/search/suggest.json?q=${encodeURIComponent(q)}&resources[type]=product,collection,page&resources[limit]=6`;
        const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
        const data = await res.json();
        const groups = {
          products: data.resources.results.products?.map(p=>({ title:p.title, url:p.url, image:p.image })),
          collections: data.resources.results.collections?.map(c=>({ title:c.title, url:c.url })),
          pages: data.resources.results.pages?.map(p=>({ title:p.title, url:p.url }))
        };
        renderResults(groups);
      }catch(e){ console.error('Predictive search error', e); }
    }, 200);

    input.addEventListener('input', (e)=> fetchResults(e.target.value));
    input.addEventListener('keydown', (e)=>{
      if(e.key === 'ArrowDown'){ e.preventDefault(); moveFocus(1); }
      else if(e.key === 'ArrowUp'){ e.preventDefault(); moveFocus(-1); }
    });
  }

  // Cart Drawer
  function initCartDrawer(){
    const drawer = qs('#cart-drawer');
    const itemsEl = qs('[data-cart-items]', drawer);
    const totalEl = qs('[data-cart-total]', drawer);
    const free = qs('[data-free-ship]', drawer);
    const openers = qsa('[data-open-cart]');
    const closeBtn = qs('[data-close-cart]', drawer);

    const open = ()=>{ drawer.setAttribute('aria-hidden','false'); };
    const close = ()=>{ drawer.setAttribute('aria-hidden','true'); };

    openers.forEach(b=> b.addEventListener('click', (e)=>{ e.preventDefault(); open(); renderCart(); }));
    closeBtn?.addEventListener('click', close);
    drawer.addEventListener('click', (e)=>{ if(e.target === drawer) close(); });
    document.addEventListener('keydown', (e)=>{ if(e.key==='Escape' && drawer.getAttribute('aria-hidden')==='false') close(); });

    async function renderCart(){
      const res = await fetch('/cart.js');
      const cart = await res.json();
      itemsEl.innerHTML = cart.items.map(item => `
        <div class="cart-line" data-key="${item.key}">
          <img src="${item.image}" alt="" width="64" height="64" loading="lazy">
          <div class="info">
            <a href="${item.url}">${item.product_title}</a>
            <div>${money(item.price)} × <input class="qty" type="number" min="0" value="${item.quantity}" data-update-qty></div>
            <button class="remove" data-remove>Remove</button>
          </div>
          <div class="line-total">${money(item.final_line_price)}</div>
        </div>`).join('');
      totalEl.textContent = money(cart.total_price);
      setupLineEvents();
      updateFreeShipping(cart.total_price);
    }
    function updateFreeShipping(totalCents){
      const threshold = Number(free?.dataset.threshold || 0) * 100;
      if(!free || threshold <= 0) return;
      const bar = qs('.bar', free); const note = qs('.note', free);
      const pct = Math.min(100, Math.floor((totalCents/threshold)*100));
      bar.style.width = pct + '%';
      if(totalCents >= threshold){
        note.textContent = '🎉 You qualify for free shipping!';
      } else {
        const remaining = threshold - totalCents;
        note.textContent = `Spend ${money(remaining)} more for free shipping`;
      }
    }
    function setupLineEvents(){
      qsa('[data-remove]', itemsEl).forEach(btn=> btn.addEventListener('click', async (e)=>{
        const key = e.target.closest('.cart-line').dataset.key;
        await updateCart({ updates: { [key]: 0 } });
        renderCart();
      }));
      qsa('[data-update-qty]', itemsEl).forEach(inp=> inp.addEventListener('change', debounce(async (e)=>{
        const wrap = e.target.closest('.cart-line');
        const key = wrap.dataset.key; const qty = Number(e.target.value);
        await updateCart({ updates: { [key]: qty } });
        renderCart();
      }, 250)));
    }
    async function updateCart(body){
      await fetch('/cart/update.js', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body)});
    }

    // Intercept add to cart
    document.addEventListener('submit', async (e)=>{
      const form = e.target;
      if(!form.matches('.product-form, .quick-add')) return;
      e.preventDefault();
      const fd = new FormData(form);
      const body = Object.fromEntries(fd.entries());
      const res = await fetch('/cart/add.js', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) });
      if(res.ok){
        dataLayer.push({ event:'add_to_cart', ecommerce: { currency: window.themeSettings.shopCurrency, value: 0 } });
        qs('#a11y-live').textContent = 'Added to cart';
        open();
        renderCart();
      } else { qs('#a11y-live').textContent = 'Add to cart failed'; }
    });

    // Begin checkout analytics
    qsa('[data-begin-checkout]', drawer).forEach(a=> a.addEventListener('click', ()=>{
      dataLayer.push({ event:'begin_checkout' });
    }));
  }

  // Variant Handling
  function initVariants(){
    const productSection = qs('.main-product');
    if(!productSection) return;
    const productJson = qs('[data-product-json]');
    if(!productJson) return;
    const product = JSON.parse(productJson.textContent);
    const variantIdInput = qs('[data-variant-id]', productSection);
    const priceEl = qs('[data-price]', productSection);
    const skuEl = qs('[data-sku]', productSection);

    function renderForVariant(variant){
      if(!variant) return;
      variantIdInput.value = variant.id;
      if(priceEl){ priceEl.innerHTML = variant.compare_at_price > variant.price ?
        `<span class="price--sale">${money(variant.price)}</span> <s class="price--compare">${money(variant.compare_at_price)}</s>` :
        `<span>${money(variant.price)}</span>`; }
      if(skuEl){ skuEl.textContent = variant.sku || ''; }
      const media = qsa(`[data-media-id="${variant.featured_media?.id}"]`, productSection)[0];
      if(media) media.scrollIntoView({ behavior:'smooth', block:'center' });
      const url = new URL(window.location.href); url.searchParams.set('variant', variant.id); history.replaceState({}, '', url);
    }

    function findVariant(selected){
      const match = product.variants.find(v => v.options.every((opt, idx)=> opt === selected[idx]));
      return match && match.available ? match : match || product.variants[0];
    }

    const selected = product.options.map(()=>null);
    qsa('.swatch', productSection).forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const idx = Number(btn.closest('[data-option-index]').dataset.optionIndex);
        selected[idx] = btn.dataset.value;
        qsa('.swatch', btn.closest('.swatches')).forEach(b=> b.setAttribute('aria-pressed','false'));
        btn.setAttribute('aria-pressed','true');
        const variant = findVariant(selected.map((v,i)=> v ?? product.variants[0].options[i]));
        renderForVariant(variant);
      });
    });

    // initial from URL
    const urlParams = new URLSearchParams(window.location.search);
    const initial = urlParams.get('variant');
    const initialVariant = initial ? product.variants.find(v=> String(v.id)===initial) : product.selected_or_first_available_variant || product.variants[0];
    if(initialVariant) renderForVariant(initialVariant);

    // view_item analytics
    dataLayer.push({ event:'view_item', ecommerce:{ items:[{ item_id: product.id, item_name: product.title }] }});
  }

  // Collection Filters & Sorting
  function initCollectionFilters(){
    const gridSection = qs('.product-grid');
    const filtersForm = qs('#filters-form');
    if(!gridSection) return;

    function buildQueryFromUI(){
      const params = new URLSearchParams(window.location.search);
      if(filtersForm){
        // Clear params we manage
        ['vendor[]','tag[]','price_min','price_max','sort_by','page'].forEach(k=> params.delete(k));
        qsa('input[name="vendor[]"]:checked', filtersForm).forEach(inp=> params.append('vendor[]', inp.value));
        qsa('input[name="tag[]"]:checked', filtersForm).forEach(inp=> params.append('tag[]', inp.value));
        const min = qs('input[name="price_min"]', filtersForm)?.value;
        const max = qs('input[name="price_max"]', filtersForm)?.value;
        const sort = qs('select[name="sort_by"]', filtersForm)?.value;
        if(min) params.set('price_min', min);
        if(max) params.set('price_max', max);
        if(sort) params.set('sort_by', sort);
        params.delete('page');
      }
      return params.toString();
    }
    async function fetchGrid(){
      const base = window.location.pathname;
      const qsParams = buildQueryFromUI();
      const url = `${base}?section_id=${gridSection.dataset.sectionId}${qsParams ? '&'+qsParams : ''}`;
      const html = await fetch(url).then(r=>r.text());
      const tmp = document.createElement('div'); tmp.innerHTML = html;
      const updated = tmp.querySelector('#product-grid-items');
      if(updated){ qs('#product-grid-items').replaceWith(updated); }
    }

    window.addEventListener('popstate', fetchGrid);

    document.addEventListener('change', (e)=>{
      if(!(e.target.closest('#filters-form'))) return;
      const base = window.location.pathname;
      const qsParams = buildQueryFromUI();
      const newUrl = `${base}${qsParams ? '?' + qsParams : ''}`;
      history.pushState({}, '', newUrl);
      fetchGrid();
    });
  }

  document.addEventListener('DOMContentLoaded', function(){
    initPredictiveSearch();
    initCartDrawer();
    initVariants();
    initCollectionFilters();
  });
})();
