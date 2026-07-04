import React, { useState, useMemo, useRef } from "react";
import { Search, Plus, Minus, X, Clock, Check, Flame, ShieldCheck, QrCode, Settings, LayoutGrid, ClipboardList, Trash2, Pencil, ImagePlus, ArrowLeft } from "lucide-react";

const T = {
  bg:"#17110D", surface:"#241B16", surface2:"#2C211A", line:"#3A2D24",
  cream:"#F3E9DC", muted:"#AE9C8E", copper:"#C97B3D", gold:"#E0B873",
  green:"#6FA383", red:"#C2543F", orange:"#D08A3E", gray:"#7C7066",
};

const CURRENCY = "₹";
const CATEGORIES = ["Coffee","Non Coffee","Tea","Frappe","Snacks","Desserts"];

/* Each item has emoji + gradient so images always render without network */
const INITIAL_ITEMS = [
  { id:"i1",  category:"Coffee",     name:"Espresso",          desc:"Double shot, dense crema",              price:120, emoji:"☕", grad:["#2C1810","#5C3020"], available:true  },
  { id:"i2",  category:"Coffee",     name:"Cappuccino",        desc:"Espresso, steamed milk, velvety foam",  price:160, emoji:"☕", grad:["#3D2010","#8B5A2B"], available:true  },
  { id:"i3",  category:"Coffee",     name:"Caffe Latte",       desc:"Smooth espresso with silky milk",       price:170, emoji:"🥛", grad:["#5C3A1E","#A0724A"], available:true  },
  { id:"i4",  category:"Non Coffee", name:"Hot Chocolate",     desc:"Belgian cocoa, steamed full cream",     price:180, emoji:"🍫", grad:["#1E0F06","#4A2010"], available:true  },
  { id:"i5",  category:"Non Coffee", name:"Masala Chaas",      desc:"Spiced buttermilk, roasted cumin",      price:90,  emoji:"🥤", grad:["#D4A853","#8B6914"], available:true  },
  { id:"i6",  category:"Tea",        name:"Masala Chai",       desc:"Hand-pounded spices, full cream",       price:70,  emoji:"🍵", grad:["#7B3F10","#C4822A"], available:true  },
  { id:"i7",  category:"Tea",        name:"Green Tea",         desc:"Light, floral, antioxidant rich",       price:90,  emoji:"🍵", grad:["#1A3A1A","#2E6B2E"], available:true  },
  { id:"i8",  category:"Frappe",     name:"Caramel Frappe",    desc:"Blended cold coffee, caramel drizzle",  price:210, emoji:"🧋", grad:["#5C3D1A","#C4922A"], available:true  },
  { id:"i9",  category:"Frappe",     name:"Mocha Frappe",      desc:"Cold coffee with dark chocolate",       price:220, emoji:"🧋", grad:["#1A0F08","#3D2010"], available:true  },
  { id:"i10", category:"Snacks",     name:"Chicken Sandwich",  desc:"Grilled chicken, herb mayo, toasted",   price:190, emoji:"🥪", grad:["#5C4010","#A07830"], available:true  },
  { id:"i11", category:"Snacks",     name:"Veg Croissant",     desc:"Butter croissant with garden veg",      price:160, emoji:"🥐", grad:["#7A5C20","#C4A040"], available:false },
  { id:"i12", category:"Desserts",   name:"Tiramisu",          desc:"Espresso-soaked, mascarpone cream",     price:230, emoji:"🍰", grad:["#3A2810","#8B6030"], available:true  },
  { id:"i13", category:"Desserts",   name:"Chocolate Brownie", desc:"Warm walnut fudge brownie",             price:150, emoji:"🍫", grad:["#0F0806","#2C1A10"], available:true  },
];

const STATUS_FLOW = ["Received","Preparing","Ready","Served"];
const STATUS_COLOR = { Received:T.red, Preparing:T.orange, Ready:T.green, Served:T.gray };
const PREP_MIN = 12;
let orderSeq = 1000;
const uid = (p) => `${p}_${Math.random().toString(36).slice(2,9)}`;

/* ── Dish visual: emoji on gradient, no external URL needed ── */
function DishImg({ item, height=110, fontSize=42, borderRadius="0" }) {
  return (
    <div style={{
      width:"100%", height, borderRadius,
      background:`linear-gradient(145deg, ${item.grad[0]}, ${item.grad[1]})`,
      display:"flex", alignItems:"center", justifyContent:"center",
      fontSize, flexShrink:0, position:"relative", overflow:"hidden",
    }}>
      {/* subtle texture ring */}
      <div style={{ position:"absolute", width:"120%", height:"120%", borderRadius:"50%", background:"rgba(255,255,255,.03)", top:"-10%", left:"-10%" }}/>
      <span style={{ position:"relative", filter:"drop-shadow(0 2px 8px rgba(0,0,0,.5))" }}>{item.emoji}</span>
    </div>
  );
}

function DishImgSquare({ item, size=64 }) {
  return (
    <div style={{
      width:size, height:size, borderRadius:10, flexShrink:0,
      background:`linear-gradient(145deg, ${item.grad[0]}, ${item.grad[1]})`,
      display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*0.45,
    }}>{item.emoji}</div>
  );
}

function StatusPill({ status }) {
  return (
    <span style={{ background:STATUS_COLOR[status]+"22", color:STATUS_COLOR[status], border:`1px solid ${STATUS_COLOR[status]}55`, borderRadius:999, padding:"3px 11px", fontSize:12, fontWeight:700, letterSpacing:0.3, whiteSpace:"nowrap" }}>{status}</span>
  );
}

/* ═══════════════════════════════ ROOT ═══════════════════════════════ */
export default function App() {
  const [items, setItems]           = useState(INITIAL_ITEMS);
  const [categories, setCategories] = useState(CATEGORIES);
  const [orders, setOrders]         = useState([]);
  const [settings, setSettings]     = useState({ name:"Casa Espresso", logo:"☕", address:"12 Brew Lane, Indiranagar, Bengaluru", phone:"+91 98765 43210", gst:"29ABCDE1234F1Z5", currency:CURRENCY });
  const [view, setView]             = useState("landing");

  if (view==="customer") return <CustomerApp items={items} categories={categories} orders={orders} setOrders={setOrders} settings={settings} onExit={()=>setView("landing")}/>;
  if (view==="kitchen")  return <KitchenApp  orders={orders} setOrders={setOrders} onExit={()=>setView("landing")}/>;
  if (view==="admin")    return <AdminApp    items={items} setItems={setItems} categories={categories} setCategories={setCategories} settings={settings} setSettings={setSettings} orders={orders} onExit={()=>setView("landing")}/>;
  return <Landing setView={setView} settings={settings}/>;
}

function Landing({ setView, settings }) {
  return (
    <div style={{ minHeight:"100vh", background:T.bg, color:T.cream, fontFamily:"ui-sans-serif,system-ui,sans-serif", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ width:"100%", maxWidth:420 }}>
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <div style={{ fontSize:48, marginBottom:8 }}>{settings.logo}</div>
          <div style={{ fontFamily:"Georgia,serif", fontSize:28 }}>{settings.name}</div>
          <div style={{ color:T.muted, fontSize:13, marginTop:4 }}>QR Menu & Ordering — demo</div>
        </div>
        {[
          { k:"customer", icon:<QrCode size={20}/>,       title:"Scan Table QR",  sub:"Customer menu — Table 4"            },
          { k:"kitchen",  icon:<Flame size={20}/>,        title:"Kitchen Staff",  sub:"Live order queue & status updates"  },
          { k:"admin",    icon:<ShieldCheck size={20}/>,  title:"Owner / Admin",  sub:"Menu, orders, QR & settings"        },
        ].map(r=>(
          <button key={r.k} onClick={()=>setView(r.k)} style={{ width:"100%", display:"flex", alignItems:"center", gap:14, textAlign:"left", background:T.surface, border:`1px solid ${T.line}`, borderRadius:14, padding:"16px 18px", marginBottom:12, color:T.cream, cursor:"pointer" }}>
            <div style={{ width:42, height:42, borderRadius:11, background:T.copper+"22", color:T.gold, display:"flex", alignItems:"center", justifyContent:"center" }}>{r.icon}</div>
            <div>
              <div style={{ fontWeight:600, fontSize:15 }}>{r.title}</div>
              <div style={{ fontSize:12.5, color:T.muted, marginTop:2 }}>{r.sub}</div>
            </div>
          </button>
        ))}
        <div style={{ fontSize:11, color:T.muted, textAlign:"center", marginTop:16, lineHeight:1.6 }}>In production each role has its own URL. This picker exists only for the demo preview.</div>
      </div>
    </div>
  );
}

function TopBar({ onExit, title, right }) {
  return (
    <div style={{ position:"sticky", top:0, zIndex:30, background:T.bg+"F2", backdropFilter:"blur(8px)", borderBottom:`1px solid ${T.line}`, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 14px" }}>
      <button onClick={onExit} style={{ background:"none", border:"none", color:T.muted, display:"flex", alignItems:"center", gap:4, cursor:"pointer", fontSize:13 }}><ArrowLeft size={16}/> Exit</button>
      <div style={{ fontWeight:700, fontSize:14 }}>{title}</div>
      <div style={{ minWidth:40, textAlign:"right" }}>{right}</div>
    </div>
  );
}

/* ═══════════════════════════════ CUSTOMER ═══════════════════════════════ */
function CustomerApp({ items, categories, orders, setOrders, settings, onExit }) {
  const TABLE = "4";
  const [screen, setScreen]       = useState("menu");
  const [query, setQuery]         = useState("");
  const [activeCat, setActiveCat] = useState("All");
  const [cart, setCart]           = useState([]);
  const [picked, setPicked]       = useState(null);
  const [lastOrderId, setLastOrderId] = useState(null);

  const myOrders    = orders.filter(o=>o.table===TABLE);
  const activeOrder = myOrders.find(o=>o.id===lastOrderId) || myOrders[myOrders.length-1];
  const allCats     = ["All", ...categories];

  const grouped = useMemo(()=>{
    const avail = items.filter(i=>i.available);
    if (query.trim()) {
      const res = avail.filter(i=>i.name.toLowerCase().includes(query.toLowerCase()));
      return [{ label:"Search Results", items:res }];
    }
    if (activeCat==="All") return categories.map(c=>({ label:c, items:avail.filter(i=>i.category===c) })).filter(g=>g.items.length>0);
    return [{ label:activeCat, items:avail.filter(i=>i.category===activeCat) }];
  },[items,query,activeCat,categories]);

  const cartCount = cart.reduce((s,c)=>s+c.qty,0);
  const cartTotal = cart.reduce((s,c)=>{ const it=items.find(i=>i.id===c.itemId); return s+(it?it.price*c.qty:0); },0);

  function addToCart(item,qty,note){
    setCart(c=>{ const ex=c.find(x=>x.itemId===item.id&&x.note===note); if(ex) return c.map(x=>x===ex?{...x,qty:x.qty+qty}:x); return [...c,{itemId:item.id,qty,note}]; });
    setPicked(null);
  }
  function updateQty(idx,delta){ setCart(c=>c.map((x,i)=>i===idx?{...x,qty:x.qty+delta}:x).filter(x=>x.qty>0)); }

  function placeOrder(){
    const id=++orderSeq;
    setOrders(o=>[{id,table:TABLE,status:"Received",time:new Date(),items:cart.map(c=>{const it=items.find(i=>i.id===c.itemId);return{name:it.name,price:it.price,qty:c.qty,note:c.note,emoji:it.emoji,grad:it.grad};}),total:cartTotal},...o]);
    setLastOrderId(id); setCart([]); setScreen("tracking");
  }

  if (screen==="tracking"&&activeOrder) return <OrderTracking order={activeOrder} onBackToMenu={()=>setScreen("menu")} onExit={onExit} settings={settings}/>;

  /* ── CART SCREEN ── */
  if (screen==="cart") return (
    <div style={{ minHeight:"100vh", background:T.bg, color:T.cream, fontFamily:"ui-sans-serif,system-ui,sans-serif" }}>
      <TopBar onExit={()=>setScreen("menu")} title="Your Cart" right={null}/>
      <div style={{ padding:16, paddingBottom:140 }}>
        {cart.length===0&&<div style={{ color:T.muted, textAlign:"center", marginTop:70 }}>Your cart is empty.</div>}
        {cart.map((c,idx)=>{
          const it=items.find(i=>i.id===c.itemId);
          return (
            <div key={idx} style={{ display:"flex", gap:12, padding:"14px 0", borderBottom:`1px solid ${T.line}` }}>
              <DishImgSquare item={it} size={64}/>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:15 }}>{it.name}</div>
                {c.note&&<div style={{ fontSize:12, color:T.muted, marginTop:2 }}>Note: {c.note}</div>}
                <div style={{ color:T.gold, fontSize:14, marginTop:5, fontWeight:700 }}>{settings.currency}{it.price*c.qty}</div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8, background:T.surface2, borderRadius:999, padding:"6px 10px", alignSelf:"center" }}>
                <button onClick={()=>updateQty(idx,-1)} style={icoBtn}><Minus size={13}/></button>
                <span style={{ fontSize:14, minWidth:18, textAlign:"center", fontWeight:700 }}>{c.qty}</span>
                <button onClick={()=>updateQty(idx,1)}  style={icoBtn}><Plus  size={13}/></button>
              </div>
            </div>
          );
        })}
      </div>
      {cart.length>0&&(
        <div style={{ position:"fixed", bottom:0, left:0, right:0, background:T.surface, borderTop:`1px solid ${T.line}`, padding:"14px 16px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10, fontSize:14 }}>
            <span style={{ color:T.muted }}>Total ({cartCount} item{cartCount>1?"s":""})</span>
            <span style={{ fontWeight:700, color:T.gold }}>{settings.currency}{cartTotal}</span>
          </div>
          <button onClick={placeOrder} style={primaryBtn}>Place Order · Table {TABLE}</button>
        </div>
      )}
    </div>
  );

  /* ── MENU SCREEN ── */
  return (
    <div style={{ minHeight:"100vh", background:T.bg, color:T.cream, fontFamily:"ui-sans-serif,system-ui,sans-serif", paddingBottom:cartCount?96:24 }}>
      <TopBar onExit={onExit} title={`Table ${TABLE} · Menu`} right={myOrders.length>0?(
        <button onClick={()=>setScreen("tracking")} style={{ background:"none", border:"none", color:T.gold, fontSize:12.5, display:"flex", alignItems:"center", gap:4, cursor:"pointer" }}><Clock size={14}/> Track</button>
      ):null}/>

      <div style={{ padding:"16px 16px 0" }}>
        <div style={{ fontFamily:"Georgia,serif", fontSize:24 }}>{settings.logo} {settings.name}</div>
        <div style={{ color:T.muted, fontSize:12.5, marginTop:3 }}>{settings.address}</div>

        {/* Search */}
        <div style={{ position:"relative", marginTop:14 }}>
          <Search size={15} style={{ position:"absolute", left:12, top:12, color:T.muted }}/>
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search dishes…"
            style={{ width:"100%", background:T.surface, border:`1px solid ${T.line}`, borderRadius:12, padding:"11px 12px 11px 36px", color:T.cream, fontSize:14, outline:"none", boxSizing:"border-box" }}/>
          {query&&<button onClick={()=>setQuery("")} style={{ position:"absolute", right:10, top:10, background:"none", border:"none", color:T.muted, cursor:"pointer" }}><X size={16}/></button>}
        </div>
      </div>

      {/* Category tabs */}
      {!query&&(
        <div style={{ display:"flex", gap:8, overflowX:"auto", padding:"14px 16px 0", scrollbarWidth:"none" }}>
          {allCats.map(c=>(
            <button key={c} onClick={()=>setActiveCat(c)} style={{ flexShrink:0, padding:"7px 17px", borderRadius:999, fontSize:13, fontWeight:600, border:`1px solid ${c===activeCat?T.copper:T.line}`, background:c===activeCat?T.copper:"transparent", color:c===activeCat?T.bg:T.muted, cursor:"pointer" }}>{c}</button>
          ))}
        </div>
      )}

      {/* Groups */}
      <div style={{ padding:"16px 16px 0" }}>
        {grouped.map(group=>(
          <div key={group.label} style={{ marginBottom:28 }}>
            {/* Section header — always shown when All or searching */}
            {(activeCat==="All"||query)&&(
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                <div style={{ fontFamily:"Georgia,serif", fontSize:20, color:T.cream, whiteSpace:"nowrap" }}>{group.label}</div>
                <div style={{ flex:1, height:1, background:`linear-gradient(90deg,${T.copper}88,transparent)` }}/>
                <div style={{ fontSize:11.5, color:T.muted, whiteSpace:"nowrap" }}>{group.items.length} items</div>
              </div>
            )}
            {/* Grid */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              {group.items.map(it=>{
                const inCart=cart.filter(c=>c.itemId===it.id).reduce((s,c)=>s+c.qty,0);
                return (
                  <div key={it.id} onClick={()=>setPicked(it)}
                    style={{ background:T.surface, border:`1px solid ${inCart?T.copper+"99":T.line}`, borderRadius:16, overflow:"hidden", cursor:"pointer" }}>
                    {/* Dish visual */}
                    <div style={{ position:"relative" }}>
                      <DishImg item={it} height={110}/>
                      {inCart>0&&(
                        <div style={{ position:"absolute", top:8, right:8, width:24, height:24, borderRadius:"50%", background:T.copper, color:T.bg, fontSize:12, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center" }}>{inCart}</div>
                      )}
                    </div>
                    <div style={{ padding:"10px 11px 13px" }}>
                      <div style={{ fontWeight:700, fontSize:13.5 }}>{it.name}</div>
                      <div style={{ fontSize:11.5, color:T.muted, lineHeight:1.35, marginTop:3, height:30, overflow:"hidden" }}>{it.desc}</div>
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:9 }}>
                        <span style={{ color:T.gold, fontWeight:700, fontSize:14 }}>{settings.currency}{it.price}</span>
                        <div style={{ width:28, height:28, borderRadius:8, background:inCart?T.copper:T.surface2, color:inCart?T.bg:T.cream, display:"flex", alignItems:"center", justifyContent:"center" }}>
                          <Plus size={15}/>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {group.items.length===0&&<div style={{ color:T.muted, padding:"30px 0", textAlign:"center" }}>No items here.</div>}
          </div>
        ))}
      </div>

      {picked&&<ItemModal item={picked} settings={settings} onClose={()=>setPicked(null)} onAdd={addToCart}/>}

      {cartCount>0&&(
        <button onClick={()=>setScreen("cart")} style={{ position:"fixed", bottom:16, left:16, right:16, background:T.copper, color:T.bg, border:"none", borderRadius:16, padding:"14px 18px", display:"flex", justifyContent:"space-between", alignItems:"center", fontWeight:700, fontSize:14.5, cursor:"pointer", boxShadow:"0 8px 28px rgba(0,0,0,.5)" }}>
          <span style={{ background:T.bg+"33", borderRadius:8, padding:"2px 10px", fontSize:13 }}>{cartCount}</span>
          <span>View Cart</span>
          <span style={{ color:T.bg+"CC" }}>{settings.currency}{cartTotal}</span>
        </button>
      )}
    </div>
  );
}

const icoBtn   = { width:24, height:24, borderRadius:999, border:"none", background:T.line, color:T.cream, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", padding:0 };
const primaryBtn = { width:"100%", background:T.copper, color:T.bg, border:"none", borderRadius:12, padding:"14px", fontWeight:700, fontSize:15, cursor:"pointer" };
const inputSt  = { width:"100%", background:T.surface, border:`1px solid ${T.line}`, borderRadius:10, padding:"11px 12px", color:T.cream, fontSize:14, outline:"none", boxSizing:"border-box" };
const labelSt  = { fontSize:11.5, color:T.muted, display:"block", margin:"10px 0 5px" };
const miniIco  = { background:T.surface2, border:`1px solid ${T.line}`, borderRadius:7, width:26, height:26, color:T.muted, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", padding:0 };

function ItemModal({ item, settings, onClose, onAdd }) {
  const [qty,setQty]   = useState(1);
  const [note,setNote] = useState("");
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.65)", zIndex:50, display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:T.surface, width:"100%", maxWidth:460, borderRadius:"20px 20px 0 0", overflow:"hidden" }}>
        <DishImg item={item} height={180} fontSize={70}/>
        <div style={{ padding:"16px 18px 22px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <div style={{ fontWeight:700, fontSize:20 }}>{item.name}</div>
              <div style={{ color:T.muted, fontSize:13.5, marginTop:4, lineHeight:1.4 }}>{item.desc}</div>
            </div>
            <button onClick={onClose} style={{ background:T.surface2, border:"none", color:T.muted, cursor:"pointer", borderRadius:8, padding:5, marginLeft:10 }}><X size={18}/></button>
          </div>
          <div style={{ color:T.gold, fontWeight:700, fontSize:20, marginTop:10 }}>{settings.currency}{item.price}</div>
          <div style={{ marginTop:14 }}>
            <div style={{ fontSize:12.5, color:T.muted, marginBottom:6 }}>Special instructions (optional)</div>
            <input value={note} onChange={e=>setNote(e.target.value)} placeholder="e.g. less sugar, extra shot" style={inputSt}/>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:14, marginTop:16 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, background:T.surface2, borderRadius:999, padding:"8px 14px" }}>
              <button onClick={()=>setQty(q=>Math.max(1,q-1))} style={icoBtn}><Minus size={14}/></button>
              <span style={{ minWidth:18, textAlign:"center", fontWeight:700, fontSize:16 }}>{qty}</span>
              <button onClick={()=>setQty(q=>q+1)} style={icoBtn}><Plus size={14}/></button>
            </div>
            <button onClick={()=>onAdd(item,qty,note)} style={{ ...primaryBtn, flex:1 }}>Add · {settings.currency}{item.price*qty}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderTracking({ order, onBackToMenu, onExit, settings }) {
  const stepIdx = STATUS_FLOW.indexOf(order.status);
  return (
    <div style={{ minHeight:"100vh", background:T.bg, color:T.cream, fontFamily:"ui-sans-serif,system-ui,sans-serif" }}>
      <TopBar onExit={onExit} title="Order Status" right={<span onClick={onBackToMenu} style={{ color:T.gold, fontSize:12.5, cursor:"pointer" }}>Back to Menu</span>}/>
      <div style={{ padding:24, textAlign:"center" }}>
        <div style={{ width:64, height:64, borderRadius:"50%", background:T.green+"22", color:T.green, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px" }}><Check size={30}/></div>
        <div style={{ fontFamily:"Georgia,serif", fontSize:22 }}>Order Placed!</div>
        <div style={{ color:T.muted, fontSize:13, marginTop:5 }}>Order #{order.id} · Table {order.table}</div>
        <div style={{ color:T.gold, fontSize:14, marginTop:8, fontWeight:600 }}>Estimated prep: ~{PREP_MIN} min</div>
      </div>
      <div style={{ padding:"0 24px 24px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", position:"relative" }}>
          <div style={{ position:"absolute", top:14, left:"8%", right:"8%", height:2, background:T.line, zIndex:0 }}>
            <div style={{ height:"100%", background:STATUS_COLOR[order.status], width:`${(stepIdx/(STATUS_FLOW.length-1))*100}%`, transition:"width .5s" }}/>
          </div>
          {STATUS_FLOW.map((s,i)=>(
            <div key={s} style={{ zIndex:1, textAlign:"center", flex:1 }}>
              <div style={{ width:28, height:28, borderRadius:"50%", margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"center", background:i<=stepIdx?STATUS_COLOR[order.status]:T.surface2, color:i<=stepIdx?T.bg:T.muted, fontWeight:700, fontSize:12, border:`2px solid ${i<=stepIdx?STATUS_COLOR[order.status]:T.line}` }}>
                {i<stepIdx?<Check size={13}/>:i+1}
              </div>
              <div style={{ fontSize:10, marginTop:6, color:i<=stepIdx?T.cream:T.muted }}>{s}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ margin:"0 16px", background:T.surface, border:`1px solid ${T.line}`, borderRadius:14, padding:14 }}>
        {order.items.map((it,i)=>(
          <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:i<order.items.length-1?`1px solid ${T.line}`:"none" }}>
            <div>
              <div style={{ fontSize:14 }}>{it.qty}× {it.name}</div>
              {it.note&&<div style={{ fontSize:11.5, color:T.muted }}>Note: {it.note}</div>}
            </div>
            <div style={{ color:T.gold, fontWeight:600 }}>{settings.currency}{it.price*it.qty}</div>
          </div>
        ))}
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:10, paddingTop:8, borderTop:`1px solid ${T.line}`, fontWeight:700 }}>
          <span>Total</span><span style={{ color:T.gold }}>{settings.currency}{order.total}</span>
        </div>
      </div>
      <div style={{ textAlign:"center", color:T.muted, fontSize:12, padding:18, lineHeight:1.6 }}>Pull to refresh anytime to check live status.</div>
    </div>
  );
}

/* ═══════════════════════════════ KITCHEN ═══════════════════════════════ */
function KitchenApp({ orders, setOrders, onExit }) {
  const [loggedIn, setLoggedIn] = useState(false);
  if (!loggedIn) return <StaffLogin role="Kitchen Staff" onLogin={()=>setLoggedIn(true)} onExit={onExit}/>;

  function advance(id){
    setOrders(os=>os.map(o=>{ if(o.id!==id) return o; const idx=STATUS_FLOW.indexOf(o.status); return {...o,status:STATUS_FLOW[Math.min(idx+1,STATUS_FLOW.length-1)]}; }));
  }

  const sorted = [...orders].sort((a,b)=>b.id-a.id);
  const active = sorted.filter(o=>o.status!=="Served");
  const done   = sorted.filter(o=>o.status==="Served");

  return (
    <div style={{ minHeight:"100vh", background:T.bg, color:T.cream, fontFamily:"ui-sans-serif,system-ui,sans-serif" }}>
      <TopBar onExit={onExit} title="Kitchen — Live Orders" right={<span style={{ color:T.muted, fontSize:12 }}>{active.length} active</span>}/>
      <div style={{ padding:14 }}>
        {active.length===0&&<div style={{ color:T.muted, textAlign:"center", marginTop:70, fontSize:14 }}>No active orders. New orders appear here instantly.</div>}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:12 }}>
          {active.map(o=>(
            <div key={o.id} style={{ background:T.surface, border:`1px solid ${STATUS_COLOR[o.status]}66`, borderRadius:14, padding:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:15 }}>#{o.id} · Table {o.table}</div>
                  <div style={{ fontSize:11.5, color:T.muted, marginTop:2 }}>{o.time.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</div>
                </div>
                <StatusPill status={o.status}/>
              </div>
              <div style={{ marginTop:10, borderTop:`1px solid ${T.line}`, paddingTop:8 }}>
                {o.items.map((it,i)=>(
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:"5px 0" }}>
                    <div style={{ width:28, height:28, borderRadius:7, background:`linear-gradient(135deg,${it.grad?.[0]||"#333"},${it.grad?.[1]||"#666"})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0 }}>{it.emoji||"🍽️"}</div>
                    <div>
                      <div style={{ fontSize:13.5 }}><span style={{ fontWeight:700, color:T.gold }}>{it.qty}×</span> {it.name}</div>
                      {it.note&&<div style={{ fontSize:11, color:T.copper }}>"{it.note}"</div>}
                    </div>
                  </div>
                ))}
              </div>
              {o.status!=="Served"&&(
                <button onClick={()=>advance(o.id)} style={{ marginTop:12, width:"100%", background:STATUS_COLOR[o.status], color:T.bg, border:"none", borderRadius:10, padding:"11px", fontWeight:700, fontSize:13.5, cursor:"pointer" }}>
                  {o.status==="Received"&&"✓ Accept Order"}
                  {o.status==="Preparing"&&"✓ Mark Ready"}
                  {o.status==="Ready"&&"✓ Mark Served"}
                </button>
              )}
            </div>
          ))}
        </div>
        {done.length>0&&(
          <>
            <div style={{ color:T.muted, fontSize:12, margin:"22px 0 10px", textTransform:"uppercase", letterSpacing:0.5 }}>Served today ({done.length})</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:10 }}>
              {done.map(o=>(
                <div key={o.id} style={{ background:T.surface2, border:`1px solid ${T.line}`, borderRadius:12, padding:12, opacity:0.7 }}>
                  <div style={{ display:"flex", justifyContent:"space-between" }}>
                    <span style={{ fontSize:13, fontWeight:600 }}>#{o.id} · Table {o.table}</span>
                    <StatusPill status={o.status}/>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StaffLogin({ role, onLogin, onExit }) {
  return (
    <div style={{ minHeight:"100vh", background:T.bg, color:T.cream, fontFamily:"ui-sans-serif,system-ui,sans-serif", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ width:"100%", maxWidth:340 }}>
        <button onClick={onExit} style={{ background:"none", border:"none", color:T.muted, marginBottom:18, display:"flex", alignItems:"center", gap:4, cursor:"pointer" }}><ArrowLeft size={15}/> Back</button>
        <div style={{ width:48, height:48, borderRadius:12, background:T.copper+"22", color:T.gold, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:14 }}>
          {role.includes("Kitchen")?<Flame size={22}/>:<ShieldCheck size={22}/>}
        </div>
        <div style={{ fontFamily:"Georgia,serif", fontSize:24, marginBottom:4 }}>{role}</div>
        <div style={{ color:T.muted, fontSize:12.5, marginBottom:22 }}>Demo — any password works.</div>
        <input placeholder="Username" defaultValue={role.includes("Kitchen")?"kitchen1":"owner"} style={inputSt}/>
        <input placeholder="Password" type="password" defaultValue="••••••" style={{ ...inputSt, marginTop:10 }}/>
        <button onClick={onLogin} style={{ ...primaryBtn, marginTop:16 }}>Log In</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════ ADMIN ═══════════════════════════════ */
function AdminApp({ items, setItems, categories, setCategories, settings, setSettings, orders, onExit }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [tab, setTab] = useState("menu");
  if (!loggedIn) return <StaffLogin role="Admin" onLogin={()=>setLoggedIn(true)} onExit={onExit}/>;

  const tabs = [
    { k:"menu",     label:"Menu",     icon:<LayoutGrid size={15}/> },
    { k:"orders",   label:"Orders",   icon:<ClipboardList size={15}/> },
    { k:"qr",       label:"QR Codes", icon:<QrCode size={15}/> },
    { k:"settings", label:"Settings", icon:<Settings size={15}/> },
  ];

  return (
    <div style={{ minHeight:"100vh", background:T.bg, color:T.cream, fontFamily:"ui-sans-serif,system-ui,sans-serif", paddingBottom:70 }}>
      <TopBar onExit={onExit} title="Admin Panel" right={null}/>
      <div style={{ padding:14 }}>
        {tab==="menu"     &&<MenuManager items={items} setItems={setItems} categories={categories} setCategories={setCategories} settings={settings}/>}
        {tab==="orders"   &&<OrdersManager orders={orders} settings={settings}/>}
        {tab==="qr"       &&<QRManager/>}
        {tab==="settings" &&<SettingsManager settings={settings} setSettings={setSettings}/>}
      </div>
      <div style={{ position:"fixed", bottom:0, left:0, right:0, background:T.surface, borderTop:`1px solid ${T.line}`, display:"flex" }}>
        {tabs.map(t=>(
          <button key={t.k} onClick={()=>setTab(t.k)} style={{ flex:1, background:"none", border:"none", padding:"10px 0 8px", display:"flex", flexDirection:"column", alignItems:"center", gap:3, color:tab===t.k?T.gold:T.muted, cursor:"pointer", fontSize:11 }}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function MenuManager({ items, setItems, categories, setCategories, settings }) {
  const [editing, setEditing]     = useState(null);
  const [catInput, setCatInput]   = useState("");
  const [editingCat, setEditingCat] = useState(null);

  function saveItem(data){ if(data.id) setItems(a=>a.map(i=>i.id===data.id?data:i)); else setItems(a=>[...a,{...data,id:uid("item")}]); setEditing(null); }
  function deleteItem(id){ setItems(a=>a.filter(i=>i.id!==id)); }
  function toggleAvail(id){ setItems(a=>a.map(i=>i.id===id?{...i,available:!i.available}:i)); }
  function addCat(){ if(catInput.trim()&&!categories.includes(catInput.trim())){ setCategories(c=>[...c,catInput.trim()]); setCatInput(""); } }
  function deleteCat(c){ setCategories(cs=>cs.filter(x=>x!==c)); setItems(a=>a.filter(i=>i.category!==c)); }
  function renameCat(old,nw){ setCategories(cs=>cs.map(c=>c===old?nw:c)); setItems(a=>a.map(i=>i.category===old?{...i,category:nw}:i)); setEditingCat(null); }

  return (
    <div>
      <div style={{ fontSize:11, color:T.muted, marginBottom:8, textTransform:"uppercase", letterSpacing:0.5 }}>Categories</div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:10 }}>
        {categories.map(c=>(
          <div key={c} style={{ display:"flex", alignItems:"center", gap:6, background:T.surface, border:`1px solid ${T.line}`, borderRadius:999, padding:"5px 6px 5px 12px" }}>
            {editingCat===c
              ? <input autoFocus defaultValue={c} onBlur={e=>renameCat(c,e.target.value||c)} onKeyDown={e=>e.key==="Enter"&&renameCat(c,e.target.value||c)} style={{ background:"none", border:"none", color:T.cream, fontSize:12.5, outline:"none", width:80 }}/>
              : <span style={{ fontSize:12.5 }}>{c}</span>}
            <button onClick={()=>setEditingCat(c)} style={miniIco}><Pencil size={11}/></button>
            <button onClick={()=>deleteCat(c)}     style={miniIco}><Trash2 size={11}/></button>
          </div>
        ))}
      </div>
      <div style={{ display:"flex", gap:8, marginBottom:20 }}>
        <input value={catInput} onChange={e=>setCatInput(e.target.value)} placeholder="New category name" style={{ ...inputSt, flex:1 }}/>
        <button onClick={addCat} style={{ background:T.copper, color:T.bg, border:"none", borderRadius:10, padding:"0 16px", fontWeight:700, cursor:"pointer" }}>Add</button>
      </div>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
        <div style={{ fontSize:11, color:T.muted, textTransform:"uppercase", letterSpacing:0.5 }}>Items ({items.length})</div>
        <button onClick={()=>setEditing("new")} style={{ background:T.copper, color:T.bg, border:"none", borderRadius:10, padding:"7px 13px", fontWeight:700, fontSize:13, display:"flex", alignItems:"center", gap:5, cursor:"pointer" }}><Plus size={14}/> Add Item</button>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {items.map(it=>(
          <div key={it.id} style={{ display:"flex", gap:10, alignItems:"center", background:T.surface, border:`1px solid ${T.line}`, borderRadius:12, padding:10, opacity:it.available?1:0.55 }}>
            <DishImgSquare item={it} size={50}/>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:600, fontSize:13.5 }}>{it.name} <span style={{ color:T.muted, fontWeight:400, fontSize:11.5 }}>· {it.category}</span></div>
              <div style={{ fontSize:11.5, color:T.muted, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{it.desc}</div>
              <div style={{ color:T.gold, fontSize:13, fontWeight:700, marginTop:2 }}>{settings.currency}{it.price}</div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:6, alignItems:"flex-end" }}>
              <button onClick={()=>toggleAvail(it.id)} style={{ fontSize:10.5, fontWeight:700, border:"none", borderRadius:999, padding:"4px 9px", cursor:"pointer", background:it.available?T.green+"22":T.red+"22", color:it.available?T.green:T.red }}>
                {it.available?"Available":"Hidden"}
              </button>
              <div style={{ display:"flex", gap:6 }}>
                <button onClick={()=>setEditing(it)}    style={miniIco}><Pencil size={12}/></button>
                <button onClick={()=>deleteItem(it.id)} style={miniIco}><Trash2 size={12}/></button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {editing&&<ItemEditor item={editing==="new"?null:editing} categories={categories} onClose={()=>setEditing(null)} onSave={saveItem}/>}
    </div>
  );
}

function ItemEditor({ item, categories, onClose, onSave }) {
  const EMOJIS = ["☕","🍵","🧋","🍫","🥤","🥪","🥐","🍰","🍩","🍪","🥗","🍜","🥘","🍱"];
  const [form, setForm] = useState(item || { name:"", desc:"", price:"", category:categories[0], emoji:"🍽️", grad:["#2C2C2C","#555555"], available:true });
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.65)", zIndex:50, display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:T.surface, width:"100%", maxWidth:460, borderRadius:"18px 18px 0 0", padding:18, boxSizing:"border-box", maxHeight:"88vh", overflowY:"auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <div style={{ fontWeight:700, fontSize:16 }}>{item?"Edit Item":"New Item"}</div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:T.muted, cursor:"pointer" }}><X size={20}/></button>
        </div>
        {/* Emoji picker */}
        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:11.5, color:T.muted, marginBottom:8 }}>Pick dish icon</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {EMOJIS.map(e=>(
              <button key={e} onClick={()=>setForm({...form,emoji:e})} style={{ width:38, height:38, borderRadius:10, border:`2px solid ${form.emoji===e?T.copper:T.line}`, background:T.surface2, fontSize:20, cursor:"pointer" }}>{e}</button>
            ))}
          </div>
        </div>
        <label style={labelSt}>Name</label>
        <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} style={inputSt}/>
        <label style={labelSt}>Description</label>
        <input value={form.desc} onChange={e=>setForm({...form,desc:e.target.value})} style={inputSt}/>
        <div style={{ display:"flex", gap:10 }}>
          <div style={{ flex:1 }}><label style={labelSt}>Price (₹)</label><input type="number" value={form.price} onChange={e=>setForm({...form,price:Number(e.target.value)})} style={inputSt}/></div>
          <div style={{ flex:1 }}><label style={labelSt}>Category</label>
            <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} style={{ ...inputSt, appearance:"auto" }}>
              {categories.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <label style={{ ...labelSt, display:"flex", alignItems:"center", gap:8, marginTop:10 }}>
          <input type="checkbox" checked={form.available} onChange={e=>setForm({...form,available:e.target.checked})}/> Available to customers
        </label>
        <button onClick={()=>onSave(form)} disabled={!form.name||!form.price} style={{ ...primaryBtn, marginTop:14, opacity:(!form.name||!form.price)?0.5:1 }}>Save Item</button>
      </div>
    </div>
  );
}

function OrdersManager({ orders, settings }) {
  const [filter, setFilter]     = useState("");
  const [showDone, setShowDone] = useState(true);
  const sorted = [...orders].sort((a,b)=>b.id-a.id).filter(o=>filter?o.table.includes(filter):true).filter(o=>showDone||o.status!=="Served");
  return (
    <div>
      <div style={{ display:"flex", gap:8, marginBottom:14 }}>
        <input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Filter by table #" style={{ ...inputSt, flex:1 }}/>
        <button onClick={()=>setShowDone(s=>!s)} style={{ fontSize:12, fontWeight:600, border:`1px solid ${T.line}`, borderRadius:10, padding:"0 12px", cursor:"pointer", background:showDone?T.surface2:T.copper, color:showDone?T.muted:T.bg }}>
          {showDone?"Hide Served":"Show All"}
        </button>
      </div>
      {sorted.length===0&&<div style={{ color:T.muted, textAlign:"center", marginTop:40 }}>No orders yet.</div>}
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {sorted.map(o=>(
          <div key={o.id} style={{ background:T.surface, border:`1px solid ${T.line}`, borderRadius:12, padding:12 }}>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <div style={{ fontWeight:700, fontSize:14 }}>#{o.id} · Table {o.table}</div>
              <StatusPill status={o.status}/>
            </div>
            <div style={{ fontSize:11.5, color:T.muted, margin:"4px 0 6px" }}>{o.time.toLocaleString([],{dateStyle:"medium",timeStyle:"short"})}</div>
            <div style={{ fontSize:12.5 }}>{o.items.map(it=>`${it.qty}× ${it.name}`).join(", ")}</div>
            <div style={{ fontWeight:700, color:T.gold, marginTop:6 }}>{settings.currency}{o.total}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function QRManager() {
  return (
    <div>
      <div style={{ color:T.muted, fontSize:12.5, marginBottom:16, lineHeight:1.6 }}>
        Each QR encodes a unique table URL. Print and place on the table — customers scan and land directly on the menu pre-loaded for their table.
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(145px,1fr))", gap:14 }}>
        {Array.from({length:8},(_,i)=>i+1).map(t=>(
          <div key={t} style={{ background:T.surface, border:`1px solid ${T.line}`, borderRadius:14, padding:14, textAlign:"center" }}>
            <img alt={`QR Table ${t}`} style={{ width:"100%", borderRadius:10, background:"#fff", padding:6, boxSizing:"border-box", display:"block" }}
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`https://order.example.app/t/${t}`)}`}/>
            <div style={{ fontWeight:700, fontSize:13, marginTop:10 }}>Table {t}</div>
            <button style={{ marginTop:7, fontSize:11.5, background:T.surface2, border:`1px solid ${T.line}`, color:T.cream, borderRadius:8, padding:"5px 10px", cursor:"pointer" }}>Download</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsManager({ settings, setSettings }) {
  const [form, setForm] = useState(settings);
  return (
    <div style={{ maxWidth:420 }}>
      <label style={labelSt}>Restaurant Name</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} style={inputSt}/>
      <label style={labelSt}>Logo (emoji)</label><input value={form.logo} onChange={e=>setForm({...form,logo:e.target.value})} style={inputSt}/>
      <label style={labelSt}>Address</label><input value={form.address} onChange={e=>setForm({...form,address:e.target.value})} style={inputSt}/>
      <label style={labelSt}>Contact</label><input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} style={inputSt}/>
      <label style={labelSt}>GST (optional)</label><input value={form.gst} onChange={e=>setForm({...form,gst:e.target.value})} style={inputSt}/>
      <label style={labelSt}>Currency Symbol</label><input value={form.currency} onChange={e=>setForm({...form,currency:e.target.value})} style={inputSt}/>
      <button onClick={()=>setSettings(form)} style={{ ...primaryBtn, marginTop:18 }}>Save Settings</button>
      <div style={{ marginTop:28, paddingTop:18, borderTop:`1px solid ${T.line}` }}>
        <div style={{ fontSize:11, color:T.muted, textTransform:"uppercase", letterSpacing:0.5, marginBottom:10 }}>Coming soon</div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
          {["Online Payment","UPI QR","Waiter Call","Feedback","Analytics","Multi-branch","Coupons","Multi-language"].map(f=>(
            <span key={f} style={{ fontSize:11.5, color:T.muted, border:`1px dashed ${T.line}`, borderRadius:999, padding:"5px 12px" }}>{f}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
