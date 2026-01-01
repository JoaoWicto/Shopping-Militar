// Admin dashboard script (limpo, unificado)
const ADMIN_PASSWORD = 'admin@123';

function loadProductsAdmin(){ try{ const raw = localStorage.getItem('sm_products'); return raw? JSON.parse(raw): []; }catch(e){ return []; } }
function saveProductsAdmin(list){ localStorage.setItem('sm_products', JSON.stringify(list)); window.dispatchEvent(new Event('productsUpdated')); }

function loadOrders(){ try{ const raw = localStorage.getItem('sm_orders'); return raw? JSON.parse(raw): []; }catch(e){ return []; } }

function renderProductsAdmin(){ const list = loadProductsAdmin(); const holder = document.getElementById('admin-products'); if(!holder) return; holder.innerHTML=''; if(!list.length){ holder.innerHTML = '<p>Nenhum produto cadastrado</p>'; return } list.forEach(p=>{ const el = document.createElement('div'); el.className='card'; el.innerHTML = `
    <img src="${p.img}" alt="${p.name}" />
    <h4>${p.name}</h4>
    <div style="font-size:.9rem;color:#bbb">SKU: ${p.sku||'-'}</div>
    <div style="font-size:.9rem;color:#bbb">Estoque: ${p.stock||0}</div>
    <div style="font-size:.9rem;color:#bbb">Categoria: ${p.category}</div>
    <div style="margin-top:.5rem">R$ ${Number(p.price||0).toFixed(2)}</div>
    <div style="margin-top:.5rem"><button class="btn edit" data-id="${p.id}">Editar</button> <button class="btn outline delete" data-id="${p.id}">Excluir</button></div>
  `; holder.appendChild(el); }) }

function renderOrdersAdmin(){
  const orders = loadOrders(); const holder = document.getElementById('admin-orders'); if(!holder) return; holder.innerHTML='';
  if(!orders.length){ holder.innerHTML = '<p>Nenhum pedido</p>'; return }
  // exibir cada pedido em uma linha resumida com campo de nota e botão 'Marcar como Entregue'
  orders.slice().reverse().forEach(o=>{
    const row = document.createElement('div'); row.className = 'order-row';
    const info = document.createElement('div'); info.innerHTML = `<div><strong>${o.id}</strong> - ${new Date(o.date).toLocaleString()}</div><div class="meta">${(o.userName||'')} • R$ ${Number(o.total||0).toFixed(2)}</div><div class="small-muted">${o.userEmail||''} • ${o.userPhone||''}</div><div style="margin-top:.4rem;color:var(--muted)">Endereço: ${o.userAddress||'-'}</div><div style="margin-top:.4rem;color:var(--muted)">Itens: ${(o.items||[]).map(it=>`${it.name} x${it.qty}`).join(', ')}</div>`;
    const actions = document.createElement('div'); actions.style.display='flex'; actions.style.flexDirection='column'; actions.style.gap='6px';
    const note = document.createElement('input'); note.className='note-input'; note.placeholder='Nota/observação (visível ao salvar)'; note.value = o.note || '';
  const btn = document.createElement('button'); btn.className='btn btn-primary'; btn.textContent = 'Marcar como Entregue';
    btn.addEventListener('click', ()=>{ // confirmar e remover pedido entregue
      if(!confirm('Confirmar remoção do pedido como entregue? Esta ação vai excluir o pedido da lista.')) return;
      const ordersAll = loadOrders(); const idx = ordersAll.findIndex(x=>x.id === o.id); if(idx===-1) return; // opcionalmente salvar nota antes de remover (aqui não arquivamos)
      ordersAll.splice(idx,1); saveOrders(ordersAll); // re-render e notificar
      renderOrdersAdmin(); renderSummary(); renderDashboardStats(); window.dispatchEvent(new Event('ordersUpdated'));
    });
    actions.appendChild(note); actions.appendChild(btn);
    row.appendChild(info); row.appendChild(actions); holder.appendChild(row);
  })
}

// Renderizar clientes cadastrados (sm_users)
function loadUsersAdmin(){ try{ const raw = localStorage.getItem('sm_users'); return raw? JSON.parse(raw): []; }catch(e){ return []; } }

function renderClientsAdmin(){ const users = loadUsersAdmin(); const holder = document.getElementById('admin-clients'); if(!holder) return; holder.innerHTML=''; if(!users.length){ holder.innerHTML='<p>Nenhum cliente cadastrado</p>'; return } users.forEach(u=>{ const el = document.createElement('div'); el.className='card'; el.innerHTML = `<h4>${u.name || '(sem nome)'}</h4><div class="small-muted">${u.email}</div><div style="margin-top:.4rem">Telefone: ${u.phone||'-'}</div><div style="margin-top:.4rem;color:var(--muted)">Endereço: ${u.address||'-'}</div>`; holder.appendChild(el); }); }

function exportClientsCsv(){ const users = loadUsersAdmin(); if(!users.length){ alert('Nenhum cliente para exportar'); return } const rows=[['Nome','Email','Telefone','Endereço']].concat(users.map(u=>[u.name||'',u.email||'',u.phone||'',u.address||''])); const csv = rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n'); const blob = new Blob([csv],{type:'text/csv'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download=`clientes_${Date.now()}.csv`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); }

/*
  AVISO: A ação abaixo envia dados de clientes para o número de WhatsApp configurado em `WA_NUMBER`.
  Isso pode expor informações pessoais em um canal externo. Use com cuidado.
*/
function sendClientsToWhatsApp(){ const users = loadUsersAdmin(); if(!users.length){ alert('Nenhum cliente para enviar'); return } const lines = users.map(u=>`Nome: ${u.name||''} | Email: ${u.email||''} | Tel: ${u.phone||''} | End: ${u.address||''}`); const text = `Lista de clientes:\n\n` + lines.join('\n'); const wa = window.WA_NUMBER || window.WA_NUMBER || '5591992822349'; const url = `https://wa.me/${wa}?text=` + encodeURIComponent(text); window.open(url,'_blank'); }

// preencher estatísticas detalhadas no painel (vendas e valor total)
function renderDashboardStats(){ const s = summarizeSales(); const el = document.getElementById('dashboard-stats'); if(!el) return; el.innerHTML = `<div class="admin-grid"><div class="summary-box"><strong>Vendas totais:</strong> ${s.count}</div><div class="summary-box" style="margin-left:1rem"><strong>Valor total vendido:</strong> R$ ${Number(s.total||0).toFixed(2)}</div></div>` }


function summarizeSales(){ const orders = loadOrders(); const total = orders.reduce((s,o)=>s + Number(o.total||0),0); const byMonth = {}; orders.forEach(o=>{ try{ const d = new Date(o.date); const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; byMonth[key] = (byMonth[key]||0) + Number(o.total||0); }catch(e){} }); return { total, byMonth, count: orders.length }; }

function topProducts(limit=10){ const orders = loadOrders(); const counts = {}; orders.forEach(o=>{ (o.items||[]).forEach(it=>{ counts[it.name] = (counts[it.name]||0) + (it.qty||0); }); }); const arr = Object.keys(counts).map(name=>({name, qty: counts[name]})); arr.sort((a,b)=>b.qty-a.qty); return arr.slice(0,limit); }

async function renderChart(){ const canvas = document.getElementById('sales-chart'); if(!canvas) return; const stats = summarizeSales(); const keys = Object.keys(stats.byMonth).sort(); const values = keys.map(k=> Number(stats.byMonth[k]||0)); // numeric
  // destroy existing chart
  if(window._adminChart){ try{ window._adminChart.destroy(); }catch(e){} window._adminChart = null }
  // prepare data
  const labels = keys.length ? keys : ['Sem vendas'];
  const data = keys.length ? values : [1];
  const colors = labels.map((_,i)=>['#6b7b37','#557233','#8aa74a','#4d5b2a','#7d8b4f'][i%5]);
  const ctx = canvas.getContext('2d');
  window._adminChart = new Chart(ctx, {
    type: 'doughnut',
    data: { labels, datasets: [{ data, backgroundColor: colors }] },
    options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{position:'bottom'}, tooltip:{callbacks:{label:function(ctx){ const v = ctx.raw || 0; return `${ctx.label}: R$ ${Number(v).toFixed(2)}` }}}} }
  });
  return window._adminChart;
}

// reagir a atualizações
window.addEventListener('ordersUpdated', ()=>{ renderChart(); renderOrdersAdmin(); renderSummary(); });
window.addEventListener('productsUpdated', ()=>{ renderProductsAdmin(); });

function exportCsvTop(){ const top = topProducts(50); const rows = [['Produto','Quantidade']].concat(top.map(r=>[r.name, r.qty])); const csv = rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n'); const blob = new Blob([csv],{type:'text/csv'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `top_produtos_${Date.now()}.csv`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); }

async function exportPdfReport(){ const { jsPDF } = window.jspdf; const doc = new jsPDF('p','mm','a4'); doc.setFontSize(14); doc.text('Relatório - Shopping Militar',14,20); const stats = summarizeSales(); doc.setFontSize(12); doc.text(`Total de pedidos: ${stats.count}`,14,28); doc.text(`Valor total vendido: R$ ${Number(stats.total).toFixed(2)}`,14,34);
  // incluir tabela simples com top produtos
  const top = topProducts(50); let y = 50; doc.setFontSize(11); doc.text('Produtos mais vendidos',14,y); y+=8; doc.setFontSize(10);
  doc.text('Produto - Quantidade',14,y); y+=6;
  top.forEach(t=>{ doc.text(`${t.name} - ${t.qty}`,14,y); y+=6; if(y>270){ doc.addPage(); y=20 } });
  // incluir lista resumida de pedidos (até 30)
  const orders = loadOrders(); if(orders && orders.length){ doc.addPage(); doc.setFontSize(12); doc.text('Pedidos (resumo)',14,20); y=28; doc.setFontSize(10); orders.slice(-30).reverse().forEach(o=>{ const itemsText = (o.items||[]).map(it=>`${it.name} x${it.qty}`).join('; '); doc.text(`${o.id} - ${new Date(o.date).toLocaleString()} - R$ ${Number(o.total||0).toFixed(2)}`,14,y); y+=5; doc.text(`Cliente: ${o.userName || ''} - ${o.userEmail || ''}`,14,y); y+=5; doc.text(`Endereço: ${o.userAddress || '-'}`,14,y); y+=5; doc.text(`Itens: ${itemsText}`,14,y); y+=8; if(y>270){ doc.addPage(); y=20 } }); }
  doc.save(`relatorio_dashboard_${Date.now()}.pdf`);
}

document.addEventListener('DOMContentLoaded', ()=>{
  const adminLoginForm = document.getElementById('admin-login-form'); const adminPanel = document.getElementById('admin-panel'); const adminLogin = document.getElementById('admin-login');
  function isAdminAuthenticated(){ return localStorage.getItem('sm_admin_auth') === '1' }
  function setAdminAuth(v){ if(v) localStorage.setItem('sm_admin_auth','1'); else localStorage.removeItem('sm_admin_auth') }

  function showAdmin(){ if(adminLogin) adminLogin.style.display='none'; if(adminPanel) adminPanel.style.display='block'; initAdmin(); }

  if(isAdminAuthenticated()){ showAdmin() }
  if(adminLoginForm){ adminLoginForm.addEventListener('submit', e=>{ e.preventDefault(); const pw = (new FormData(adminLoginForm)).get('password'); if(pw===ADMIN_PASSWORD){ setAdminAuth(true); showAdmin(); } else { alert('Senha inválida') } }); }
});

function initAdmin(){ renderProductsAdmin(); renderOrdersAdmin(); renderSummary(); renderChart();
  // abas: Dashboard / Produtos / Clientes / Pedidos
  const tabDash = document.getElementById('tab-dashboard'); const tabProducts = document.getElementById('tab-products'); const tabClients = document.getElementById('tab-clients'); const tabOrders = document.getElementById('tab-orders');
  const panelDash = document.getElementById('panel-dashboard'); const panelProducts = document.getElementById('panel-products'); const panelClients = document.getElementById('panel-clients'); const panelOrders = document.getElementById('panel-orders');
  function showPanel(p){ [panelDash,panelProducts,panelClients,panelOrders].forEach(x=>{ if(!x) return; x.style.display = x===p? 'block' : 'none' }); }
  if(tabDash){ tabDash.addEventListener('click', ()=>{ showPanel(panelDash); }); }
  if(tabProducts){ tabProducts.addEventListener('click', ()=>{ showPanel(panelProducts); }); }
  if(tabClients){ tabClients.addEventListener('click', ()=>{ showPanel(panelClients); renderClientsAdmin(); }); }
  if(tabOrders){ tabOrders.addEventListener('click', ()=>{ showPanel(panelOrders); renderOrdersAdmin(); }); }
  // form: suporta editar/atualizar
  const form = document.getElementById('product-form'); if(!form) return;
  form.dataset.editId = '';
  form.addEventListener('submit', e=>{ e.preventDefault(); const fd = new FormData(form); const name = fd.get('name'); const category = fd.get('category'); const price = Number(fd.get('price')||0); const img = fd.get('img'); const sku = fd.get('sku'); const stock = Number(fd.get('stock')||0); const products = loadProductsAdmin(); const editId = form.dataset.editId; if(editId){ // atualizar
      const id = Number(editId); const idx = products.findIndex(p=>p.id===id); if(idx>-1){ products[idx] = {...products[idx], name, category, price, img, sku, stock}; saveProductsAdmin(products); form.reset(); form.dataset.editId = ''; renderProductsAdmin(); renderSummary(); alert('Produto atualizado'); return } }
    // adicionar novo
    const id = products.length? Math.max(...products.map(p=>p.id))+1 : 1; products.push({id,name,category,price,img,sku,stock}); saveProductsAdmin(products); form.reset(); renderProductsAdmin(); renderSummary(); alert('Produto salvo'); });

  document.addEventListener('click', e=>{
    if(e.target.classList.contains('edit')){ const id = Number(e.target.dataset.id); const products = loadProductsAdmin(); const p = products.find(x=>x.id===id); if(!p) return; const form = document.getElementById('product-form'); form.name.value = p.name; form.category.value = p.category; form.price.value = p.price; form.img.value = p.img; form.sku.value = p.sku||''; form.stock.value = p.stock||0; form.dataset.editId = String(id); }
    if(e.target.classList.contains('delete')){ if(!confirm('Excluir este produto?')) return; const id = Number(e.target.dataset.id); let products = loadProductsAdmin(); products = products.filter(x=>x.id!==id); saveProductsAdmin(products); renderProductsAdmin(); renderSummary(); }
  });

  const expCsv = document.getElementById('export-csv'); if(expCsv) expCsv.addEventListener('click', exportCsvTop);
  const expPdf = document.getElementById('export-pdf'); if(expPdf) expPdf.addEventListener('click', async ()=>{ await renderChart(); exportPdfReport(); });
  const expClientsCsv = document.getElementById('export-clients-csv'); if(expClientsCsv) expClientsCsv.addEventListener('click', exportClientsCsv);
  const expClientsWa = document.getElementById('export-clients-wa'); if(expClientsWa) expClientsWa.addEventListener('click', sendClientsToWhatsApp);
  const clearBtn = document.getElementById('clear-products'); if(clearBtn) clearBtn.addEventListener('click', ()=>{ if(confirm('Limpar todos os produtos?')){ saveProductsAdmin([]); renderProductsAdmin(); renderSummary(); } });
  // garantir re-render quando storage mudar (ex: outra aba)
  window.addEventListener('storage', e=>{ if(e.key==='sm_orders'){ renderChart(); renderOrdersAdmin(); renderSummary(); } if(e.key==='sm_products'){ renderProductsAdmin(); } });
}
