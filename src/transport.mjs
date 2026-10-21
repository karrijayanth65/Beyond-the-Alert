import {setTimeout as sleep} from 'node:timers/promises';
export function httpsBase(value) {
  const u=new URL(value);
  if(u.protocol!=='https:'||u.username||u.password||u.search||u.hash||u.pathname!=='/') throw new Error('CONFIG: HTTPS origin required');
  return u.origin;
}
export async function requestJson(url,{method='GET',headers={},body,timeoutMs=5000,maxBytes=262144,fetchImpl=fetch,retries=2}={}) {
  if(new URL(url).protocol!=='https:') throw new Error('TRANSPORT: TLS required');
  const attempts=method==='GET'?Math.min(3,Math.max(1,retries+1)):1;
  for(let attempt=0;attempt<attempts;attempt++) {
    const controller=new AbortController(); const timer=setTimeout(()=>controller.abort(),timeoutMs);
    try {
      const response=await fetchImpl(url,{method,headers:{Accept:'application/json',...(body?{'Content-Type':'application/json'}:{}),...headers},body:body?JSON.stringify(body):undefined,signal:controller.signal,redirect:'error'});
      if([429,502,503,504].includes(response.status)&&attempt+1<attempts) { await response.body?.cancel(); clearTimeout(timer); await sleep(50*(attempt+1)); continue; }
      if(!response.ok) { await response.body?.cancel(); throw new Error(`TRANSPORT: HTTP ${response.status}`); }
      let size=0; const chunks=[];
      if(response.body) for await(const chunk of response.body) { size+=chunk.byteLength; if(size>maxBytes) { controller.abort(); throw new Error('TRANSPORT: response bound'); } chunks.push(Buffer.from(chunk)); }
      return JSON.parse(Buffer.concat(chunks).toString('utf8'));
    } catch(error) {
      // Writes are never retried: a timeout can happen after the remote write succeeded.
      if(error.name==='AbortError') throw new Error('TRANSPORT: timeout');
      if(error.message.startsWith('TRANSPORT:')||error instanceof SyntaxError) throw error;
      throw new Error('TRANSPORT: connection failure');
    } finally { clearTimeout(timer); }
  }
}
