import {mkdir,readFile,writeFile,rename} from 'node:fs/promises';
import {createHash,randomUUID} from 'node:crypto';
import {join} from 'node:path';
export class FileStore {
  constructor(directory){this.directory=directory;}
  path(key){return join(this.directory,createHash('sha256').update(key).digest('hex')+'.json');}
  async reserve(key,initial) {
    await mkdir(this.directory,{recursive:true,mode:0o700});
    try{await writeFile(this.path(key),JSON.stringify(initial),{flag:'wx',mode:0o600});return {created:true,record:initial};}
    catch(e){if(e.code!=='EEXIST')throw e;return {created:false,record:JSON.parse(await readFile(this.path(key),'utf8'))};}
  }
  async save(key,record){const file=this.path(key),tmp=file+'.'+randomUUID()+'.tmp';await writeFile(tmp,JSON.stringify(record,null,2),{mode:0o600});await rename(tmp,file);}
}
export class MemoryStore {
  constructor(){this.records=new Map();}
  async reserve(key,record){if(this.records.has(key))return {created:false,record:structuredClone(this.records.get(key))};this.records.set(key,structuredClone(record));return {created:true,record};}
  async save(key,record){this.records.set(key,structuredClone(record));}
}
