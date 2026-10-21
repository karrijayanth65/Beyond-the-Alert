import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {validateAlert} from '../src/validation.mjs';
export function workflow() {
  const node=(id,name,type,typeVersion,position,parameters,extra={})=>({id,name,type,typeVersion,position,parameters,...extra});
  const code=`const validateAlert = ${validateAlert.toString()};\nreturn $input.all().map(item => { try { return {json:{valid:true,alert:validateAlert(item.json.body)}}; } catch { return {json:{valid:false,error:'invalid_alert',review_required:true}}; } });`;
  const nodes=[
    node('ingress','Alert intake','n8n-nodes-base.webhook',2.1,[0,0],{httpMethod:'POST',path:'jayanth-alerts',authentication:'headerAuth',responseMode:'responseNode',options:{}} ,{webhookId:'jayanth-alerts-v1'}),
    node('validate','Validate evidence','n8n-nodes-base.code',2,[240,0],{jsCode:code}),
    node('valid','Valid input','n8n-nodes-base.if',2.2,[480,0],{conditions:{options:{caseSensitive:true,leftValue:'',typeValidation:'strict',version:2},conditions:[{id:'input-valid',leftValue:'={{ $json.valid }}',rightValue:true,operator:{type:'boolean',operation:'true',singleValue:true}}],combinator:'and'},options:{}}),
    node('worker','Process investigation','n8n-nodes-base.httpRequest',4.2,[720,-100],{method:'POST',url:'https://worker.example.invalid/v1/triage',authentication:'genericCredentialType',genericAuthType:'httpHeaderAuth',sendBody:true,specifyBody:'json',jsonBody:'={{ JSON.stringify($json.alert) }}',options:{timeout:30000,redirect:{redirect:{followRedirects:false}},response:{response:{fullResponse:true}}}},{onError:'continueErrorOutput'}),
    node('respond','Return receipt','n8n-nodes-base.respondToWebhook',1.4,[1200,-100],{respondWith:'json',responseBody:'={{ $json.body ?? $json }}',options:{responseCode:'={{ $json.statusCode ?? 202 }}'}}),
    node('reject','Reject invalid input','n8n-nodes-base.respondToWebhook',1.4,[720,180],{respondWith:'json',responseBody:'={{ {error:"invalid_alert",review_required:true} }}',options:{responseCode:400}}),
    node('failure','Expose processing failure','n8n-nodes-base.code',2,[960,100],{jsCode:'return [{json:{statusCode:202,body:{status:"needs_review",error:"worker_unavailable",review_required:true}}}];'})
  ];
  const edge=(name,index=0)=>({node:name,type:'main',index});
  return {name:'Beyond the Alert',active:false,nodes,connections:{'Alert intake':{main:[[edge('Validate evidence')]]},'Validate evidence':{main:[[edge('Valid input')]]},'Valid input':{main:[[edge('Process investigation')],[edge('Reject invalid input')]]},'Process investigation':{main:[[edge('Return receipt')],[edge('Expose processing failure')]]},'Expose processing failure':{main:[[edge('Return receipt')]]}},settings:{executionOrder:'v1',saveDataErrorExecution:'all',saveDataSuccessExecution:'none',saveExecutionProgress:false},pinData:{},tags:[]};
}
export async function build(){await mkdir('workflows',{recursive:true});await writeFile('workflows/jayanth.json',JSON.stringify(workflow(),null,2)+'\n');}
if(process.argv[1]&&fileURLToPath(import.meta.url)===resolve(process.argv[1])){await build();console.log('Generated Beyond the Alert workflow from maintained validation source.');}
