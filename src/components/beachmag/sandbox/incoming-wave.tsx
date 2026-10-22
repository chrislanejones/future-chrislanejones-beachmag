import {useMemo,useRef,type RefObject} from 'react';
import {useFrame} from '@react-three/fiber';
import {Color,type ShaderMaterial} from 'three';
import {beachWashAt} from './beach-wash';

/** Matches the terrain's screen-space shoreline and washes over the castle silhouettes. */
export function IncomingWave({startedAt,dark,clock}:{startedAt:number;dark:boolean;clock:RefObject<number>}){
 const uniforms=useMemo(()=>({
  uWash:{value:0},uTime:{value:0},
  uWater:{value:new Color(dark?'#2e6970':'#86bcbc')},
 }),[dark]);
 // Written through the material ref: the React Compiler treats memoized values as frozen.
 const material=useRef<ShaderMaterial>(null);
 useFrame(()=>{
  const live=material.current?.uniforms;
  if(!live)return;
  live.uWash.value=beachWashAt(performance.now()-startedAt).advance;
  live.uTime.value=clock.current;
 });
 return <mesh frustumCulled={false} renderOrder={1000}>
  <planeGeometry args={[2,2]}/>
  <shaderMaterial ref={material} transparent depthTest={false} depthWrite={false} toneMapped={false} uniforms={uniforms}
   vertexShader={`
    varying vec2 vScreen;
    void main(){vScreen=position.xy*.5+.5;gl_Position=vec4(position.xy,0.,1.);}
   `}
   fragmentShader={`
    varying vec2 vScreen;
    uniform float uWash;uniform float uTime;uniform vec3 uWater;
    void main(){
     vec2 p=vScreen;
     float coast=p.x+p.y*.7-1.22+sin(p.y*7.+uTime*.45)*.018;
     float tide=sin(uTime*.65+p.y*3.)*.022;
     float shore=coast+tide+uWash;
     float water=smoothstep(-.018,.025,shore);
     float active=smoothstep(0.,.1,uWash);
     float curl=sin(p.y*63.+sin(p.y*17.+uTime)*2.5-uTime*2.)*.008;
     float foam=exp(-abs(shore+curl)*105.);
     float lace=sin(p.x*190.+uTime*1.2)*sin(p.y*141.-uTime*.7);
     foam*=.72+lace*.22;
     float backwash=exp(-abs(shore-.065+curl*.6)*95.)*.33;
     float shimmer=sin(p.x*65.+sin(p.y*43.+uTime)*2.)*sin(p.y*52.-uTime*.8)*.018;
     vec3 color=uWater+shimmer;
     color=mix(color,vec3(.87,.94,.9),clamp(foam+backwash,0.,.92));
     float alpha=clamp(water*.985+foam*.85,0.,1.)*active;
     gl_FragColor=vec4(color,alpha);
     #include <colorspace_fragment>
    }
   `}/>
 </mesh>;
}
