import { createServerFn } from '@tanstack/react-start';
import { createClient } from '@supabase/supabase-js';
import { contactSchema,contactsSchema,ratesSchema,statsSchema } from './bank';
import type { SiteData } from './bank';
import type { Database } from '@/integrations/supabase/types';
export const getSiteData=createServerFn({method:'GET'}).handler(async():Promise<SiteData>=>{
 const key=process.env['SUPABASE_PUBLISHABLE_KEY']; const url=process.env['SUPABASE_URL']; if(!key||!url)throw new Error('Website content is unavailable.');
 const client=createClient<Database>(url,key,{auth:{persistSession:false},global:{fetch:(input,init)=>{const h=new Headers(init?.headers);if(key.startsWith('sb_')&&h.get('Authorization')===`Bearer ${key}`)h.delete('Authorization');h.set('apikey',key);return fetch(input,{...init,headers:h});}}});
 const {data,error}=await client.from('site_content').select('key,value');if(error)throw new Error('Website content could not load.');
 const rows=Object.fromEntries((data??[]).map(r=>[r.key,r.value])); return {rates:ratesSchema.parse(rows['rates']),stats:statsSchema.parse(rows['stats']),contacts:contactsSchema.parse(rows['contacts'])};
});
export const submitContact=createServerFn({method:'POST'}).inputValidator((input:unknown)=>contactSchema.parse(input)).handler(async({data})=>{
 const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
 const bytes=new TextEncoder().encode(data.email.toLowerCase());const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(x=>x.toString(16).padStart(2,'0')).join('');
 const {data:limit}=await supabaseAdmin.from('contact_limits').select('last_sent').eq('email_hash',hash).maybeSingle();
 if(limit&&Date.now()-new Date(limit.last_sent).getTime()<60000)throw new Error('Please wait one minute before sending another inquiry.');
 const {error:limitError}=await supabaseAdmin.from('contact_limits').upsert({email_hash:hash,last_sent:new Date().toISOString()});if(limitError)throw new Error('Unable to send right now.');
 const {data:row,error}=await supabaseAdmin.from('contact_submissions').insert({name:data.name,email:data.email,topic:data.topic,message:data.message}).select('id').single();
 if(error)throw new Error('Your inquiry could not be saved. Please try again.');return {id:row.id};
});
