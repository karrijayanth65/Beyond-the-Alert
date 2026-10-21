import {createHash} from 'node:crypto';
import {validateAlert,publicIPv4} from './validation.mjs';
import {validateAssessment,applyPolicy} from './analysis.mjs';
const escapeSlack=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
export function makePayloads(alert,assessment,enrichment,customerId=1) {
  if(!Number.isInteger(customerId)||customerId<1)throw new Error('CONFIG: positive IRIS customer ID required');
  const context={observed_at:alert.observed_at,host:alert.host,subject:alert.subject??null,initiating_user:alert.initiating_user??null,evidence:alert.evidence,enrichment,assessment};
  const note=JSON.stringify(context,null,2);
  return {
    iris:{alert_title:`Beyond the Alert | ${alert.event_type} | ${alert.host}`,alert_description:`Investigation lead. ${assessment.summary}`,alert_source:'Beyond the Alert',alert_source_ref:alert.alert_id,alert_source_link:alert.source_link,alert_severity_id:{low:2,medium:3,high:4,critical:5}[assessment.severity],alert_status_id:2,alert_customer_id:customerId,alert_note:note,alert_tags:`beyond-the-alert,${alert.event_type},analyst-review`,alert_iocs:[],alert_assets:[],alert_context:context},
    slack:{text:`Beyond the Alert | ${assessment.severity.toUpperCase()} | ${escapeSlack(alert.host)}\n${escapeSlack(assessment.summary)}\nSource time: ${escapeSlack(alert.observed_at)}\nReview: ${assessment.recommended_checks.map(escapeSlack).join(', ')}\nSource: ${escapeSlack(alert.source_link)}\nAnalyst validation required.`,unfurl_links:false,unfurl_media:false}
  };
}
export async function processAlert(input,{store,adapters,delivery='prepare',customerId=1,now=()=>new Date().toISOString()}={}) {
  if(!store||!adapters||!['prepare','send'].includes(delivery))throw new Error('CONFIG: store adapters and delivery mode required');
  const alert=validateAlert(input), key=JSON.stringify([alert.source,alert.alert_id]);
  const fingerprint=createHash('sha256').update(JSON.stringify(alert)).digest('hex');
  const record={schema_version:1,project:'Beyond the Alert',alert,status:'processing',fingerprint,started_at:now(),stages:[],errors:[],delivery_mode:delivery};
  const reservation=await store.reserve(key,record);
  if(!reservation.created) {
    if(reservation.record.fingerprint!==fingerprint)return {status:'needs_review',reason:'duplicate_identity_conflict',alert_id:alert.alert_id};
    return {...reservation.record,duplicate:true};
  }
  const stage=async(name,details={})=>{record.stages.push({name,at:now(),...details});await store.save(key,record);};
  try {
    await stage('input_validated'); record.enrichment=[];
    if(alert.source_ip) {
      if(publicIPv4(alert.source_ip)) record.enrichment.push(await adapters.reputation('ip',alert.source_ip));
      else record.enrichment.push({type:'ip',value:alert.source_ip,status:'skipped',reason:'non_public_address'});
    }
    if(alert.sha256)record.enrichment.push(await adapters.reputation('hash',alert.sha256));
    // Enrichment is source bound even when an adapter is replaced for testing.
    for(const e of record.enrichment) if(e.status==='available'&&e.value!==(e.type==='ip'?alert.source_ip:alert.sha256))throw new Error('ENRICHMENT: source indicator mismatch');
    await stage('enrichment_completed');
    record.assessment=applyPolicy(validateAssessment(await adapters.analyze(alert,record.enrichment),alert),alert,record.enrichment);
    record.payloads=makePayloads(alert,record.assessment,record.enrichment,customerId);
    record.notification_eligible=['high','critical'].includes(record.assessment.severity);
    await stage('case_prepared');
    if(delivery==='send') {
      await stage('iris_add_attempted'); record.iris_alert_id=await adapters.addAlert(record.payloads.iris); await stage('iris_alert_created');
      await stage('iris_escalation_attempted'); record.iris_case_id=await adapters.escalate(record.iris_alert_id); await stage('iris_case_created');
      if(record.notification_eligible){await stage('slack_attempted');record.slack_timestamp=await adapters.notify(record.payloads.slack);await stage('slack_delivered');}
      record.status='delivered';
    } else record.status='prepared';
    record.finished_at=now(); await store.save(key,record); return record;
  } catch(error) {
    record.status='needs_review'; record.finished_at=now();
    // Only controlled errors are recorded; arbitrary provider messages could contain secrets.
    const message=String(error.message||'');
    record.errors.push(/^(INPUT|MODEL|ENRICHMENT|DELIVERY|TRANSPORT|CONFIG):/.test(message)?message:'PROCESSING: unavailable dependency');
    await store.save(key,record); return record;
  }
}
