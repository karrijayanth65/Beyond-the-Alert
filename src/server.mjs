import {createServer} from 'node:http';
import {timingSafeEqual} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {FileStore} from './state.mjs';
import {createAdapters} from './adapters.mjs';
import {processAlert} from './pipeline.mjs';
export function createWorker({token,store,adapters,delivery='prepare',customerId=1}) {
  if(typeof token!=='string'||token.length<32||token==='SET_ME')throw new Error('CONFIG: worker token must contain at least 32 characters');
  const reply=(res,status,data)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
  const server=createServer(async(req,res)=>{
    if(req.method!=='POST'||req.url!=='/v1/triage')return reply(res,404,{error:'not_found'});
    const supplied=Buffer.from(String(req.headers['x-jayanth-token']||'')),expected=Buffer.from(token);
    if(supplied.length!==expected.length||!timingSafeEqual(supplied,expected))return reply(res,401,{error:'unauthorized'});
    if(!/^application\/json(?:;|$)/i.test(String(req.headers['content-type'])))return reply(res,415,{error:'application_json_required'});
    let size=0;const chunks=[];
    try{
      for await(const chunk of req){size+=chunk.length;if(size>65536){reply(res,413,{error:'request_too_large'});req.destroy();return;}chunks.push(chunk);}
      let input;try{input=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{return reply(res,400,{error:'invalid_json'});}
      const result=await processAlert(input,{store,adapters,delivery,customerId});
      // The response is a receipt. Telemetry stays in the protected worker store.
      return reply(res,result.status==='needs_review'?202:200,{alert_id:input.alert_id,status:result.status,duplicate:!!result.duplicate,iris_case_id:result.iris_case_id??null,review_required:true});
    }catch(error){return reply(res,String(error.message).startsWith('INPUT:')?400:503,{error:String(error.message).startsWith('INPUT:')?'invalid_alert':'processing_unavailable',review_required:true});}
  });
  server.requestTimeout=15000;server.headersTimeout=10000;server.maxConnections=32;return server;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const env=process.env;
  const server=createWorker({token:env.JAYANTH_WORKER_TOKEN,store:new FileStore(env.JAYANTH_STATE_DIR||'.state'),adapters:createAdapters(),delivery:env.JAYANTH_DELIVERY||'prepare',customerId:Number(env.IRIS_CUSTOMER_ID||1)});
  server.listen(Number(env.PORT||8080),'127.0.0.1',()=>console.log('Automation worker listening on loopback; place behind trusted HTTPS before n8n delivery.'));
}
