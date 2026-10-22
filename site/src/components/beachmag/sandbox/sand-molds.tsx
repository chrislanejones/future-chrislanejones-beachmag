import {DoubleSide} from 'three';
import type {CastleKind} from './sandcastle-model';

export function moldHeight(kind:CastleKind){return kind==='tower'?1.3:kind==='wall'?.78:1}

/** Open molds point upward; the placement animation flips them onto the sand. */
export function SandMold({kind}:{kind:CastleKind}){
 if(kind==='wall')return <group>
  {/* A long, narrow wall mold, with three crenellations in its closed end. */}
  {[-1,1].map(side=><group key={side}>
   <mesh position={[0,0,side*.23]} castShadow><boxGeometry args={[1.18,.78,.045]}/><meshStandardMaterial color="#c98b32" roughness={.4}/></mesh>
   <mesh position={[side*.57,0,0]} castShadow><boxGeometry args={[.045,.78,.5]}/><meshStandardMaterial color="#bf7928" roughness={.4}/></mesh>
   <mesh position={[0,.4,side*.25]} castShadow><boxGeometry args={[1.24,.055,.065]}/><meshStandardMaterial color="#edb857" roughness={.4}/></mesh>
  </group>)}
  <mesh position={[0,-.39,0]} castShadow><boxGeometry args={[1.18,.045,.5]}/><meshStandardMaterial color="#be7926"/></mesh>
  {[-.39,0,.39].map(x=><mesh key={x} position={[x,-.5,0]} castShadow><boxGeometry args={[.25,.24,.5]}/><meshStandardMaterial color="#d59a42" roughness={.4}/></mesh>)}
  <mesh position={[0,.43,0]} scale={[1,.6,1]}><torusGeometry args={[.4,.025,8,24,Math.PI]}/><meshStandardMaterial color="#e3c99b" roughness={.6}/></mesh>
 </group>;
 if(kind==='tower')return <group>
  <mesh castShadow><cylinderGeometry args={[.47,.36,1.3,32,1,true]}/><meshStandardMaterial color="#397e84" roughness={.4} side={DoubleSide}/></mesh>
  <mesh position={[0,-.65,0]} castShadow><cylinderGeometry args={[.4,.4,.07,32]}/><meshStandardMaterial color="#326a70"/></mesh>
  <mesh position={[0,.65,0]} rotation={[Math.PI/2,0,0]} castShadow><torusGeometry args={[.47,.045,8,32]}/><meshStandardMaterial color="#77b3b3"/></mesh>
  <mesh position={[0,-.64,0]} rotation={[Math.PI/2,0,0]} castShadow><torusGeometry args={[.38,.04,8,32]}/><meshStandardMaterial color="#77b3b3"/></mesh>
  {Array.from({length:7},(_,i)=>{const angle=i*Math.PI*2/7;return <mesh key={i} position={[Math.cos(angle)*.32,-.79,Math.sin(angle)*.32]} rotation={[0,-angle,0]} castShadow><boxGeometry args={[.21,.27,.19]}/><meshStandardMaterial color="#478e91" roughness={.45}/></mesh>})}
  <mesh position={[0,.67,0]}><torusGeometry args={[.45,.025,8,24,Math.PI]}/><meshStandardMaterial color="#d9bf88" roughness={.5}/></mesh>
 </group>;
 return <group>
  <mesh castShadow><cylinderGeometry args={[.55,.42,1,32,1,true]}/><meshStandardMaterial color="#cc5b3f" side={DoubleSide} roughness={.45}/></mesh>
  <mesh position={[0,-.5,0]}><cylinderGeometry args={[.42,.42,.05,32]}/><meshStandardMaterial color="#ad422e"/></mesh>
  <mesh position={[0,.5,0]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[.55,.045,8,32]}/><meshStandardMaterial color="#f28d65"/></mesh>
  {[0,.25,-.25].map(y=><mesh key={y} position={[0,y,0]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[.485+y*.13,.018,6,32]}/><meshStandardMaterial color="#e57550"/></mesh>)}
  <mesh position={[0,.52,0]}><torusGeometry args={[.5,.025,8,24,Math.PI]}/><meshStandardMaterial color="#d9bf88" metalness={.2} roughness={.5}/></mesh>
 </group>
}
