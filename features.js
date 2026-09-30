/* Load this AFTER script.js. Uses localStorage as a demo database. */
(()=>{
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const get=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}};
const set=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const enc=s=>btoa(unescape(encodeURIComponent(s)));
const stars=n=>"★".repeat(Math.round(n))+"☆".repeat(5-Math.round(n));
const today=()=>new Date().toISOString().slice(0,10);
const root=document.documentElement;
const codes=()=>get("lw-codes",{WELCOME10:10});

/* ---------- data ---------- */
let users=get("lw-users",[]);
if(!users.some(u=>u.role==="admin")){users.push({name:"Admin",email:"admin@leafwork.com",pass:enc("admin123"),role:"admin"});set("lw-users",users)}
const me=()=>users.find(u=>u.email===get("lw-session",""));
const wkey=()=>"lw-wish-"+(me()?me().email:"guest");
const wish=()=>get(wkey(),[]);
const savedP=get("lw-products",null);
if(savedP){P.length=0;P.push(...savedP)}
Object.keys(cart).forEach(id=>{if(!P.find(p=>p.id==id))delete cart[id]});save();
let code=get("lw-code","");if(!codes()[code])code="";
const disc=sub=>Math.round(sub*(codes()[code]||0)/100);
if(get("lw-theme",""))root.dataset.theme=get("lw-theme","");

/* ---------- header: account links + theme toggle ---------- */
const u=me();
$("nav").insertAdjacentHTML("beforeend",u?`<a href="account.html">Hi, ${esc(u.name.split(" ")[0])}</a>`+(u.role==="admin"?`<a href="admin.html">Admin</a>`:""):`<a href="login.html">Log in</a>`);
$$("nav a").forEach(a=>{if(a.getAttribute("href")===page+".html")a.setAttribute("aria-current","page")});
$("#open").insertAdjacentHTML("beforebegin",`<button class="theme" id="theme" type="button" aria-label="Switch light or dark mode">◐</button>`);
$("#theme").onclick=()=>{const cur=root.dataset.theme||(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");const n=cur==="dark"?"light":"dark";root.dataset.theme=n;set("lw-theme",n)};

/* ---------- wishlist + ratings on product cards ---------- */
function decorate(){
  const w=wish(),all=get("lw-reviews",{});
  $$(".card").forEach(c=>{
    const id=+$(".add",c).dataset.id,p=P.find(x=>x.id===id),r=all[id]||[],on=w.includes(id);
    const avg=r.length?r.reduce((s,x)=>s+x.stars,0)/r.length:0;
    $(".art",c).insertAdjacentHTML("afterbegin",`<button class="heart" type="button" data-id="${id}" aria-pressed="${on}" aria-label="Save ${esc(p.name)} to wishlist">${on?"♥":"♡"}</button>`);
    $("small",c).insertAdjacentHTML("afterend",`<button class="rate" type="button" data-id="${id}">${r.length?`<span class="stars">${stars(avg)}</span> ${avg.toFixed(1)} (${r.length})`:"No reviews yet"}</button>`);
  });
  $$(".heart").forEach(b=>b.onclick=()=>toggleWish(+b.dataset.id));
  $$(".rate").forEach(b=>b.onclick=()=>openReviews(+b.dataset.id));
}
function toggleWish(id){const w=wish(),i=w.indexOf(id);if(i<0)w.push(id);else w.splice(i,1);set(wkey(),w);renderGrid();toast(i<0?"Saved to wishlist":"Removed from wishlist")}

/* ---------- reviews dialog ---------- */
document.body.insertAdjacentHTML("beforeend",`<dialog id="rev"></dialog>`);
function openReviews(id){
  const p=P.find(x=>x.id===id),all=get("lw-reviews",{}),r=all[id]||[],usr=me(),d=$("#rev");
  d.innerHTML=`<button class="x" id="revClose" type="button" aria-label="Close">×</button><h2>${esc(p.name)} reviews</h2>`
   +(r.length?r.map(x=>`<div class="line"><div class="t"><span class="stars">${stars(x.stars)}</span> <b>${esc(x.name)}</b><br>${esc(x.text)}</div><small>${x.date}</small></div>`).join(""):`<p class="empty">No reviews yet. Be the first.</p>`)
   +(usr?`<form id="revForm" style="margin-top:16px"><label>Rating<select name="stars">${[5,4,3,2,1].map(n=>`<option value="${n}">${n} star${n>1?"s":""}</option>`).join("")}</select></label><label>Your review<textarea name="text" required></textarea></label><button class="btn" type="submit">Post review</button></form>`:`<p><a href="login.html">Log in</a> to write a review.</p>`);
  if(!d.open)d.showModal();
  $("#revClose").onclick=()=>d.close();
  const f=$("#revForm");
  if(f)f.onsubmit=e=>{e.preventDefault();const fd=new FormData(f);(all[id]=all[id]||[]).push({name:usr.name,stars:+fd.get("stars"),text:fd.get("text"),date:today()});set("lw-reviews",all);renderGrid();openReviews(id)};
}
const rg=renderGrid;renderGrid=()=>{rg();decorate()};

/* ---------- discount code (cart drawer + checkout summary) ---------- */
function discountUI(){
  const sub=cartTotal(),off=disc(sub);
  if(!$("#codeRow")){
    $("#cart .total").insertAdjacentHTML("beforebegin",`<div class="coderow" id="codeRow"><input id="codeIn" placeholder="Discount code" aria-label="Discount code"><button class="add" id="codeBtn" type="button">Apply</button><small id="codeMsg" role="status"></small></div>`);
    $("#codeBtn").onclick=()=>{const v=$("#codeIn").value.trim().toUpperCase();
      if(codes()[v]){code=v;set("lw-code",v);renderCart()}
      else $("#codeMsg").textContent="That code isn't valid. Check the spelling and try again."};
  }
  $("#total").textContent=inr(sub-off);
  if(off)$("#codeMsg").textContent=`${code} applied: −${inr(off)}`;
  const st=$("#summary .total");
  if(st){if(off)st.insertAdjacentHTML("beforebegin",`<div class="line"><span class="t">Discount (${code})</span><b>−${inr(off)}</b></div>`);st.lastElementChild.textContent=inr(sub-off)}
}
const rc=renderCart;renderCart=()=>{rc();discountUI()};

/* ---------- save orders + prefill checkout ---------- */
document.addEventListener("submit",e=>{
  if(e.target.id!=="orderForm"||!Object.keys(cart).length)return;
  const f=new FormData(e.target),sub=cartTotal(),off=disc(sub),o=get("lw-orders",[]);
  o.push({id:"LW"+(1001+o.length),email:me()?me().email:f.get("email").trim().toLowerCase(),name:f.get("name"),
    items:Object.entries(cart).map(([id,q])=>({name:P.find(p=>p.id==id).name,q})),total:sub-off,code:off?code:"",date:today(),status:"Placed"});
  set("lw-orders",o);code="";localStorage.removeItem("lw-code");
},true);
if(page==="checkout"&&u){const f=$("#orderForm").elements;f.namedItem("name").value=u.name;f.namedItem("email").value=u.email}

/* ---------- login / sign-up page ---------- */
function loginPage(){
  const tabs=[["#tabIn","#loginForm"],["#tabUp","#signupForm"]];
  tabs.forEach(([t,f])=>$(t).onclick=()=>tabs.forEach(([t2,f2])=>{$(f2).classList.toggle("hidden",f2!==f);$(t2).setAttribute("aria-pressed",f2===f)}));
  $("#loginForm").onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),em=f.get("email").trim().toLowerCase();
    const x=users.find(v=>v.email===em&&v.pass===enc(f.get("pass")));
    if(!x)return $("#loginErr").textContent="Email or password is wrong. Check both and try again.";
    set("lw-session",x.email);location.href=x.role==="admin"?"admin.html":"account.html"};
  $("#signupForm").onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),em=f.get("email").trim().toLowerCase();
    if(users.some(v=>v.email===em))return $("#signupErr").textContent="That email already has an account. Log in instead.";
    users.push({name:f.get("name").trim(),email:em,pass:enc(f.get("pass")),role:"customer"});set("lw-users",users);set("lw-session",em);location.href="account.html"};
}

/* ---------- account page ---------- */
function accountPage(){
  const usr=me();if(!usr){location.href="login.html";return}
  const w=wish().map(id=>P.find(p=>p.id===id)).filter(Boolean),o=get("lw-orders",[]).filter(x=>x.email===usr.email).reverse();
  $("#acct").innerHTML=`<h1 class="atitle">Hi, ${esc(usr.name)}</h1><p>${esc(usr.email)} <button class="add" id="out" type="button">Log out</button></p><h2 class="title">Wishlist</h2>`
   +(w.length?`<div class="grid">${w.map(p=>`<article class="card"><div class="art" style="background:${p.bg}">${art(p)}</div><div class="info"><h3>${esc(p.name)}</h3><div class="row"><span class="price">${inr(p.price)}</span><span><button class="add" data-a="${p.id}">Add to cart</button> <button class="add" data-r="${p.id}" aria-label="Remove ${esc(p.name)} from wishlist">✕</button></span></div></div></article>`).join("")}</div>`:`<p class="empty">Nothing saved yet. Tap the heart on a plant to save it.</p>`)
   +`<h2 class="title">Your orders</h2>`
   +(o.length?`<div class="panel">${o.map(x=>`<div class="line"><div class="t"><b>${x.id}</b> ${x.date}<br>${x.items.map(i=>esc(i.name)+" × "+i.q).join(", ")}</div><div><b>${inr(x.total)}</b><br><small>${x.status}</small></div></div>`).join("")}</div>`:`<p class="empty">No orders yet.</p>`);
  $("#out").onclick=()=>{set("lw-session","");location.href="index.html"};
  $$("[data-a]").forEach(b=>b.onclick=()=>add(+b.dataset.a));
  $$("[data-r]").forEach(b=>b.onclick=()=>{set(wkey(),wish().filter(i=>i!==+b.dataset.r));accountPage()});
}

/* ---------- admin panel ---------- */
function adminPage(){
  const usr=me(),m=$("#admin");
  if(!usr||usr.role!=="admin"){m.innerHTML=`<h1 class="atitle">Admins only</h1><p><a href="login.html">Log in</a> with an admin account to manage the store.</p>`;return}
  const o=get("lw-orders",[]),c=codes(),cats=[...new Set(P.map(p=>p.cat))];
  m.innerHTML=`<h1 class="atitle">Admin panel</h1>
  <div class="stats"><div class="panel"><b>${o.length}</b><br>Orders</div><div class="panel"><b>${inr(o.reduce((s,x)=>s+x.total,0))}</b><br>Revenue</div><div class="panel"><b>${users.length}</b><br>Accounts</div><div class="panel"><b>${P.length}</b><br>Products</div></div>
  <h2 class="title">Orders</h2>`
  +(o.length?`<div class="tbl panel"><table><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th></tr>${o.slice().reverse().map(x=>`<tr><td>${x.id}<br><small>${x.date}</small></td><td>${esc(x.name)}<br><small>${esc(x.email)}</small></td><td>${x.items.map(i=>esc(i.name)+" × "+i.q).join(", ")}</td><td>${inr(x.total)}${x.code?`<br><small>${esc(x.code)}</small>`:""}</td><td><select data-o="${x.id}" aria-label="Status for ${x.id}">${["Placed","Shipped","Delivered"].map(s=>`<option ${s===x.status?"selected":""}>${s}</option>`).join("")}</select></td></tr>`).join("")}</table></div>`:`<p class="empty">No orders yet. They appear here after a checkout.</p>`)
  +`<h2 class="title">Products</h2><div class="panel">${P.map(p=>`<div class="line"><div class="t"><b>${esc(p.name)}</b>${esc(p.cat)}, ${inr(p.price)}</div><button class="add" data-del="${p.id}">Delete</button></div>`).join("")}
  <form id="pForm" class="two" style="margin-top:16px"><label>Name<input name="name" required></label><label>Category<input name="cat" list="cl" required><datalist id="cl">${cats.map(x=>`<option value="${esc(x)}">`).join("")}</datalist></label>
  <label>Price (₹)<input name="price" type="number" min="1" required></label><label>Shape<select name="shape"><option value="tall">Tall leaves</option><option value="round">Round bush</option><option value="trail">Trailing</option></select></label><button class="btn" type="submit">Add product</button></form></div>
  <h2 class="title">Discount codes</h2><div class="panel">${Object.entries(c).map(([k,v])=>`<div class="line"><div class="t"><b>${esc(k)}</b>${v}% off</div><button class="add" data-dc="${esc(k)}">Delete</button></div>`).join("")}
  <form id="cForm" class="two" style="margin-top:16px"><label>Code<input name="code" required></label><label>Percent off<input name="pct" type="number" min="1" max="90" required></label><button class="btn" type="submit">Add code</button></form></div>`;
  $$("[data-o]").forEach(s=>s.onchange=()=>{const a=get("lw-orders",[]);a.find(x=>x.id===s.dataset.o).status=s.value;set("lw-orders",a);toast(s.dataset.o+" marked "+s.value)});
  $$("[data-del]").forEach(b=>b.onclick=()=>{const id=+b.dataset.del;P.splice(P.findIndex(p=>p.id===id),1);delete cart[id];save();set("lw-products",P);renderCart();adminPage()});
  $("#pForm").onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),pick=a=>a[Math.floor(Math.random()*a.length)];
    P.push({id:Math.max(0,...P.map(p=>p.id))+1,name:f.get("name").trim(),cat:f.get("cat").trim(),price:+f.get("price"),shape:f.get("shape"),
      bg:pick(["#cfe3d6","#f3dfc9","#d5dcef","#f6d5d0","#e2ecc9","#cfe6ee"]),leaf:pick(["#2f7d5b","#4c9a52","#1f6b4f","#3f8f4a"]),pot:pick(["#e8523f","#12332b","#f2c14e","#5a6f68"])});
    set("lw-products",P);adminPage();toast("Product added")};
  $$("[data-dc]").forEach(b=>b.onclick=()=>{const n=codes();delete n[b.dataset.dc];set("lw-codes",n);adminPage()});
  $("#cForm").onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),n=codes();n[f.get("code").trim().toUpperCase()]=+f.get("pct");set("lw-codes",n);adminPage();toast("Code added")};
}

if(page==="login")loginPage();
if(page==="account")accountPage();
if(page==="admin")adminPage();
if($("#shop"))renderGrid();
renderCart();
})();
