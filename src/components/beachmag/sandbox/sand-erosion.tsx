import {useEffect,useMemo,useRef,type ReactNode} from 'react';
import {useFrame} from '@react-three/fiber';
import {BufferAttribute,BufferGeometry,Vector3,type Group,type PointsMaterial} from 'three';
import {beachWashAt,erosionAt} from './beach-wash';

/** Collapse at the incoming waterline; grains spread along the receding sand face. */
export function SandErosion({x,z,startedAt,children}:{x:number;z:number;startedAt:number|null;children:ReactNode}){
 const shape=useRef<Group>(null),dust=useRef<Group>(null),material=useRef<PointsMaterial>(null),progress=useRef(0);
 const projected=useMemo(()=>new Vector3(),[]);
 const geometry=useMemo(()=>{const g=new BufferGeometry();g.setAttribute('position',new BufferAttribute(new Float32Array(48*3),3));return g},[]);
 useEffect(()=>()=>geometry.dispose(),[geometry]);
 useFrame(({camera})=>{
  if(!shape.current||!dust.current||!material.current)return;
  if(startedAt===null){progress.current=0;shape.current.scale.set(1,1,1);shape.current.position.set(0,0,0);shape.current.rotation.set(0,0,0);shape.current.visible=true;dust.current.visible=false;return}
  projected.set(x,0,z).project(camera);
  const p=erosionAt(beachWashAt(performance.now()-startedAt).advance,projected.x*.5+.5,projected.y*.5+.5);
  progress.current=Math.max(progress.current,p);const t=progress.current;
  shape.current.scale.set(1+t*.32,Math.max(.001,1-t),1+t*.4);
  shape.current.position.set(-t*.22,-t*.15,t*.18);
  shape.current.rotation.z=Math.sin(t*Math.PI)*.11;
  shape.current.visible=t<.99;
  dust.current.visible=t>0&&t<1;material.current.opacity=Math.sin(t*Math.PI)*.7;
  const a=geometry.getAttribute('position') as BufferAttribute;
  for(let i=0;i<a.count;i++){const angle=i*2.399,seed=(Math.sin(i*73.17)*437.2)%1,r=.25+Math.abs(seed)*.5+t*.9;a.setXYZ(i,x+Math.cos(angle)*r-t*.45,.04+Math.sin(t*Math.PI)*(.12+Math.abs(seed)*.24),z+Math.sin(angle)*r+t*.4)}
  a.needsUpdate=true;
 });
 return <><group position={[x,0,z]}><group ref={shape}><group position={[-x,0,-z]}>{children}</group></group></group><group ref={dust} visible={false}><points geometry={geometry} frustumCulled={false}><pointsMaterial ref={material} color="#d9bd87" size={.055} transparent depthWrite={false}/></points></group></>;
}
