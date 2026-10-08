#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {randomUUID,createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {getDb,REPO_ROOT} from './lib/db.mjs';
import {parseCsv,pick} from './lib/csv.mjs';
import {table} from './lib/format.mjs';

export const commands={
 help:'', tickets:'', 'sla-risk':'', attention:'', assets:'', 'asset-risk':'', services:'', 'service-health':'', problems:'', 'problem-review':'', changes:'', 'change-review':'', workload:'', compliance:'', 'weekly-review':'',
 ticket:'ticket', activity:'ticket',
 'add-ticket':'reference name requester owner service asset problem type priority response-due resolve-due actor',
 'update-ticket':'ticket owner service asset problem priority status response-due resolve-due actor',
 respond:'ticket note actor', resolve:'ticket note actor', log:'ticket note actor',
 'add-service':'reference name owner criticality actor',
 'add-asset':'reference name service custodian warranty review-on actor',
 'update-asset':'asset custodian status warranty review-on disposal-evidence actor',
 'add-problem':'reference name service owner actor',
 'update-problem':'problem owner status root-cause workaround resolution actor',
 'add-change':'reference name service owner risk scheduled plan rollback evidence actor',
 'update-change':'change name owner risk scheduled plan rollback evidence actor',
 'approve-change':'change note actor', 'complete-change':'change outcome actor',
 retention:'ticket personal review-on basis hold actor',
 'draft-incident':'ticket', import:'file map timezone actor dry-run', export:''
};
const allowedTables=['tickets','assets','services','problems','changes','activity'];
const required=(o,k)=>{if(typeof o[k]!=='string'||!o[k].trim())throw Error(`--${k} is required`);return o[k].trim();};
const enumValue=(v,values,k)=>{if(!values.includes(v))throw Error(`${k} must be ${values.join('|')}`);return v;};
export function isoDate(v){if(!/^\d{4}-\d{2}-\d{2}$/.test(v)||!Number.isFinite(Date.parse(v))||new Date(v).toISOString().slice(0,10)!==v)throw Error('Expected a real ISO date YYYY-MM-DD');return v;}
export function timestamp(v){if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/.test(v)||!Number.isFinite(Date.parse(v)))throw Error('Expected an ISO timestamp with timezone');isoDate(v.slice(0,10));return new Date(v).toISOString();}
const bool=v=>enumValue(v,['true','false'],'boolean')==='true';
function parse(argv){const p=[],o={};for(const a of argv){if(a.startsWith('--')){const at=a.indexOf('=');const k=a.slice(2,at<0?undefined:at);if(k in o)throw Error(`Duplicate option --${k}`);o[k]=at<0?true:a.slice(at+1);}else p.push(a);}const c=p[0]||'help';if(!Object.hasOwn(commands,c))throw Error(`Unknown command ${c}`);const allowed=new Set([...commands[c].split(' '),'json']);for(const k of Object.keys(o)){if(!allowed.has(k))throw Error(`Unknown option --${k}`);if(['json','dry-run'].includes(k)){if(o[k]!==true)throw Error(`--${k} is a bare flag`);}else if(typeof o[k]!=='string')throw Error(`--${k} needs a value`);}if(p.length>(c==='import'?2:1))throw Error('Unexpected positional argument');return {c,p,o};}
export async function resolveRef(db,t,ref){
 if(!allowedTables.includes(t)||t==='activity')throw Error('Invalid record type');
 const rows=await db.query(`select * from ${t} where lower(reference)=lower($1) or id::text=$1 or lower(name)=lower($1) order by reference`,[ref]);
 const matches=rows.length?rows:await db.query(`select * from ${t} where starts_with(id::text,lower($1)) or position(lower($1) in lower(name))>0 order by reference`,[ref]);
 if(matches.length!==1)throw Error(matches.length?`Ambiguous ${t}:\n${matches.map(r=>`${r.reference}: ${r.name}`).join('\n')}`:`No matching ${t}: ${ref}`);
 return matches[0];
}
async function insert(db,t,data){const keys=Object.keys(data);return (await db.query(`insert into ${t} (${keys.join(',')}) values (${keys.map((_,i)=>`$${i+1}`).join(',')}) returning *`,Object.values(data)))[0];}
async function update(db,t,id,data){if(!Object.keys(data).length)throw Error('No changed fields supplied');const keys=Object.keys(data);return (await db.query(`update ${t} set ${keys.map((k,i)=>`${k}=$${i+1}`).join(',')} where id=$${keys.length+1} returning *`,[...Object.values(data),id]))[0];}
async function audit(db,t,r,actor,action,note){await insert(db,'activity',{entity_type:t,entity_id:r.id,actor,action,note});}
async function transaction(db,fn,dry=false){await db.exec('BEGIN');try{const result=await fn();await db.exec(dry?'ROLLBACK':'COMMIT');return result;}catch(e){await db.exec('ROLLBACK');throw e;}}
async function fields(db,o,type){
 const data={};const assign=(flag,col=flag,convert=v=>v)=>{if(Object.hasOwn(o,flag))data[col]=convert(o[flag]);};
 for(const k of ['name','owner'])assign(k,k,v=>{if(!v.trim())throw Error(`${k} cannot be empty`);return v.trim();});
 if(type==='tickets'){
  assign('requester');assign('priority','priority',v=>enumValue(v,['low','medium','high','urgent'],'priority'));assign('type','type',v=>enumValue(v,['incident','service-request'],'type'));
  assign('response-due','response_due',timestamp);assign('resolve-due','resolve_due',timestamp);
  assign('status','status',v=>enumValue(v,['open','pending','resolved','closed'],'status'));
 }
 if(type==='assets'){
  assign('custodian');assign('status','status',v=>enumValue(v,['in-use','spare','retired'],'status'));assign('warranty','warranty_on',isoDate);assign('review-on','review_on',isoDate);assign('disposal-evidence','disposal_evidence');
 }
 if(type==='services')assign('criticality','criticality',v=>enumValue(v,['normal','critical'],'criticality'));
 if(type==='problems'){
  assign('status','status',v=>enumValue(v,['open','known-error','resolved'],'status'));assign('root-cause','root_cause');assign('workaround');assign('resolution');
 }
 if(type==='changes'){
  assign('risk','risk',v=>enumValue(v,['low','medium','high'],'risk'));assign('scheduled','scheduled_at',timestamp);for(const k of ['plan','rollback','evidence'])assign(k);
 }
 for(const [flag,t] of [['service','services'],['asset','assets'],['problem','problems']])if(Object.hasOwn(o,flag)&&(flag==='service'||type==='tickets'))data[`${flag}_id`]=o[flag]===''?null:(await resolveRef(db,t,o[flag])).id;
 return data;
}
async function validLinks(db,t){
 for(const [col,table] of [['asset_id','assets'],['problem_id','problems']])if(t[col]){const linked=(await db.query(`select * from ${table} where id=$1`,[t[col]]))[0];if(linked.service_id&&t.service_id!==linked.service_id)throw Error(`${table} belongs to a different service`);if(table==='problems'&&linked.status==='resolved'&&(!t.status||['open','pending'].includes(t.status)))throw Error('Reopen the resolved problem before linking an active ticket');}
}
const queries={
 tickets:'select * from ticket_queue order by reference',
 'sla-risk':"select reference,name,priority,owner,response_overdue,resolution_overdue,quiet_days from ticket_queue where status in ('open','pending') and (response_overdue or resolution_overdue) order by reference",
 attention:"select reference,name,owner,quiet_days,response_overdue,resolution_overdue from ticket_queue where status in ('open','pending') and (quiet_days>=7 or owner='' or response_overdue or resolution_overdue) order by reference",
 assets:'select reference,name,custodian,status,warranty_on,review_on from assets order by reference',
 'asset-risk':"select reference,name,custodian,service,open_incidents,overdue_incidents,warranty_on from asset_risk where status<>'retired' and (custodian='' or warranty_on<current_date or review_on<=current_date or open_incidents>1) order by reference",
 services:'select reference,name,owner,criticality from services order by reference',
 'service-health':'select reference,name,owner,criticality,open_tickets,overdue_tickets from service_health order by reference',
 problems:'select reference,name,owner,status,root_cause,workaround,resolution from problems order by reference',
 'problem-review':"select reference,name,owner,status,root_cause,workaround,linked_tickets,open_tickets from problem_review where status<>'resolved' order by open_tickets desc,reference",
 changes:'select reference,name,owner,risk,status,scheduled_at,approved_by from changes order by scheduled_at,reference',
 'change-review':"select reference,name,risk,status,scheduled_at,service,open_tickets from change_review where status<>'completed' order by scheduled_at,reference",
 workload:"select coalesce(nullif(owner,''),'Unassigned') as owner,count(*)::int as open_tickets,count(*) filter(where response_overdue or resolution_overdue)::int as overdue,count(*) filter(where quiet_days>=7)::int as stale from ticket_queue where status in ('open','pending') group by owner order by overdue desc,owner",
 compliance:'select * from compliance_findings order by reference,rule'
};
const aliases={source_id:['Display ID','Ticket ID','ID'],name:['Subject','Title'],requester:['Requester','Requester Name'],owner:['Agent','Assigned To'],priority:['Priority'],status:['Status'],type:['Type'],opened_at:['Created Time','Created At'],response_due:['First Response Due','First Response Due By'],resolve_due:['Due By','Resolution Due'],responded_at:['First Response Time'],resolved_at:['Resolved Time'],resolution:['Resolution']};
async function importTickets(db,o){
 const actor=required(o,'actor'),file=required(o,'file'),rows=parseCsv(fs.readFileSync(file,'utf8'));if(!rows.length)throw Error('CSV has no records');
 const mapping=o.map?JSON.parse(fs.readFileSync(o.map,'utf8')):{};
 if(!mapping||Array.isArray(mapping)||typeof mapping!=='object')throw Error('Mapping must be an object');
 for(const [key,col] of Object.entries(mapping)){if(!Object.hasOwn(aliases,key)||typeof col!=='string')throw Error(`Unknown mapping ${key}`);if(!Object.hasOwn(rows[0],col))throw Error(`Mapped column missing: ${col}`);}
 const get=(r,k)=>mapping[k]!==undefined?r[mapping[k]]:pick(r,...aliases[k]);
 return transaction(db,async()=>{let added=0,unchanged=0;const seen=new Set();for(const row of rows){
  const sourceId=String(get(row,'source_id')).trim(),name=String(get(row,'name')).trim();if(!sourceId||!name)throw Error('Every row needs Ticket ID and Subject (or explicit mapping)');if(seen.has(sourceId))throw Error(`Duplicate source ID ${sourceId}`);seen.add(sourceId);
  const hash=createHash('sha256').update(JSON.stringify({row,mapping,timezone:o.timezone||null})).digest('hex');const old=(await db.query('select * from tickets where source_id=$1',[sourceId]))[0];
  if(old){if(old.source_hash!==hash)throw Error(`Source ticket ${sourceId} changed; reconcile before importing`);unchanged++;continue;}
  const status=String(get(row,'status')||'open').toLowerCase().trim();const priority=String(get(row,'priority')||'medium').toLowerCase().trim();const type=String(get(row,'type')||'incident').toLowerCase().trim().replace(/\s+/g,'-');
  const data={reference:`FS-${sourceId}`,name,requester:get(row,'requester'),owner:get(row,'owner'),status:enumValue(status,['open','pending','resolved','closed'],'import status'),priority:enumValue(priority,['low','medium','high','urgent'],'import priority'),type:enumValue(type,['incident','service-request'],'import type'),source_id:sourceId,source_row:JSON.stringify(row),source_hash:hash};
  for(const k of ['opened_at','response_due','resolve_due','responded_at','resolved_at']){const value=get(row,k);if(value){let text=String(value).trim();if(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2})?$/.test(text)){if(!/^[+-](0[0-9]|1[0-4]):[0-5][0-9]$/.test(o.timezone||''))throw Error('Timezone required for local export times: --timezone=+12:00');text=text.replace(' ','T')+o.timezone;}data[k]=timestamp(text);}}
  if(!data.opened_at)throw Error('Created Time is required with a timezone; use --map for a different heading');
  data.touched_at=data.opened_at;data.resolution=get(row,'resolution');
  for(const k of ['opened_at','responded_at','resolved_at'])if(data[k]&&Date.parse(data[k])>Date.now())throw Error(`${k} cannot be in the future`);
  const ticket=await insert(db,'tickets',data);await audit(db,'tickets',ticket,actor,'import','Freshservice ticket CSV; personal record review and links need verification');added++;
 }return {added,unchanged,dry_run:Boolean(o['dry-run'])};},o['dry-run']);
}
export async function run(db,argv){
 const {c,p,o}=parse(argv);
 if(c==='help')return Object.entries(commands).map(([command,options])=>({command,options:options.split(' ').filter(Boolean).map(x=>`--${x}`).join(' ')}));
 if(queries[c])return db.query(queries[c]);
 if(c==='weekly-review'){const out={};for(const command of ['sla-risk','problem-review','change-review','compliance'])out[command]=await run(db,[command]);return out;}
 if(c==='ticket'||c==='activity'||c==='draft-incident'){
  const ticket=await resolveRef(db,'tickets',required(o,'ticket'));const activity=await db.query("select actor,action,note,created_at from activity where entity_type='tickets' and entity_id=$1 order by created_at,id",[ticket.id]);
  if(c==='activity')return activity;
  if(c==='ticket')return {ticket,activity};
  const content=`# DRAFT incident brief: ${ticket.reference}\n\nInternal review only. Nothing sent.\n\n${ticket.name}\nOwner: ${ticket.owner||'Unassigned'}\nStatus: ${ticket.status}\nResolution: ${ticket.resolution||'Not recorded'}\n\n## Recorded activity\n\n${human(activity)}\n\nConfirm impact, timeline and recovery evidence with the owner before sharing.\n`;
  return writeFile('drafts',`incident-${ticket.id}`,content,'.md');
 }
 if(c==='import'){if(p[1]!=='freshservice')throw Error('Supported import: freshservice');return importTickets(db,o);}
 if(c==='export'){const records={};for(const t of allowedTables)records[t]=await db.query(`select * from ${t} order by id`);return writeFile('exports','service',JSON.stringify({format:'it-service-for-claude-code/v1',exported_at:new Date().toISOString(),records},null,2),' .json'.trim());}
 const actor=required(o,'actor');
 return transaction(db,async()=>{
  if(c.startsWith('add-')){
   const type={'add-ticket':'tickets','add-service':'services','add-asset':'assets','add-problem':'problems','add-change':'changes'}[c];
   const data={reference:required(o,'reference'),...await fields(db,o,type)};required(o,'name');
   if(['tickets','services','problems','changes'].includes(type))required(o,'owner');
   if(type==='changes')for(const k of ['risk','scheduled','plan','rollback'])required(o,k);
   if(type==='tickets')await validLinks(db,data);
   const row=await insert(db,type,data);await audit(db,type,row,actor,c,'Record created');return row;
  }
  const type=c.includes('asset')?'assets':c.includes('problem')?'problems':c.includes('change')?'changes':'tickets';
  const flag={assets:'asset',problems:'problem',changes:'change',tickets:'ticket'}[type];
  const match=await resolveRef(db,type,required(o,flag));const row=(await db.query(`select * from ${type} where id=$1 for update`,[match.id]))[0];
  let data={};
  if(c.startsWith('update-')){
   data=await fields(db,o,type);if(!Object.keys(data).length)throw Error('No changed fields supplied');const next={...row,...data};
   if(type==='tickets'){
    if(data.status==='resolved')throw Error('Use resolve with evidence to resolve a ticket');
    if(data.status==='closed'&&row.status!=='resolved')throw Error('Resolve a ticket before closing');
    if(['open','pending'].includes(data.status)&&['resolved','closed'].includes(row.status)){data.resolved_at=null;data.resolution='';}
    await validLinks(db,next);data.touched_at=new Date().toISOString();
   }
   if(type==='assets'&&next.status==='retired'&&!next.disposal_evidence.trim())throw Error('Retirement needs disposal-evidence');
   if(type==='problems'&&next.status==='known-error'&&(!next.root_cause.trim()||!next.workaround.trim()))throw Error('Known errors need root-cause and workaround');
   if(type==='problems'&&next.status==='resolved'){
    if(!next.root_cause.trim()||!next.resolution.trim())throw Error('Problem resolution needs root-cause and resolution');
    const active=await db.query("select id from tickets where problem_id=$1 and status in ('open','pending')",[row.id]);if(active.length)throw Error('Resolve linked open tickets before resolving the problem');
   }
   if(type==='changes'){
    if(row.status==='completed')throw Error('Completed changes cannot be edited');
    if(!next.plan.trim()||!next.rollback.trim())throw Error('Plan and rollback cannot be empty');
    Object.assign(data,{status:'draft',approved_by:'',approved_at:null,approval_note:''});
   }
  }else if(c==='respond'){
   if(!['open','pending'].includes(row.status))throw Error('Only open or pending tickets accept response acknowledgement');if(row.responded_at)throw Error('First response already recorded');
   data={responded_at:new Date().toISOString(),touched_at:new Date().toISOString()};required(o,'note');
  }else if(c==='resolve'){
   if(!['open','pending'].includes(row.status))throw Error('Ticket already resolved or closed');
   if(!row.owner.trim())throw Error('Assign an owner before resolution');data={status:'resolved',resolution:required(o,'note'),resolved_at:new Date().toISOString(),touched_at:new Date().toISOString()};
  }else if(c==='log'){data={touched_at:new Date().toISOString()};required(o,'note');}
  else if(c==='retention'){
   data={contains_personal:bool(required(o,'personal')),retention_review_on:isoDate(required(o,'review-on')),retention_basis:required(o,'basis')};if(Object.hasOwn(o,'hold'))data.legal_hold=o.hold;
  }else if(c==='approve-change'){
   if(row.status!=='draft')throw Error('Only draft changes can be approved');
   if(actor.toLowerCase()===row.owner.toLowerCase())throw Error('Approver must differ from change owner');
   if(!row.service_id||!row.evidence.trim())throw Error('Service and test evidence required before approval');
   if(Date.parse(row.scheduled_at)<=Date.now())throw Error('Reschedule the change into the future before approval');
   data={status:'approved',approved_by:actor,approval_note:required(o,'note'),approved_at:new Date().toISOString()};
  }else if(c==='complete-change'){
   if(row.status!=='approved')throw Error('Change must be approved before completion');
   data={status:'completed',outcome:required(o,'outcome'),completed_at:new Date().toISOString()};
  }else throw Error(`Unimplemented command ${c}`);
  const result=await update(db,type,row.id,data);
  await audit(db,type,row,actor,c,JSON.stringify({note:o.note||o.outcome||'',before:Object.fromEntries(Object.keys(data).map(k=>[k,row[k]])),after:data}));return result;
 });
}
function writeFile(dir,name,content,extension){const root=path.resolve(process.env.OUTPUT_DIR||REPO_ROOT,dir);fs.mkdirSync(root,{recursive:true});const file=path.join(root,`${name}-${randomUUID()}${extension}`);fs.writeFileSync(file,content+'\n',{flag:'wx'});return {file};}
export function human(result){
 if(Array.isArray(result)){if(!result.length)return '(none)';const cols=Object.keys(result[0]).filter(k=>!['id','source_row','source_hash','created_at','updated_at'].includes(k));return table(result,cols.map(key=>({key,label:key,width:45,format:v=>v instanceof Date?v.toISOString():v&&typeof v==='object'?JSON.stringify(v):String(v??'')})));}
 if(result&&typeof result==='object')return Object.entries(result).map(([k,v])=>v&&typeof v==='object'?`${k}\n${human(Array.isArray(v)?v:[v])}`:`${k}: ${v??''}`).join('\n\n');
 return String(result);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){let db;try{db=await getDb();const result=await run(db,process.argv.slice(2));console.log(process.argv.includes('--json')?JSON.stringify(result,null,2):human(result));}catch(e){console.error(e.message);process.exitCode=1;}finally{if(db)await db.close();}}
