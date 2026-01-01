// Dados iniciais de exemplo (usados como padrão na primeira carga)
const DEFAULT_PRODUCTS = [
  {id:1,name:'Uniforme Tático',price:399.9,category:'Fardamentos',img:'https://images.unsplash.com/photo-1521805100-1a2b3c4d5e6f?auto=format&fit=crop&w=800&q=60'},
  {id:2,name:'Bota de Campo',price:299.9,category:'Botas e Coturnos',img:'https://images.unsplash.com/photo-1524706344268-6f5d9a3c1c7e?auto=format&fit=crop&w=800&q=60'},
  {id:3,name:'Mochila Tática 45L',price:249.9,category:'Mochilas Militares',img:'https://images.unsplash.com/photo-1562158070-6b31a5f5a6f6?auto=format&fit=crop&w=800&q=60'},
  {id:4,name:'Kit Primeiros Socorros',price:119.9,category:'Acessórios',img:'https://images.unsplash.com/photo-1587502536263-3a0a1a9f3f2b?auto=format&fit=crop&w=800&q=60'},
  {id:5,name:'Coletes Táticos',price:599.9,category:'Equipamentos Táticos',img:'https://images.unsplash.com/photo-1573497019234-3d5b1b9b2b3a?auto=format&fit=crop&w=800&q=60'}
];

// Persistência de produtos em localStorage (chave: sm_products)
function loadProducts(){
  try{
    const raw = localStorage.getItem('sm_products');
    if(raw){
      const parsed = JSON.parse(raw);
      if(Array.isArray(parsed) && parsed.length) return parsed;
    }
  }catch(e){console.error('erro ao ler produtos do storage',e)}
  // grava padrão e retorna cópia
  localStorage.setItem('sm_products', JSON.stringify(DEFAULT_PRODUCTS));
  return DEFAULT_PRODUCTS.slice();
}

function saveProducts(list){localStorage.setItem('sm_products', JSON.stringify(list));}

let PRODUCTS_LIST = loadProducts();

// Utilitários de DOM
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

// Estado do carrinho
function getCart(){return JSON.parse(localStorage.getItem('sm_cart')||'[]')}
function saveCart(cart){localStorage.setItem('sm_cart',JSON.stringify(cart));updateCartCount()}
function updateCartCount(){const count=getCart().reduce((s,i)=>s+i.qty,0);const els=[document.getElementById('cart-count'),document.getElementById('cart-count-page')];els.forEach(e=>{if(e)e.textContent=count})}

// Render produtos
function renderProducts(list,containerId){const cont=document.getElementById(containerId);if(!cont)return;cont.innerHTML='';list.forEach(p=>{const card=document.createElement('article');card.className='card';const skuHtml = p.sku?`<div style="font-size:.85rem;color:#bbb">SKU: ${p.sku}</div>`:'';const stockHtml = (p.stock!=null)?`<div style="font-size:.85rem;color:#bbb">Estoque: ${p.stock}</div>`:'';card.innerHTML=`<img src="${p.img}" alt="${p.name}" /><h3>${p.name}</h3>${skuHtml}${stockHtml}<div class="price">R$ ${p.price.toFixed(2)}</div><div style="display:flex;gap:.5rem"><button data-id="${p.id}" class="btn btn-primary add-to-cart">Comprar</button><button data-id="${p.id}" class="btn btn-outline details-btn">Detalhes</button></div>`;cont.appendChild(card)});}

// assegurar que, quando o admin atualizar produtos, a loja seja recarregada
window.addEventListener('productsUpdated', ()=>{ PRODUCTS_LIST = loadProducts(); initStore(); initFeatured(); });

// Inicializar destaques (home)
function initFeatured(){const featured=(PRODUCTS_LIST||[]).slice(0,4);renderProducts(featured,'featured-products')}

// Inicializar loja
function initStore(){renderProducts(PRODUCTS_LIST,'products');updateCartCount();}

// Filtros e busca
function applyFilters(){const q=(document.getElementById('search')||{value:''}).value.toLowerCase();const q2=(document.getElementById('search-page')||{value:''}).value.toLowerCase();const cat=(document.getElementById('category-filter')||{value:'all'}).value;let list=(PRODUCTS_LIST||[]).filter(p=>{const matchesQ = p.name.toLowerCase().includes(q)||p.name.toLowerCase().includes(q2);const matchesC = (cat==='all')||p.category===cat;return matchesQ && matchesC});renderProducts(list,'products');renderProducts(list.slice(0,4),'featured-products')}

// Adicionar ao carrinho
// WhatsApp número do usuário (55 + DDD + número). Aqui: 55 91 99282-2349
// ---------------------------------------------
// Configurações fáceis de alterar
// Altere abaixo a chave PIX e o número do WhatsApp usados no checkout
const WA_NUMBER = '5591992822349'; // exemplo: '5591992822349' (55 + DDD + numero)
const PIX_KEY = '7bc837f8-96b4-49c9-b70b-a82d2f02a803';
// ---------------------------------------------

// expor como variáveis globais para outras páginas (admin)
try{ window.WA_NUMBER = WA_NUMBER; window.PIX_KEY = PIX_KEY }catch(e){}

// Tema (light/dark) - toggle global
// Forçar tema escuro como padrão e remover opção de troca
function setTheme(theme){
  if(theme==='light') document.documentElement.classList.add('theme-light'); else document.documentElement.classList.remove('theme-light');
  localStorage.setItem('sm_theme', theme);
}
function initTheme(){
  // Força dark por padrão
  const saved = localStorage.getItem('sm_theme') || 'dark';
  setTheme('dark');
}

// (Removidas funções de geração de QR e CRC — agora usamos mensagem simples por WhatsApp)

// Autenticação simples (demo)
function getUser(){return JSON.parse(localStorage.getItem('sm_user')||'null')}
function setUser(user){localStorage.setItem('sm_user',JSON.stringify(user));updateLoginUI()}
function logoutUser(){localStorage.removeItem('sm_user');updateLoginUI()}
function updateLoginUI(){
  const user = getUser();
  const inHtmlFolder = window.location.pathname.includes('/html/');
  const link = document.getElementById('login-link');
  const linkPage = document.getElementById('login-link-page');
  if(user){
    if(link){ link.textContent = 'Sair'; link.href = '#'; }
    if(linkPage){ linkPage.textContent = 'Sair'; linkPage.href = '#'; }
  } else {
    // se estamos numa página dentro de /html/, o link relativo deve apontar para login.html local;
    // caso contrário (página raiz), apontar para html/login.html
    const hrefForRoot = 'html/login.html';
    const hrefForHtml = 'login.html';
    if(link){ link.textContent = 'Entrar'; link.href = inHtmlFolder ? hrefForHtml : hrefForRoot; }
    if(linkPage){ linkPage.textContent = 'Entrar'; linkPage.href = inHtmlFolder ? hrefForHtml : hrefForRoot; }
  }
}

document.addEventListener('click', async e=>{
  if(e.target.classList.contains('add-to-cart')){
    const id=Number(e.target.dataset.id);
    const prod=(PRODUCTS_LIST||[]).find(p=>p.id===id);
    const cart=getCart();
    const existing=cart.find(i=>i.id===id);
    if(existing){existing.qty+=1}else{cart.push({id:prod.id,name:prod.name,price:prod.price,qty:1})}
    saveCart(cart);
  }

  // controles do carrinho (aumentar, diminuir, remover)
  if(e.target.classList.contains('cart-inc')){
    const id = Number(e.target.dataset.id); const cart = getCart(); const it = cart.find(x=>x.id===id); if(it){ it.qty+=1; saveCart(cart); renderCart(); }
  }
  if(e.target.classList.contains('cart-dec')){
    const id = Number(e.target.dataset.id); const cart = getCart(); const it = cart.find(x=>x.id===id); if(it){ it.qty = Math.max(0,it.qty-1); if(it.qty===0) { const updated = cart.filter(x=>x.id!==id); saveCart(updated); } else saveCart(cart); renderCart(); }
  }
  if(e.target.classList.contains('cart-remove')){
    const id = Number(e.target.dataset.id); const cart = getCart(); const updated = cart.filter(x=>x.id!==id); saveCart(updated); renderCart();
  }

  if(e.target.id==='cart-btn' || e.target.id==='cart-btn-page'){openCart()}
  if(e.target.id==='close-cart'){closeCart()}
  if(e.target.id==='clear-cart'){saveCart([]);renderCart()}

  // login/logout link behaviour
  if(e.target.id==='login-link' || e.target.id==='login-link-page'){
    const user=getUser();
    if(user){ // se já logado, sair
      e.preventDefault();
      logoutUser();
      alert('Você saiu.');
    }
  }

  // checkout: abrir WhatsApp com resumo (requer login)
  if(e.target.id==='checkout'){
    const cart=getCart();
    if(cart.length===0){alert('Seu carrinho está vazio.');return}
    const user=getUser();
    if(!user){
      // redireciona imediatamente para a página de login
      const path = window.location.pathname;
      const loginUrl = path.endsWith('index.html') || path.endsWith('/') ? 'html/login.html' : 'login.html';
      window.location.href = loginUrl;
      return;
    }
    // criar pedido, salvar e redirecionar para WhatsApp com a mensagem formatada
    const order = createOrder('PIX');
    if(!order){ alert('Erro ao criar o pedido.'); return }
    const msgBase = orderToWhatsAppMessage(order);
    const pixNote = `\n\nChave PIX: ${PIX_KEY}`;
    const instructions = `\n\nInstruções de pagamento:\n1) Abra seu app bancário e faça um Pix para a chave acima.\n2) No campo "Identificador/Descrição" coloque o TXID informada abaixo.\n3) Envie o comprovante (foto) nesta mesma conversa do WhatsApp.`;
    const validity = `\n\nValidade do pagamento: 2 horas a partir da geração do pedido.`;
    const txidNote = `\n\nTXID do pedido: ${order.txid || '-'} `;
    const msg = msgBase + pixNote + txidNote + instructions + validity;
    const waUrl = `https://wa.me/${WA_NUMBER}?text=` + encodeURIComponent(msg);
    // limpar carrinho
    saveCart([]);
    // abrir WhatsApp com a mensagem (sem abrir QR)
    window.open(waUrl,'_blank');
    closeCart();
  }

  // tema toggle
  // removido handler de troca de tema — tema fixo escuro
});

// Modal carrinho
function openCart(){const modal=document.getElementById('cart-modal');modal.setAttribute('aria-hidden','false');renderCart()}
function closeCart(){const modal=document.getElementById('cart-modal');modal.setAttribute('aria-hidden','true')}

// sincroniza alterações de produtos entre abas (storage event dispara em outras janelas)
window.addEventListener('storage', (e)=>{
  if(e.key==='sm_products'){
    PRODUCTS_LIST = loadProducts(); initStore(); initFeatured(); updateCartCount();
  }
});

  // detalhes do produto (modal)
  document.addEventListener('click', e=>{
    if(e.target.classList.contains('details-btn')){
      const id = Number(e.target.dataset.id); const p = (PRODUCTS_LIST||[]).find(x=>x.id===id); if(!p) return;
      const content = document.getElementById('product-modal-content'); content.innerHTML = `<h3>${p.name}</h3><img src="${p.img}" style="width:100%;height:220px;object-fit:cover;border-radius:6px"/><p style="margin-top:.5rem">Categoria: ${p.category}</p><p>Preço: R$ ${p.price.toFixed(2)}</p><p>SKU: ${p.sku||'-'}</p><p>Estoque: ${p.stock!=null?p.stock:'-'}</p><div style="margin-top:.75rem"><button class="btn btn-primary add-to-cart" data-id="${p.id}">Adicionar ao carrinho</button> <button id="close-product-modal" class="btn btn-outline">Fechar</button></div>`;
      const modal = document.getElementById('product-modal'); if(modal) modal.setAttribute('aria-hidden','false');
    }
    if(e.target.id==='close-product-modal' || e.target.id==='close-product-modal'){
      const modal = document.getElementById('product-modal'); if(modal) modal.setAttribute('aria-hidden','true');
    }
  });

// Render cart com controles
function renderCart(){const holder=document.getElementById('cart-items');if(!holder)return;const cart=getCart();holder.innerHTML='';if(cart.length===0){holder.innerHTML='<p>Carrinho vazio</p>';document.getElementById('cart-total').textContent='0.00';return;}let total=0;cart.forEach(item=>{total+=item.price*item.qty;const el=document.createElement('div');el.className='cart-row';el.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center"><div><strong>${item.name}</strong><div style="font-size:.9rem;color:#ccc">R$ ${item.price.toFixed(2)} cada</div></div><div style="text-align:right"><div>Qtd: <button class="btn cart-dec" data-id="${item.id}">-</button> ${item.qty} <button class="btn cart-inc" data-id="${item.id}">+</button></div><div style="margin-top:.4rem"><button class="btn cart-remove" data-id="${item.id}">Remover</button></div></div></div>`;holder.appendChild(el)});document.getElementById('cart-total').textContent=total.toFixed(2)}

// ----- Usuários e Pedidos -----
function loadUsers(){try{return JSON.parse(localStorage.getItem('sm_users')||'[]')}catch(e){return []}}
function saveUsers(list){localStorage.setItem('sm_users',JSON.stringify(list))}

function loadOrders(){try{return JSON.parse(localStorage.getItem('sm_orders')||'[]')}catch(e){return []}}
function saveOrders(list){localStorage.setItem('sm_orders',JSON.stringify(list))}

function generateOrderCode(){const now=Date.now().toString(36);return 'SM-'+now.slice(-6).toUpperCase()}

function generateTxId(){
  return 'TX-'+Date.now().toString(36).slice(-6).toUpperCase() + '-' + Math.random().toString(36).slice(2,8).toUpperCase();
}

function createOrder(paymentMethod='PIX'){
  const cart = getCart(); if(!cart.length) return null;
  const user = getUser(); if(!user) return null;
  const code = generateOrderCode();
  const txid = generateTxId();
  const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
  const order = {id:code, txid, userEmail:user.email, userName:user.name||'', userAddress:user.address||'', userPhone:user.phone||'', items:cart, total, paymentMethod, date:new Date().toISOString()};
  const orders = loadOrders(); orders.push(order); saveOrders(orders);
  // notificar outras partes (ex: admin) que há novos pedidos
  try{ notifyOrdersUpdated(); }catch(e){ console.warn('notifyOrdersUpdated falhou',e) }
  return order;
}



// Notificar outras partes da aplicação que os pedidos foram atualizados
function notifyOrdersUpdated(){ try{ window.dispatchEvent(new Event('ordersUpdated')); }catch(e){ console.warn('não foi possível disparar ordersUpdated',e) } }

function orderToWhatsAppMessage(order){
  // Formato: nome do cliente, código, produtos (nome e qty), endereço, email, pagamento PIX
  let msg = `Pedido - ${order.id}\nCliente: ${order.userName}\nEmail: ${order.userEmail}\nTelefone: ${order.userPhone}\nEndereço: ${order.userAddress}\n\nProdutos:\n`;
  order.items.forEach(it=>{ msg += `- ${it.name} x ${it.qty}\n` });
  msg += `\nTotal: R$ ${order.total.toFixed(2)}\nPagamento: ${order.paymentMethod}`;
  return msg;
}

// Inicialização UI
document.addEventListener('DOMContentLoaded',()=>{initTheme();initFeatured();initStore();updateCartCount();
  // eventos de busca e filtro
  const s=document.getElementById('search');if(s)s.addEventListener('input',applyFilters);
  const s2=document.getElementById('search-page');if(s2)s2.addEventListener('input',applyFilters);
  const cat=document.getElementById('category-filter');if(cat)cat.addEventListener('change',applyFilters);
  // formulário de contato (simples)
  const form=document.getElementById('contact-form');if(form)form.addEventListener('submit',e=>{e.preventDefault();alert('Mensagem recebida. Entraremos em contato.');form.reset()});
  // whatsapp
  const waBtn=document.getElementById('whatsapp-float');if(waBtn){waBtn.href=`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Olá, tenho interesse em seus produtos')}`;}
  const waLink=document.getElementById('whatsapp-link');if(waLink)waLink.href=waBtn.href;
  // fechar modal quando clicado fora
  const modal=document.getElementById('cart-modal');if(modal)modal.addEventListener('click',e=>{if(e.target===modal)closeCart()});
  // ouvir atualizações vindas do admin
  window.addEventListener('productsUpdated', ()=>{
    PRODUCTS_LIST = loadProducts();
    initStore(); initFeatured();
  });
  // login UI
  updateLoginUI();
  const loginForm = document.getElementById('login-form');
  if(loginForm){
    loginForm.addEventListener('submit',e=>{
      e.preventDefault();
      const fd = new FormData(loginForm);
      const email = fd.get('email');
      const password = fd.get('password');
      // autenticação: verificar usuários cadastrados
      const users = loadUsers();
      const u = users.find(x=>x.email===email && x.password===password);
      const status = document.getElementById('login-status');
      if(!u){ if(status) status.innerHTML = '<p style="color:tomato">Credenciais inválidas</p>'; return }
      // salvar no sm_user (sessão local) apenas os campos necessários
      const sessionUser = { name: u.name, email: u.email, phone: u.phone, address: u.address, cep: u.cep, street: u.street, number: u.number, district: u.district, complement: u.complement, reference: u.reference };
      setUser(sessionUser);
      if(status) status.innerHTML = '<p>Login realizado com sucesso.</p>';
      // após login, redirecionar para a página da loja
      setTimeout(()=>{
        const path = window.location.pathname;
        const storeUrl = path.includes('/html/') ? 'loja.html' : 'html/loja.html';
        window.location.href = storeUrl;
      },800);
    });
  }
  // registro
  const registerForm = document.getElementById('register-form');
  if(registerForm){
    registerForm.addEventListener('submit', e=>{
      e.preventDefault();
      const fd = new FormData(registerForm);
      const name = fd.get('name'); const email = fd.get('email'); const password = fd.get('password'); const phone = fd.get('phone');
      const cep = fd.get('cep'); const street = fd.get('street'); const number = fd.get('number'); const district = fd.get('district'); const complement = fd.get('complement'); const reference = fd.get('reference'); const address = fd.get('address');
      const users = loadUsers();
      if(users.find(x=>x.email===email)){ alert('Email já cadastrado'); return }
      const user = {name,email,password,phone,cep,street,number,district,complement,reference,address}; users.push(user); saveUsers(users);
      // salvar na sessão local sem a senha
      const sessionUser = { name, email, phone, address, cep, street, number, district, complement, reference };
      setUser(sessionUser);
  alert('Cadastro realizado'); setTimeout(()=>{ const path = window.location.pathname; const storeUrl = path.includes('/html/') ? 'loja.html' : 'html/loja.html'; window.location.href = storeUrl; },700);
    })
  }
  // usar localização
  const useLocBtn = document.getElementById('use-location');
  if(useLocBtn){
    useLocBtn.addEventListener('click', ()=>{
      const status = document.getElementById('loc-status');
      if(!navigator.geolocation){ if(status) status.textContent='Geolocalização não suportada'; return }
      status.textContent='Obtendo localização...';
      navigator.geolocation.getCurrentPosition(pos=>{
        const lat = pos.coords.latitude; const lon = pos.coords.longitude;
        // preencher o campo address com lat/lon (o ideal seria reverse-geocoding com API externa)
        const addr = `Lat:${lat.toFixed(5)}, Lon:${lon.toFixed(5)}`;
        const addrEl = registerForm.querySelector('[name="address"]'); if(addrEl) addrEl.value = addr;
          // caso o usuário já esteja logado, atualize a sessão e usuários salvos
          const session = getUser();
          if(session){ session.address = addr; setUser(session); }
        if(status) status.textContent='Localização preenchida';
      }, err=>{ if(status) status.textContent='Erro ao obter localização' })
    })
  }

    // autopreencher formulário de registro com dados do usuário logado (se houver)
    const regForm = document.getElementById('register-form');
    const session = getUser();
    if(regForm && session){ ['name','email','phone','address','cep','street','number','district','complement','reference'].forEach(k=>{ const el = regForm.querySelector(`[name="${k}"]`); if(el && session[k]) el.value = session[k]; }); }

  // reclamações
  const complaintForm = document.getElementById('complaint-form');
  if(complaintForm){
    complaintForm.addEventListener('submit', e=>{
      e.preventDefault();
      const fd = new FormData(complaintForm);
      const name = fd.get('name'); const email = fd.get('email'); const product = fd.get('product'); const rating = Number(fd.get('rating')); const message = fd.get('message');
      const complaints = JSON.parse(localStorage.getItem('sm_complaints')||'[]');
      complaints.push({id: 'C-'+Date.now().toString(36).slice(-6).toUpperCase(), name,email,product,rating,message,date:new Date().toISOString()});
      localStorage.setItem('sm_complaints', JSON.stringify(complaints));
      const st = document.getElementById('complaint-status'); if(st) st.innerHTML='<p>Reclamação enviada. Obrigado.</p>';
      complaintForm.reset();
    })
  }

  // acompanhar pedido
  const trackForm = document.getElementById('track-form');
  if(trackForm){
    trackForm.addEventListener('submit', e=>{
      e.preventDefault();
      const fd = new FormData(trackForm); const code = fd.get('code');
      const orders = loadOrders(); const o = orders.find(x=>x.id===code);
      const res = document.getElementById('track-result');
      if(!o){ if(res) res.innerHTML = '<p>Pedido não encontrado</p>'; return }
      if(res) res.innerHTML = `<div class="card"><h3>${o.id}</h3><p>Cliente: ${o.userName}</p><p>Status: Em processamento</p><p>Total: R$ ${o.total.toFixed(2)}</p></div>`;
    })
  }
});
