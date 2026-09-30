const P=[
{id:1,name:"Snake plant",cat:"Low light",price:699,bg:"#cfe3d6",leaf:"#2f7d5b",pot:"#e8523f",shape:"tall"},
{id:2,name:"Pothos",cat:"Low light",price:449,bg:"#f3dfc9",leaf:"#4c9a52",pot:"#12332b",shape:"trail"},
{id:3,name:"ZZ plant",cat:"Low light",price:899,bg:"#d5dcef",leaf:"#1f6b4f",pot:"#f2c14e",shape:"tall"},
{id:4,name:"Jade plant",cat:"Sunny spots",price:549,bg:"#f6d5d0",leaf:"#3f8f4a",pot:"#5a6f68",shape:"round"},
{id:5,name:"Aloe vera",cat:"Sunny spots",price:399,bg:"#e2ecc9",leaf:"#5fae6a",pot:"#e8523f",shape:"tall"},
{id:6,name:"Money plant",cat:"Pet-safe",price:349,bg:"#cfe6ee",leaf:"#3c9b62",pot:"#f2c14e",shape:"trail"},
{id:7,name:"Areca palm",cat:"Pet-safe",price:1299,bg:"#eadcf0",leaf:"#2c8a4d",pot:"#12332b",shape:"round"},
{id:8,name:"Spider plant",cat:"Pet-safe",price:499,bg:"#f0e6b8",leaf:"#57a55a",pot:"#5a6f68",shape:"trail"}];
const $=(s,r=document)=>r.querySelector(s), inr=n=>"₹"+n.toLocaleString("en-IN");
let cart={},filter="All";
try{cart=JSON.parse(localStorage.getItem("lw-cart"))||{}}catch(e){}
const save=()=>{try{localStorage.setItem("lw-cart",JSON.stringify(cart))}catch(e){}};
const page=document.body.dataset.page;

/* shared header, footer, cart drawer */
const link=(h,t,k)=>`<a href="${h}" ${page===k?'aria-current="page"':""}>${t}</a>`;
document.body.insertAdjacentHTML("afterbegin",`<header><div class="wrap"><a class="logo" href="index.html">Leafwork</a>
<nav>${link("index.html","Shop","home")}${link("contact.html","Contact","contact")}</nav>
<button class="cartbtn" id="open" aria-label="Open cart">Cart (<span id="count">0</span>)</button></div></header>`);
document.body.insertAdjacentHTML("beforeend",`<footer><div class="wrap"><span>© 2026 Leafwork</span><span>Free delivery on orders over ₹1,500</span></div></footer>
<aside id="cart" aria-label="Shopping cart"><h2>Your cart <button class="x" id="close" aria-label="Close cart">×</button></h2>
<div class="items" id="items"></div><div class="total"><span>Total</span><span id="total">₹0</span></div>
<button class="btn" id="go" style="width:100%">Go to checkout</button></aside><div id="toast" role="status"></div>`);

function toast(m){const t=$("#toast");t.textContent=m;t.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove("show"),1800)}
const cartTotal=()=>Object.entries(cart).reduce((s,[id,q])=>s+P.find(p=>p.id==id).price*q,0);

function renderCart(){
  const ids=Object.keys(cart);let n=0;
  $("#items").innerHTML=ids.length?ids.map(id=>{const p=P.find(x=>x.id==id),q=cart[id];n+=q;
   return `<div class="line"><div class="t"><b>${p.name}</b>${inr(p.price)}</div><div class="qty">
   <button aria-label="Remove one" data-id="${id}" data-d="-1">−</button><span>${q}</span><button aria-label="Add one" data-id="${id}" data-d="1">+</button></div></div>`}).join(""):`<p class="empty">Your cart is empty. Add a plant to get started.</p>`;
  $("#items").querySelectorAll("[data-d]").forEach(b=>b.onclick=()=>change(b.dataset.id,+b.dataset.d));
  $("#total").textContent=inr(cartTotal());$("#count").textContent=n;
  renderSummary();
}
function change(id,d){cart[id]+=d;if(cart[id]<=0)delete cart[id];save();renderCart()}
function add(id){cart[id]=(cart[id]||0)+1;save();renderCart();toast(P.find(p=>p.id===id).name+" added to cart")}
$("#open").onclick=()=>$("#cart").classList.add("open");
$("#close").onclick=()=>$("#cart").classList.remove("open");
$("#go").onclick=()=>Object.keys(cart).length?location.href="checkout.html":toast("Add a plant first");
document.addEventListener("keydown",e=>{if(e.key==="Escape")$("#cart").classList.remove("open")});

/* shop page */
function art(p){const l=p.leaf,v={
 tall:`<path d="M100 120 C80 70 90 30 100 10 C110 30 120 70 100 120Z" fill="${l}"/><path d="M85 120 C55 90 55 55 60 40 C80 60 90 90 85 120Z" fill="${l}" opacity=".8"/><path d="M115 120 C145 90 145 55 140 40 C120 60 110 90 115 120Z" fill="${l}" opacity=".8"/>`,
 round:`<circle cx="100" cy="80" r="42" fill="${l}"/><circle cx="72" cy="95" r="26" fill="${l}" opacity=".8"/><circle cx="130" cy="95" r="26" fill="${l}" opacity=".8"/>`,
 trail:`<ellipse cx="70" cy="90" rx="26" ry="14" fill="${l}" transform="rotate(-30 70 90)"/><ellipse cx="130" cy="90" rx="26" ry="14" fill="${l}" transform="rotate(30 130 90)"/><ellipse cx="100" cy="65" rx="16" ry="30" fill="${l}"/><ellipse cx="55" cy="140" rx="10" ry="22" fill="${l}" opacity=".8"/>`}[p.shape];
 return `<svg viewBox="0 0 200 200" role="img" aria-label="${p.name} in a pot">${v}<path d="M62 120h76l-10 70H72z" fill="${p.pot}"/><rect x="56" y="112" width="88" height="14" rx="4" fill="${p.pot}"/></svg>`}
function renderGrid(){
  const cats=["All",...new Set(P.map(p=>p.cat))];
  $("#filters").innerHTML=cats.map(c=>`<button class="chip" aria-pressed="${c===filter}" data-c="${c}">${c}</button>`).join("");
  $("#filters").querySelectorAll(".chip").forEach(b=>b.onclick=()=>{filter=b.dataset.c;renderGrid()});
  $("#shop").innerHTML=P.filter(p=>filter==="All"||p.cat===filter).map(p=>`<article class="card"><div class="art" style="background:${p.bg}">${art(p)}</div>
   <div class="info"><h3>${p.name}</h3><small>${p.cat}</small><div class="row"><span class="price">${inr(p.price)}</span>
   <button class="add" data-id="${p.id}">Add to cart</button></div></div></article>`).join("");
  $("#shop").querySelectorAll(".add").forEach(b=>b.onclick=()=>add(+b.dataset.id));
}
if($("#shop")){renderGrid();
  const words=["Low light","Pet-safe","Sunny spots","Hardy","Beginner friendly","Free pot"];
  const row=words.map(w=>`<span>${w}</span>`).join("");$(".strip").innerHTML=`<div>${row}${row}${row}${row}</div>`}

/* checkout page */
function renderSummary(){
  const s=$("#summary");if(!s)return;
  const ids=Object.keys(cart);
  s.innerHTML=ids.length?ids.map(id=>{const p=P.find(x=>x.id==id);return `<div class="line"><div class="t"><b>${p.name}</b>Qty ${cart[id]}</div><b>${inr(p.price*cart[id])}</b></div>`}).join("")
   +`<div class="total"><span>Total</span><span>${inr(cartTotal())}</span></div>`:`<p class="empty">Your cart is empty. <a href="index.html">Browse plants</a>.</p>`;
}
const order=$("#orderForm");
if(order)order.onsubmit=e=>{e.preventDefault();
  if(!Object.keys(cart).length)return toast("Your cart is empty");
  const name=new FormData(order).get("name");cart={};save();renderCart();
  order.classList.add("hidden");$("#orderDone").classList.remove("hidden");$("#orderName").textContent=name};

/* contact page */
const contact=$("#contactForm");
if(contact)contact.onsubmit=e=>{e.preventDefault();contact.classList.add("hidden");$("#contactDone").classList.remove("hidden")};

renderCart();
