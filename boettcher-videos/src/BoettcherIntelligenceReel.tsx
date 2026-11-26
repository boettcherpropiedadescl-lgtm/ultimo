import type React from 'react';
import type {CalculateMetadataFunction} from 'remotion';
import {AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

export type ReelChapter={
  name:string;start:number;end:number;visual:string;movement?:string;
  headline?:string;items?:string[];example?:{months:number;monthlyRent:number};
};
export type IntelligenceProps={
  topic?:string;
  theme?:string;
  duration:number;
  style:string;
  chapters:ReelChapter[];
  audioName?:string;
  headline?:string;
  brand?:string;
  script?:string;
};
export const intelligenceFps=30;

export const defaultIntelligenceProps:IntelligenceProps={
  theme:'Arriendo protegido',duration:45,style:'finance-counter',
  chapters:[
    {name:'Gancho',start:0,end:5.4,headline:'¿Y si dejan de pagarte?',visual:'Arriendo pendiente'},
    {name:'Consecuencia',start:5.4,end:15.3,visual:'Revisa el estado del arriendo'},
    {name:'Costo',start:15.3,end:23.4,visual:'Ejemplo de renta no percibida',example:{months:3,monthlyRent:500000}},
    {name:'Solución',start:23.4,end:35.1,visual:'Administración con respaldo',items:['Evaluación de interesados','Control de pagos','Cobertura según plan contratado']},
    {name:'Cierre',start:35.1,end:45,visual:'Conoce nuestros planes'},
  ],
  brand:'BOETTCHER PROPIEDADES',
};

export const calculateIntelligenceMetadata:CalculateMetadataFunction<IntelligenceProps>=({props})=>{
  const durationInFrames=Math.round(props.duration*intelligenceFps);
  if(!Number.isSafeInteger(durationInFrames)||durationInFrames<1) {
    throw new Error('La duración del storyboard debe ser positiva.');
  }
  if(!Array.isArray(props.chapters)||props.chapters.length===0) {
    throw new Error('El storyboard requiere capítulos.');
  }
  let previousEnd=0;
  for(const chapter of props.chapters) {
    if(!chapter||typeof chapter.name!=='string'||!chapter.name.trim()||typeof chapter.visual!=='string'||
       !Number.isFinite(chapter.start)||!Number.isFinite(chapter.end)||
       Math.abs(chapter.start-previousEnd)>0.001||
       Math.round(chapter.end*intelligenceFps)<=Math.round(chapter.start*intelligenceFps)) {
      throw new Error('Cada capítulo debe tener un nombre, un recurso visual y tiempos consecutivos.');
    }
    const example=chapter.example;
    if(example&&(!Number.isInteger(example.months)||example.months<1||example.months>12||
       !Number.isSafeInteger(example.monthlyRent*example.months)||example.monthlyRent<=0)) {
      throw new Error('El ejemplo debe tener de 1 a 12 meses y un arriendo mensual positivo.');
    }
    previousEnd=chapter.end;
  }
  if(Math.abs(previousEnd-props.duration)>0.001) {
    throw new Error('El último capítulo debe coincidir con la duración del storyboard.');
  }
  if(props.audioName&&!/^[a-z\d_-][a-z\d._-]*\.(wav|mp3)$/i.test(props.audioName)) {
    throw new Error('Usa el nombre de un archivo WAV o MP3 dentro de public/voice.');
  }
  return {durationInFrames};
};

const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
const range=(f:number,a:number,b:number,from=0,to=1)=>interpolate(f,[a,b],[from,to],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
const money=(n:number)=>'$'+Math.round(n).toLocaleString('es-CL');
const PAPER='#fffbf2',GOLD='#f5c677';

const Window:React.FC<{progress:number}> = ({progress})=> {
 const fly=range(progress,0,0.5,180,0);
 return <div style={{width:560,height:440,position:'relative',transform:`translateY(${fly}px) rotate(${Math.sin(progress*3)*2}deg)`,borderRadius:38,background:'#1e304b',border:'5px solid #51627d',boxShadow:'0 32px 70px #0006'}}>
 <div style={{display:'flex',gap:12,padding:25}}>{['#ff896c','#e1c166','#8fd0a0'].map(color=><div key={color} style={{width:19,height:19,borderRadius:'50%',background:color}}/>)}</div>
 <div style={{height:5,background:'#526680'}}/>
 <div style={{padding:40,display:'grid',gap:26}}>{['ARRIENDO','FECHA DE PAGO','ESTADO'].map((x,i)=><div key={x} style={{background:'#293c55',borderRadius:14,padding:20,color:PAPER,fontWeight:800,fontSize:26,display:'flex',justifyContent:'space-between',transform:`translateX(${Math.sin(progress*7+i)*8}px)`}}><span>{x}</span><span style={{color:i===2?'#ff916a':GOLD}}>{['MENSUAL','POR REVISAR','PENDIENTE'][i]}</span></div>)}</div>
 </div>
};
const Person:React.FC<{progress:number;happy?:boolean}> = ({progress,happy})=>{
 const head=range(progress,0,0.45,-70,0);
 const arm=Math.sin(progress*10)*14;
 return <div style={{position:'relative',width:420,height:580,transform:`translateY(${head}px)`}}>
 <div style={{position:'absolute',width:235,height:268,left:90,top:230,background:happy?'#567e83':'#e8a074',borderRadius:'70px 70px 20px 20px'}}/>
 <div style={{position:'absolute',width:210,height:210,borderRadius:'48%',left:102,top:60,background:'#eab38d',border:'9px solid #bd785c'}}/>
 <div style={{position:'absolute',left:155,top:140,fontSize:60,color:'#2d282b',transform:`translateY(${Math.sin(progress*5)*5}px)`}}>{happy?'◡':'︵'}</div>
 <div style={{position:'absolute',left:15,top:275,width:120,height:30,borderRadius:30,background:'#dba07f',transformOrigin:'right center',transform:`rotate(${arm-22}deg)`}}/>
 <div style={{position:'absolute',right:5,top:270,width:125,height:30,borderRadius:30,background:'#dba07f',transformOrigin:'left center',transform:`rotate(${-arm+22}deg)`}}/>
 <div style={{position:'absolute',top:450,left:140,width:140,height:100,background:'#23364c',borderRadius:18,transform:`rotate(${Math.sin(progress*10)*6}deg)`}}><div style={{color:GOLD,fontSize:62,textAlign:'center'}}>▣</div></div>
 </div>;
};
const Check:React.FC<{text:string;progress:number;index:number}> = ({text,progress,index})=>{
 const t=range(progress,index*0.21,index*0.21+0.22,0,1);
 return <div style={{opacity:t,transform:`translateX(${(1-t)*120}px)`,background:'#152d42',border:'2px solid #7c9baa',borderRadius:20,padding:'20px 24px',display:'flex',alignItems:'center',gap:24,fontSize:33,fontWeight:800}}><span style={{color:'#91dfbc'}}>✓</span>{text}</div>;
};
const Stage:React.FC<{
  chapter: ReelChapter;
  local: number;
  sceneFrame: number;
  fps: number;
  title: string;
}> = ({chapter,local,sceneFrame,fps,title}) => {
  const kind=chapter.name.toLowerCase();
  const hook=kind==='gancho';
  const consequence=kind==='consecuencia';
  const ending=kind==='cierre';
  const reveal=spring({frame:sceneFrame,fps,config:{damping:19,stiffness:120}});
  const example=chapter.example;
  const items=chapter.items??['Evaluación','Seguimiento','Respaldo según el plan'];
  const showCards=!hook&&!consequence&&!ending&&!example;

  return <>
    <h1 style={{position:'absolute',top:254,left:96,right:96,margin:0,
      fontSize:title.length>100?48:title.length>62?57:73,fontWeight:900,letterSpacing:-1.5,
      lineHeight:1.08,overflowWrap:'anywhere',opacity:.3+.7*reveal,
      transform:`translateY(${(1-reveal)*24}px)`}}>
      {title}
    </h1>
    <div style={{position:'absolute',top:530,left:96,width:176,height:7,
      background:GOLD,transform:`scaleX(${reveal})`,transformOrigin:'left'}}/>
    {hook&&
      <div style={{position:'absolute',left:250,top:690,perspective:900,
        transform:`translateY(${(1-reveal)*54}px) scale(${.94+local*.1})`}}>
        <Window progress={local}/>
      </div>
    }
    {consequence&&<>
      <div style={{position:'absolute',top:600,left:145}}><Person progress={local}/></div>
      <div style={{position:'absolute',top:820,left:565,right:100,display:'grid',gap:18}}>
        {(chapter.items??['Rentas pendientes']).slice(0,3).map((item,index)=>
          <div key={index} style={{
            background:'#893e3c',borderRadius:26,padding:'24px 26px',fontSize:34,fontWeight:900,
            opacity:range(local,index*.2,index*.2+.22),transform:`translateY(${(1-reveal)*58}px)`,
          }}>{item}</div>
        )}
      </div>
    </>}
    {example&&!ending&&<>
      <div style={{position:'absolute',top:680,left:96,right:96,textAlign:'center',
        fontSize:112,fontWeight:950,color:GOLD,letterSpacing:-3}}>
        {money(example.monthlyRent*Math.floor(range(local,0,.83,0,example.months)))}
      </div>
      <div style={{position:'absolute',top:885,left:110,right:110,display:'flex',
        flexWrap:'wrap',gap:12,justifyContent:'center'}}>
        {Array.from({length:example.months},(_,index)=>{
          const paid=local>=(index+1)*.83/example.months;
          return <div key={index} style={{
            width:example.months>6?116:137,height:113,borderRadius:16,
            display:'grid',placeItems:'center',fontSize:27,fontWeight:800,
            background:paid?GOLD:'#30465e',color:paid?'#101929':PAPER,
            transform:`translateY(${(1-range(local,index*.03,index*.03+.13))*46}px)`,
          }}>Mes {index+1}</div>;
        })}
      </div>
      <div style={{position:'absolute',top:1170,left:96,right:96,textAlign:'center',fontSize:36}}>
        Ejemplo · {money(example.monthlyRent)} al mes
      </div>
    </>}
    {showCards&&
      <div style={{position:'absolute',top:645,left:96,right:96,display:'grid',gap:25}}>
        {items.slice(0,4).map((item,index)=>
          <Check key={index} text={item} index={index} progress={local}/>)}
      </div>
    }
    {ending&&
      <div style={{position:'absolute',top:570,left:330}}><Person progress={local} happy/></div>
    }
    <div style={{position:'absolute',bottom:416,left:96,right:96,fontSize:39,fontWeight:750,
      lineHeight:1.12,overflowWrap:'anywhere',opacity:.92}}>
      {chapter.visual}
    </div>
  </>;
};

export const BoettcherIntelligenceReel:React.FC<IntelligenceProps>=(props)=>{
  const frame=useCurrentFrame();
  const {fps}=useVideoConfig();
  const chapter=props.chapters.find((item)=>frame>=Math.round(item.start*fps)&&frame<Math.round(item.end*fps))
    ?? props.chapters[props.chapters.length-1];
  const start=Math.round(chapter.start*fps);
  const end=Math.round(chapter.end*fps);
  const local=clamp((frame-start)/Math.max(1,end-start),0,1);
  const title=chapter.headline??(chapter===props.chapters[0]
    ? (props.headline??props.topic??props.theme??chapter.name)
    : chapter.name);
  const accent=props.style==='finance-counter'?'#765023':'#1a5a62';

  return <AbsoluteFill style={{background:'#0d1929',color:PAPER,fontFamily:'Arial,sans-serif',overflow:'hidden'}}>
    <AbsoluteFill style={{background:`radial-gradient(ellipse at ${44+Math.sin(frame/fps*.5)*13}% 46%, ${accent}, transparent 57%)`}}/>
    <Stage chapter={chapter} local={local} sceneFrame={frame-start} fps={fps} title={title}/>
    <div style={{position:'absolute',bottom:343,left:96,right:96,fontSize:23,
      letterSpacing:3,fontWeight:900,color:GOLD}}>
      {props.brand??'BOETTCHER PROPIEDADES'}
    </div>
    {props.audioName?<Audio src={staticFile(`voice/${props.audioName}`)}/>:null}
  </AbsoluteFill>;
};
