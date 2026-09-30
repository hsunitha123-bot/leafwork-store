/* Load AFTER script.js (and after features.js if you use it). */
(()=>{
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const who=()=>{try{return JSON.parse(localStorage.getItem("lw-session"))||""}catch(e){return ""}};
const key=()=>"lw-wish-"+(who()||"guest");
const read=()=>{try{return JSON.parse(localStorage.getItem(key()))||[]}catch(e){return []}};
const write=a=>{try{localStorage.setItem(key(),JSON.stringify(a))}catch(e){}};
const count=()=>{const c=$("#wlCount");if(c)c.textContent=read().length};

/* header link with live count */
$("nav").insertAdjacentHTML("beforeend",`<a href="wishlist.html" ${page==="wishlist"?'aria-current="page"':""}>Wishlist (<span id="wlCount">0</span>)</a>`);

/* heart button on every product card */
function hearts(){
  const w=read();
  $$(".heart").forEach(h=>h.remove());
  $$(".card").forEach(c=>{
    const id=+$(".add",c).dataset.id,p=P.find(x=>x.id===id),on=w.includes(id);
    $(".art",c).insertAdjacentHTML("afterbegin",`<button class="heart" type="button" data-id="${id}" aria-pressed="${on}" aria-label="${on?"Remove":"Save"} ${esc(p.name)} ${on?"from":"to"} wishlist">${on?"♥":"♡"}</button>`);
  });
  $$(".heart").forEach(b=>b.onclick=()=>toggle(+b.dataset.id));
}
function toggle(id){
  const w=read(),i=w.indexOf(id);
  if(i<0)w.push(id);else w.splice(i,1);
  write(w);count();
  if($("#shop"))renderGrid();
  toast(i<0?"Saved to wishlist":"Removed from wishlist");
}
const rg=renderGrid;renderGrid=()=>{rg();hearts()};

/* wishlist page */
function wishPage(){
  const items=read().map(id=>P.find(p=>p.id===id)).filter(Boolean),m=$("#wl");
  m.innerHTML=`<h1 class="atitle">Your wishlist</h1>`+(items.length
   ?`<div class="grid">${items.map(p=>`<article class="card"><div class="art" style="background:${p.bg}">${art(p)}</div><div class="info"><h3>${esc(p.name)}</h3><small>${esc(p.cat)}</small><div class="row"><span class="price">${inr(p.price)}</span><span><button class="add" data-a="${p.id}">Add to cart</button> <button class="add" data-r="${p.id}" aria-label="Remove ${esc(p.name)} from wishlist">✕</button></span></div></div></article>`).join("")}</div><p><button class="btn" id="wlAll" type="button">Add all to cart</button></p>`
   :`<p class="empty">Nothing saved yet. Tap the heart on a plant to save it. <a href="index.html">Browse plants</a></p>`);
  $$("[data-a]").forEach(b=>b.onclick=()=>add(+b.dataset.a));
  $$("[data-r]").forEach(b=>b.onclick=()=>{write(read().filter(i=>i!==+b.dataset.r));count();wishPage()});
  const all=$("#wlAll");if(all)all.onclick=()=>items.forEach(p=>add(p.id));
}

if($("#shop"))renderGrid();
if(page==="wishlist")wishPage();
count();
})();
