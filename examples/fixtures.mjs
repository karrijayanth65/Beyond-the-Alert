// Fictional records created for reproducible verification, not captured endpoint logs.
export const SCENARIOS=['failed_logins','account_change','file_hash','powershell','network_scan'];
export function exampleAlert(type='account_change') {
  const event={failed_logins:4625,account_change:4732,file_hash:1,powershell:1,network_scan:5157}[type];
  const summaries={failed_logins:'Seven failed logons for a lab account from 192.168.56.20.',account_change:'A lab account was added to the local Administrators group; authorization requires review.',file_hash:'A new process has a SHA256 value available for reputation review.',powershell:'A process command line includes an encoded PowerShell argument.',network_scan:'Blocked connection records cover four destination service ports.'};
  const evidence=[{ref:'event-001',event_id:event,record_id:'example-001',summary:summaries[type]}];
  if(type==='account_change') evidence.push({ref:'event-002',event_id:4720,record_id:'example-002',summary:'The initiating lab-operator identity created lab-user on the lab host before the group membership change.'});
  return {schema_version:1,source:'splunk',alert_id:`example-${type}-001`,event_type:type,observed_at:'2026-10-21T09:30:00Z',host:'JAYANTH-LAB-01',subject:'lab-user',initiating_user:type==='account_change'?'lab-operator':null,source_ip:['failed_logins','network_scan','account_change'].includes(type)?'192.168.56.20':null,sha256:type==='file_hash'?'a'.repeat(64):null,source_link:'https://splunk.example.invalid/en-US/app/search/search?sid=example',evidence,details:type==='account_change'?{group_sid:'S-1-5-32-544'}:type==='powershell'?{encoded:true}:type==='failed_logins'?{count:7}:type==='network_scan'?{unique_ports:4}: {},synthetic:true};
}
export function exampleAssessment(a) {
  return {alert_id:a.alert_id,host:a.host,subject:a.subject??null,initiating_user:a.initiating_user??null,severity:'medium',summary:`${a.event_type.replaceAll('_',' ')} activity on ${a.host} requires validation against source events and authorization context.`,evidence_quotes:[{ref:a.evidence[0].ref,quote:a.evidence[0].summary}],recommended_checks:['review-source-events',...(a.event_type==='account_change'?['validate-change-approval']:['review-related-logons']),'escalate-for-review']};
}
export function exampleAdapters(overrides={}) {
  return {reputation:async(type,value)=>({type,value,status:'available',provider:'Synthetic fixture',...(type==='hash'?{malicious:0,total:10}:{abuse_score:10})}),analyze:async(a)=>exampleAssessment(a),addAlert:async()=>101,escalate:async()=>201,notify:async()=> 'example.001',...overrides};
}
