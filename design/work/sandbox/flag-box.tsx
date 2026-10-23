import {useMemo} from 'react';
import {DoubleSide,Shape} from 'three';

/** A single physical supply: the crate stays after the fifth flag is taken. */
export function FlagBox({available,dark,onPick}:{available:number;dark:boolean;onPick:()=>void}){
 const flag=useMemo(()=>{const s=new Shape();s.moveTo(0,0);s.lineTo(.31,-.1);s.lineTo(0,-.2);s.closePath();return s},[]);
 const wood=dark?'#98744d':'#bf935c',edge=dark?'#765b3c':'#97703e';
 return <group position={[-5.8,0,4.3]} rotation={[0,-.12,0]}
  onPointerDown={e=>e.stopPropagation()} onPointerUp={e=>e.stopPropagation()}
  onPointerMove={e=>e.stopPropagation()}
  onClick={e=>{e.stopPropagation();onPick()}}>
  <mesh position={[0,.055,0]} receiveShadow castShadow><boxGeometry args={[1.3,.1,.65]}/><meshStandardMaterial color={edge} roughness={1}/></mesh>
  {/* Separate slats leave the top visibly open. */}
  {[-1,1].map(side=><group key={side}>
   {[.17,.34].map(y=><mesh key={y} position={[0,y,side*.32]} castShadow receiveShadow><boxGeometry args={[1.32,.145,.065]}/><meshStandardMaterial color={wood} roughness={.95}/></mesh>)}
   <mesh position={[side*.63,.25,0]} castShadow receiveShadow><boxGeometry args={[.065,.4,.65]}/><meshStandardMaterial color={wood} roughness={.95}/></mesh>
  </group>)}
  {[-.55,.55].flatMap(x=>[-.25,.25].map(z=><mesh key={x+','+z} position={[x,.27,z]} castShadow><boxGeometry args={[.09,.44,.08]}/><meshStandardMaterial color={edge} roughness={1}/></mesh>))}
  {/* A simple flag emblem is stamped on the front of the box. */}
  <group position={[-.09,.28,.357]}>
   <mesh position={[0,-.045,0]}><boxGeometry args={[.016,.17,.006]}/><meshStandardMaterial color="#533e28"/></mesh>
   <mesh position={[0,.04,.004]} scale={.4}><shapeGeometry args={[flag]}/><meshStandardMaterial color="#763f2b" side={DoubleSide}/></mesh>
  </group>
  {Array.from({length:available},(_,i)=><group key={i} position={[-.47+i*.22,.105,i%2?.11:-.09]} rotation={[0,-.12+i*.08,(2-i)*.045]}>
   <mesh position={[0,.51,0]} castShadow><cylinderGeometry args={[.018,.018,1.02,8]}/><meshStandardMaterial color="#765235" roughness={.8}/></mesh>
   <mesh position={[.018,1.02,0]} castShadow><shapeGeometry args={[flag]}/><meshStandardMaterial color="#d3684b" side={DoubleSide} roughness={.8}/></mesh>
  </group>)}
  {/* Generous tap target, including the empty crate, without building beneath it. */}
  <mesh position={[.05,.58,0]}><boxGeometry args={[1.5,1.2,.8]}/><meshBasicMaterial transparent opacity={0} depthWrite={false}/></mesh>
 </group>
}
