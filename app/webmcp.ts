'use client';
import {useEffect,useRef} from 'react';
import {flushSync} from 'react-dom';

type Tool={name:string;description:string;inputSchema:object;annotations:{readOnlyHint:boolean;untrustedContentHint:boolean};execute(input:unknown):unknown};
type ModelContext={registerTool(tool:Tool,options:{signal:AbortSignal}):void|Promise<void>};
export function useLidTools(angle:number,setAngle:(value:number)=>void){
  const current=useRef(angle);current.current=angle;
  useEffect(()=>{
    const context=(document as Document & {modelContext?:ModelContext}).modelContext;
    if(!context?.registerTool)return;
    const lifecycle=new AbortController();
    const tools:Tool[]=[{
      name:'set_lid_angle',description:'Open or close the MacBook lid by setting its angle from 0 (closed) to 135 degrees.',
      inputSchema:{type:'object',properties:{angle:{type:'integer',minimum:0,maximum:135}},required:['angle'],additionalProperties:false},
      annotations:{readOnlyHint:false,untrustedContentHint:false},
      execute(input){const value=input as {angle?:unknown};if(!value||typeof value.angle!=='number'||!Number.isInteger(value.angle)||value.angle<0||value.angle>135)throw new Error('angle must be an integer from 0 to 135');flushSync(()=>setAngle(value.angle as number));return {angle:current.current};}
    },{
      name:'get_lid_angle',description:'Read the current requested MacBook lid angle.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute(){return {angle:current.current};}
    }];
    for(const tool of tools){try{void Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{})}catch{/* The viewer also works in browsers without WebMCP. */}}
    return()=>lifecycle.abort();
  },[setAngle]);
}
