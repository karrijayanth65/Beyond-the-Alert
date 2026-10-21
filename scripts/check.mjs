import {readdir,readFile,writeFile,mkdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {resolve,dirname,relative} from 'node:path';
import {createHash} from 'node:crypto';
import {workflow} from './build.mjs';
import {generateExamples,renderExample} from './demo.mjs';
async function walk(p='.') { const list=[];for(const e of await readdir(p,{withFileTypes:true})){if(['.git','.state','node_modules'].includes(e.name))continue;const q=resolve(p,e.name);if(e.isDirectory())list.push(...await walk(q));else list.push(q);}return list; }
const files=await walk(),root=resolve('.'),checks=[];
const check=(name,pass)=>{checks.push({name,pass});if(!pass)throw Error('CHECK FAILED: '+name);};
for(const path of files.filter(p=>p.endsWith('.mjs'))){const r=spawnSync(process.execPath,['--check',path],{encoding:'utf8'});check('syntax '+relative(root,path),r.status===0);}
check('workflow matches maintained source',await readFile('workflows/jayanth.json','utf8')===JSON.stringify(workflow(),null,2)+'\n');
const artifactManifest=JSON.parse(await readFile('assets/lab/provenance.json','utf8'));
check('fourteen supplied main artifacts',artifactManifest.items.length===14);
for(const item of artifactManifest.items)check('artifact integrity '+item.artifact,createHash('sha256').update(await readFile(item.path)).digest('hex')===item.sha256);
for(const {type,input,result} of await generateExamples({write:false})){
 check('input reproduction '+type,await readFile(`examples/inputs/${type}.json`,'utf8')===JSON.stringify(input,null,2)+'\n');
 check('output reproduction '+type,await readFile(`examples/outputs/${type}.json`,'utf8')===JSON.stringify(result,null,2)+'\n');
 check('HTML reproduction '+type,await readFile(`examples/outputs/${type}.html`,'utf8')===renderExample(result));
}
const exact=new Set(files.map(p=>relative(root,p).replaceAll('\\','/')));
for(const p of files.filter(p=>/\.(md|mjs|json|yml|spl|html|svg)$/.test(p))){
 const body=await readFile(p,'utf8');
 // Split patterns so the scanner does not match its own source.
 check('identity scan '+relative(root,p),!new RegExp(['C-And'+'r3ws','Christopher '+'Andrews','lara-soc'+'-automation'].join('|'),'i').test(body));
 check('credential scan '+relative(root,p),!/(?:sk-[A-Za-z0-9]{24,}|ghp_[A-Za-z0-9]{30,}|xoxb-\d{10,}-)/.test(body));
 if(p.endsWith('.md'))for(const m of body.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)){
  const target=m[1].split('#')[0];if(!target||/^(https?:|mailto:)/.test(target))continue;
  const dest=relative(root,resolve(dirname(p),decodeURIComponent(target))).replaceAll('\\','/');
  check('local link '+dest,exact.has(dest)||files.some(f=>relative(root,f).replaceAll('\\','/').startsWith(dest+'/')));
 }
}
await mkdir('reports',{recursive:true});
await writeFile('reports/repository-checks.json',JSON.stringify({checked_at:new Date().toISOString(),result:'passed',count:checks.length,scope:'Syntax, deterministic generation, exact-case local Markdown targets, bounded identity and credential pattern scan',checks},null,2)+'\n');
console.log(`${checks.length} repository checks passed.`);
