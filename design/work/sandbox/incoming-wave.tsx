import {useMemo,type RefObject} from 'react';
import {useFrame} from '@react-three/fiber';
import {Color,Vector3} from 'three';
import {beachWashAt} from './beach-wash';

/** Matches the terrain's screen-space shoreline and washes over the castle silhouettes. */
export function IncomingWave({startedAt,dark,clock}:{startedAt:number;dark:boolean;clock:RefObject<number>}){
 const uniforms=useMemo(()=>({
  uWash:{value:0},uTime:{value:0},uDryCorner:{value:new Vector3()},
  uWater:{value:new Color(dark?'#2e6970':'#86bcbc')},
 }),[dark]);
 useFrame(({camera})=>{
  const dry=new Vector3(-5.8,0,4.3).project(camera);uniforms.uDryCorner.value.set(dry.x*.5+.5,dry.y*.5+.5,0);
  uniforms.uWash.value=beachWashAt(performance.now()-startedAt).advance;
  uniforms.uTime.value=clock.current;
 });
 return <mesh frustumCulled={false} renderOrder={1000}>
  <planeGeometry args={[2,2]}/>
  <shaderMaterial transparent depthTest={false} depthWrite={false} toneMapped={false} uniforms={uniforms}
   vertexShader={`
    varying vec2 vScreen;
    void main(){vScreen=position.xy*.5+.5;gl_Position=vec4(position.xy,0.,1.);}
   `}
   fragmentShader={`
    varying vec2 vScreen;
    uniform vec3 uDryCorner;uniform float uWash;uniform float uTime;uniform vec3 uWater;
    void main(){
     vec2 p=vScreen;
     float coast=p.x+p.y*.7-1.22+sin(p.y*7.+uTime*.45)*.018;
     float tide=sin(uTime*.65+p.y*3.)*.022;
     float protection=1.-smoothstep(.065,.15,distance(p,uDryCorner.xy));
     float shore=coast+tide+uWash-protection*2.;
     float water=smoothstep(-.018,.025,shore);
     float active=smoothstep(0.,.1,uWash);
     float curl=sin(p.y*63.+sin(p.y*17.+uTime)*2.5-uTime*2.)*.008;
     float foam=exp(-abs(shore+curl)*105.);
     float lace=sin(p.x*190.+uTime*1.2)*sin(p.y*141.-uTime*.7);
     foam*=.72+lace*.22;
     float backwash=exp(-abs(shore-.065+curl*.6)*95.)*.33;
     float shimmer=sin(p.x*65.+sin(p.y*43.+uTime)*2.)*sin(p.y*52.-uTime*.8)*.018;
     vec3 color=uWater+shimmer;
     float sediment=exp(-abs(shore-.09)*12.)*(.5+.5*sin(p.x*93.+p.y*71.+uTime*3.));
     color=mix(color,vec3(.71,.63,.44),sediment*.3);
     color=mix(color,vec3(.87,.94,.9),clamp(foam+backwash,0.,.92));
     float alpha=clamp(water*mix(.48,.985,smoothstep(.04,.3,shore))+foam*.85,0.,1.)*active;
     gl_FragColor=vec4(color,alpha);
     #include <colorspace_fragment>
    }
   `}/>
 </mesh>;
}
