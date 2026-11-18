import {NextResponse} from "next/server";
import {createClient} from "@supabase/supabase-js";
export const runtime="nodejs";
export const maxDuration=60;
const sources=[
"https://sher-worldwide.com/product/3317-2012-built-16000bhp-dp2-aht-supply-vessel/",
"https://sher-worldwide.com/product/3380-high-power-ahts-204t-bollard-pull-vessel-sale/",
"https://sher-worldwide.com/product/3799-65m-ahts-dp2-vessel-for-sale-china-resale/",
"https://sher-worldwide.com/product/3948-13000hp-multipurpose-ahts-osv-newbuilding-transfer/",
"https://vedshipping.com/sale-and-purchase/vessels/ahtahtsahtsv/",
"https://vedshipping.com/sale-and-purchase/vessels/offshore/",
"https://sher-worldwide.com/product/3728-aht-ahts-offshore-vessel-package-sale/",
"https://shipselector.com/requests/offshore-vessels",
"https://sher-worldwide.com/product/3319-115t-bollard-pull-dp2-multipurpose-ahts-2026/"
];
export async function GET(req){
const auth=req.headers.get("authorization");
if(!process.env.CRON_SECRET||auth!==`Bearer ${process.env.CRON_SECRET}`)return NextResponse.json({error:"Unauthorized"},{status:401});
if(!process.env.SUPABASE_SERVICE_ROLE_KEY||!process.env.NEXT_PUBLIC_SUPABASE_URL)return NextResponse.json({error:"Inventory database is not configured"},{status:503});
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);
const results=[];
for(const url of sources){
try{
const response=await fetch(url,{headers:{"User-Agent":"AVE-InventoryMonitor/1.0 (+contact site administrator)"},signal:AbortSignal.timeout(6500),cache:"no-store"});
const html=response.ok?await response.text():"";
const canonical=html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i)?.[1]||url;
const title=html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)/i)?.[1]||html.match(/<title>([^<]+)/i)?.[1]||"";
const photo=html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)/i)?.[1]||"";
let validImage=false;
if(photo){try{const img=await fetch(new URL(photo,url),{method:"HEAD",signal:AbortSignal.timeout(3500)});validImage=img.ok&&(img.headers.get("content-type")||"").startsWith("image/")}catch{}}
const record={source_url:url,canonical_url:canonical,title:title.slice(0,300),image_url:validImage?new URL(photo,url).href:null,image_verified:validImage,source_live:response.ok,last_checked_at:new Date().toISOString(),http_status:response.status};
const {error}=await db.from("ave_inventory_sources").upsert(record,{onConflict:"source_url"});
results.push({url,status:response.status,image_verified:validImage,saved:!error,error:error?.message});
}catch(e){const {error}=await db.from("ave_inventory_sources").upsert({source_url:url,source_live:false,last_checked_at:new Date().toISOString(),last_error:String(e).slice(0,400)},{onConflict:"source_url"});results.push({url,error:String(e),saved:!error})}
}
return NextResponse.json({checked:results.length,results});
}
