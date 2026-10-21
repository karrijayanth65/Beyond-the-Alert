// Shared with the generated n8n validation node. No runtime dependencies.
export function validateAlert(input) {
  const fail = message => { throw new Error(`INPUT: ${message}`); };
  if (!input || Array.isArray(input) || typeof input !== 'object') fail('expected object');
  const allowed = ['schema_version','source','alert_id','event_type','observed_at','host','subject','initiating_user','source_ip','sha256','source_link','evidence','details','synthetic'];
  if (Object.keys(input).some(k => !allowed.includes(k))) fail('unexpected field');
  const types = ['failed_logins','account_change','file_hash','powershell','network_scan'];
  if (input.schema_version !== 1 || input.source !== 'splunk' || !types.includes(input.event_type)) fail('schema source or event_type');
  for (const name of ['alert_id','host']) if (typeof input[name] !== 'string' || !/^[A-Za-z0-9_.:-]{1,128}$/.test(input[name])) fail(name);
  if (typeof input.observed_at !== 'string' || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?(?:Z|[+-]\d\d:\d\d)$/.test(input.observed_at) || !Number.isFinite(Date.parse(input.observed_at))) fail('timestamp with timezone required');
  const day = input.observed_at.slice(0,10), parts=day.split('-').map(Number);
  if (new Date(Date.UTC(parts[0],parts[1]-1,parts[2])).toISOString().slice(0,10)!==day) fail('calendar date');
  const clock=input.observed_at.slice(11,19).split(':').map(Number);
  if(clock[0]>23||clock[1]>59||clock[2]>59)fail('clock time');
  for (const name of ['subject','initiating_user']) if (input[name] != null && (typeof input[name]!=='string' || input[name].length>128 || /[\r\n\x00-\x1f]/.test(input[name]))) fail(name);
  if (input.source_ip != null && !/^(?:\d{1,3}\.){3}\d{1,3}$/.test(input.source_ip)) fail('IPv4 required');
  if (input.source_ip != null && input.source_ip.split('.').some(p => Number(p)>255 || (p.length>1 && p[0]==='0'))) fail('IPv4 octet');
  if (input.sha256 != null && !/^[a-fA-F0-9]{64}$/.test(input.sha256)) fail('sha256');
  if (input.event_type==='file_hash' && !input.sha256) fail('file hash required');
  if (['failed_logins','network_scan'].includes(input.event_type) && !input.source_ip) fail('source IP required');
  if (input.event_type==='account_change' && (!input.subject || !input.initiating_user)) fail('account identities required');
  try { const u = new URL(input.source_link); if(u.protocol!=='https:' || u.username || u.password || input.source_link.length>2048) fail('source_link'); } catch { fail('HTTPS source link required'); }
  if (!Array.isArray(input.evidence) || input.evidence.length<1 || input.evidence.length>30) fail('evidence length');
  const refs=new Set();
  for(const e of input.evidence) {
    if(!e || typeof e!=='object' || Object.keys(e).some(k=>!['ref','event_id','record_id','summary'].includes(k))) fail('evidence shape');
    if(typeof e.ref!=='string' || !/^[A-Za-z0-9_.:-]{1,128}$/.test(e.ref) || refs.has(e.ref)) fail('unique evidence reference');
    refs.add(e.ref);
    if(!Number.isInteger(e.event_id) || e.event_id<1 || typeof e.record_id!=='string' || !/^[A-Za-z0-9_.:-]{1,128}$/.test(e.record_id)) fail('event and record identifiers');
    if(typeof e.summary!=='string' || e.summary.length<1 || e.summary.length>2000 || /[\x00-\x08]/.test(e.summary)) fail('evidence summary');
  }
  if(input.details == null || typeof input.details!=='object' || Array.isArray(input.details)) fail('details object');
  if(JSON.stringify(input.details).length>4000) fail('details bound');
  const expectedEvents={failed_logins:[4625],account_change:[4720,4732],file_hash:[1],powershell:[1,4688],network_scan:[5157]};
  if(input.evidence.some(e=>!expectedEvents[input.event_type].includes(e.event_id)))fail('event does not match scenario');
  if(input.event_type==='failed_logins'&&(!Number.isSafeInteger(input.details.count)||input.details.count<3))fail('failed login threshold');
  if(input.event_type==='network_scan'&&!((Number.isSafeInteger(input.details.unique_ports)&&input.details.unique_ports>=3)||(Number.isSafeInteger(input.details.drops)&&input.details.drops>=5)))fail('scan threshold');
  if(input.synthetic != null && typeof input.synthetic!=='boolean') fail('synthetic flag');
  return JSON.parse(JSON.stringify({...input,sha256:input.sha256?.toLowerCase()}));
}

export function publicIPv4(ip) {
  if(typeof ip!=='string' || !/^(?:\d{1,3}\.){3}\d{1,3}$/.test(ip)) return false;
  const p=ip.split('.').map(Number); if(p.some(n=>n>255) || ip.split('.').some(s=>s.length>1&&s[0]==='0')) return false;
  const [a,b,c]=p;
  return !(a===0||a===10||a===127||a>=224||a===100&&b>=64&&b<=127||a===169&&b===254||a===172&&b>=16&&b<=31||a===192&&((b===0&&(c===0||c===2))||(b===88&&c===99)||b===168)||a===198&&(b===18||b===19||b===51&&c===100)||a===203&&b===0&&c===113);
}
