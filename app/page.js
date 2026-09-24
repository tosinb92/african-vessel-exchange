"use client";
import {useMemo,useState} from "react";
import {createClient} from "@supabase/supabase-js";

const seed=[
{id:"AVE-R001",title:"Offshore Vessel Opportunity",type:"Offshore Support Vessel",market:"Nigeria",status:"Research lead",price:"Price on request",currency:"USD / NGN",commercial:"Enquire",note:"Public-source opportunity — ownership and availability require verification."},
{id:"AVE-R002",title:"Commercial Tug Opportunity",type:"Tug",market:"Nigeria",status:"Research lead",price:"Price on request",currency:"USD / NGN",commercial:"Enquire",note:"Market intelligence — owner authority not yet confirmed."},
{id:"AVE-R003",title:"Marine Asset Acquisition Brief",type:"Barge",market:"West Africa",status:"Buyer requirement",price:"Budget on request",currency:"USD / NGN",commercial:"Mandate",note:"Illustrative AVE pipeline category — details available after qualification."}
];

const supabaseUrl=process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const supabase=supabaseUrl&&supabaseKey?createClient(supabaseUrl,supabaseKey):null;

export default function Home(){
 const [q,setQ]=useState(""); const [mode,setMode]=useState("All"); const [modal,setModal]=useState(null); const [sent,setSent]=useState(false); const [sending,setSending]=useState(false); const [error,setError]=useState("");
 const rows=useMemo(()=>seed.filter(x=>(mode==="All"||x.status===mode)&&JSON.stringify(x).toLowerCase().includes(q.toLowerCase())),[q,mode]);
 async function submit(e){
  e.preventDefault(); setSending(true); setError("");
  const d=Object.fromEntries(new FormData(e.currentTarget));
  if(!supabase){setError("AVE connection is temporarily unavailable.");setSending(false);return}
  const payload={name:d.name,company:d.company||null,email:d.email,phone:d.phone||null,intent:d.intent,details:d.details,opportunity:d.opportunity,source:"website"};
  const attempts=[
   ["inquiries",payload],
   ["enquiries",payload],
   ["leads",payload]
  ];
  let last=null;
  for(const [table,data] of attempts){
   const {error}=await supabase.from(table).insert(data); if(!error){setSent(true);setSending(false);return} last=error;
  }
  console.error(last); setError("We couldn't submit this yet. Please try again shortly."); setSending(false);
 }
 return <><header><a className="brand" href="#"><b>AVE</b><span>AFRICAN VESSEL EXCHANGE</span></a><nav><a href="#market">Marketplace</a><a href="#how">How it works</a><a href="#capital">Capital</a><a href="#about">About</a></nav><div className="headBtns"><button className="plain" onClick={()=>setModal("signin")}>Sign in</button><button className="gold" onClick={()=>setModal("list")}>List a vessel</button></div></header>
 <main><section className="hero"><div className="heroText"><p className="eyebrow">AFRICA'S HEAVY MARINE MARKETPLACE</p><h1>Find vessels.<br/><em>Move opportunities.</em><br/>Across Africa.</h1><p className="lead">A specialist exchange connecting vessel owners, buyers, charterers, operators and capital across Africa's marine economy.</p><div className="buttons"><a className="gold button" href="#market">Browse opportunities →</a><button className="outline" onClick={()=>setModal("list")}>List a vessel</button></div><div className="trust"><span>◈ Verification workflow</span><span>◎ Owner & agent onboarding</span><span>↗ Qualified enquiries</span></div></div><aside><p>BUY · SELL · CHARTER · FINANCE</p><h3>One exchange.<br/>Four ways to transact.</h3><div><span>⚓ Vessels</span><span>↔ Charter</span><span>◇ Marine assets</span><span>▥ Capital</span></div></aside></section>
 <section className="finder" id="market"><div className="tabs">{["All","Research lead","Buyer requirement"].map(x=><button key={x} className={mode===x?"active":""} onClick={()=>setMode(x)}>{x}</button>)}</div><div className="search"><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search vessel type, location or keyword"/><button>Search</button></div></section>
 <section className="market"><div className="title"><div><p className="eyebrow dark">THE EXCHANGE</p><h2>Current opportunities</h2></div><span>{rows.length} opportunities</span></div><div className="grid">{rows.map(x=><article className="card" key={x.id}><div className="art"><span>{x.status.toUpperCase()}</span>⚓</div><div className="body"><small>{x.id}</small><h3>{x.title}</h3><dl><div><dt>TYPE</dt><dd>{x.type}</dd></div><div><dt>MARKET</dt><dd>{x.market}</dd></div><div><dt>PRICE / BUDGET</dt><dd>{x.price}</dd></div><div><dt>CURRENCY</dt><dd>{x.currency}</dd></div><div><dt>COMMERCIALS</dt><dd>{x.commercial}</dd></div></dl><p className="note">{x.note}</p><button className="green" onClick={()=>setModal(x.id)}>Enquire →</button></div></article>)}</div></section>
 <section className="process" id="how"><p className="eyebrow">BUILT FOR REAL TRANSACTIONS</p><h2>From discovery to deal room.</h2><div className="steps">{[["01","Discover","Search sale, charter and finance opportunities."],["02","Qualify","See source and verification status before progressing."],["03","Connect","Submit a vessel or send a qualified enquiry."],["04","Transact","Progress diligence, offers and completion."]].map(s=><article key={s[0]}><b>{s[0]}</b><h3>{s[1]}</h3><p>{s[2]}</p></article>)}</div></section>
 <section className="capital" id="capital"><div><p className="eyebrow">CAPITAL & PARTNERSHIPS</p><h2>Marine assets meet capital.</h2><p>Owners can indicate finance requirements while investors and buyers register acquisition criteria.</p></div><button className="gold" onClick={()=>setModal("capital")}>Register investment interest →</button></section>
 <section className="about" id="about"><div className="huge">AVE</div><div><h2>Built from Africa.<br/>Built for maritime trade.</h2><p>Starting in Nigeria and designed to connect credible marine opportunities across African markets.</p></div></section></main>
 <footer><div className="brand"><b>AVE</b><span>AFRICAN VESSEL EXCHANGE</span></div><p>Buy · Sell · Charter · Finance</p><small>© 2026 African Vessel Exchange. Opportunity information must be independently verified before transaction.</small></footer>
 {modal&&<div className="backdrop" onMouseDown={e=>e.target===e.currentTarget&&(setModal(null),setSent(false),setError(""))}><div className="modal"><button className="x" onClick={()=>{setModal(null);setSent(false);setError("")}}>×</button>{sent?<><p className="eyebrow dark">AVE</p><h2>Received.</h2><p>Your submission has been securely recorded with AVE for qualification.</p></>:<><p className="eyebrow dark">AVE TRANSACTION DESK</p><h2>{modal==="list"?"List a vessel":modal==="capital"?"Register investment interest":modal==="signin"?"Account access":"Opportunity enquiry"}</h2><p>{modal==="signin"?"Secure account authentication is being enabled.":"Give us enough information to qualify the opportunity."}</p>{modal!=="signin"&&<form onSubmit={submit}><input name="name" required placeholder="Full name"/><input name="company" placeholder="Company"/><input name="email" type="email" required placeholder="Business email"/><input name="phone" placeholder="Phone / WhatsApp"/><select name="intent" defaultValue={modal==="list"?"Sell a vessel":modal==="capital"?"Invest / provide capital":"Buy / charter"}><option>Buy / charter</option><option>Sell a vessel</option><option>Seek finance</option><option>Invest / provide capital</option></select><textarea name="details" required placeholder="Vessel, requirement, location, budget / asking price (USD / NGN) and timing"></textarea><input type="hidden" name="opportunity" value={modal}/>{error&&<p className="note">{error}</p>}<button className="green" disabled={sending}>{sending?"Submitting…":"Submit to AVE"}</button></form>}</>}</div></div>}</>
}