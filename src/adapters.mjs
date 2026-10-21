import {httpsBase,requestJson} from './transport.mjs';
import {modelRequest} from './analysis.mjs';
const need=(env,name)=>{const s=env[name];if(!s||s==='SET_ME')throw new Error(`CONFIG: ${name} missing`);return s;};
export function createAdapters(env=process.env,transport=requestJson) {
  return {
    async reputation(type,value) {
      if(type==='ip') {
        const url=new URL('https://api.abuseipdb.com/api/v2/check'); url.searchParams.set('ipAddress',value);url.searchParams.set('maxAgeInDays','30');
        const r=await transport(url.href,{headers:{Key:need(env,'ABUSEIPDB_KEY')}});
        if(r.data?.ipAddress!==value||!Number.isInteger(r.data?.abuseConfidenceScore)||r.data.abuseConfidenceScore<0||r.data.abuseConfidenceScore>100)throw new Error('ENRICHMENT: IP identity or score');
        return {provider:'AbuseIPDB',type,value,status:'available',abuse_score:r.data.abuseConfidenceScore};
      }
      const r=await transport(`https://www.virustotal.com/api/v3/files/${value}`,{headers:{'x-apikey':need(env,'VIRUSTOTAL_KEY')}});
      const stats=r.data?.attributes?.last_analysis_stats;
      if(r.data?.id?.toLowerCase()!==value||!stats||!Object.values(stats).every(n=>Number.isInteger(n)&&n>=0)||!Number.isInteger(stats.malicious))throw new Error('ENRICHMENT: hash identity or statistics');
      return {provider:'VirusTotal',type,value,status:'available',malicious:stats.malicious,total:Object.values(stats).reduce((s,n)=>s+n,0)};
    },
    async analyze(alert,enrichment) {
      const r=await transport('https://api.openai.com/v1/chat/completions',{method:'POST',headers:{Authorization:`Bearer ${need(env,'MODEL_API_KEY')}`},body:modelRequest(alert,enrichment,env.MODEL_NAME||'gpt-4.1-mini')});
      const choice=r.choices?.[0]; if(choice?.finish_reason!=='stop'||typeof choice.message?.content!=='string')throw new Error('MODEL: incomplete response');
      return choice.message.content;
    },
    async addAlert(body) {
      const base=httpsBase(need(env,'IRIS_ORIGIN'));
      const r=await transport(`${base}/alerts/add`,{method:'POST',headers:{Authorization:`Bearer ${need(env,'IRIS_API_KEY')}`},body});
      if(r.status!=='success'||!Number.isInteger(r.data?.alert_id)||r.data.alert_id<1)throw new Error('DELIVERY: invalid IRIS alert response');
      return r.data.alert_id;
    },
    async escalate(alertId) {
      const base=httpsBase(need(env,'IRIS_ORIGIN'));
      const r=await transport(`${base}/alerts/escalate/${alertId}`,{method:'POST',headers:{Authorization:`Bearer ${need(env,'IRIS_API_KEY')}`},body:{}});
      const id=r.data?.case_id;
      if(r.status!=='success'||!Number.isInteger(id)||id<1)throw new Error('DELIVERY: invalid IRIS escalation response');
      return id;
    },
    async notify(payload) {
      const r=await transport('https://slack.com/api/chat.postMessage',{method:'POST',headers:{Authorization:`Bearer ${need(env,'SLACK_BOT_TOKEN')}`},body:{...payload,channel:need(env,'SLACK_CHANNEL_ID')}});
      if(r.ok!==true||typeof r.ts!=='string')throw new Error('DELIVERY: Slack rejected request');
      return r.ts;
    }
  };
}
