import {describe,test,expect} from 'vitest';
import {castleReducer,initialCastle,MAX_FLAGS,type CastleState} from './sandcastle-model';
const empty=():CastleState=>({pieces:[],history:[],nextId:1,message:''});
const flag=(s:CastleState,x:number,z=0)=>castleReducer(s,{type:'place',tool:'flag',x,z,rotated:false});
describe('five physical flags',()=>{
 test('starts with all five available',()=>{expect(initialCastle.pieces.filter(p=>p.kind==='flag')).toHaveLength(0);expect(MAX_FLAGS).toBe(5)});
 test('rejects a sixth without consuming history or an ID',()=>{let s=empty();for(let x=-2;x<=2;x++)s=flag(s,x);const sixth=flag(s,3);expect(sixth.pieces).toBe(s.pieces);expect(sixth.nextId).toBe(s.nextId);expect(sixth.history).toBe(s.history);expect(sixth.message).toContain('All five')});
 test('erasing returns a flag, then exactly one can be replanted',()=>{let s=empty();for(let x=-2;x<=2;x++)s=flag(s,x);s=castleReducer(s,{type:'place',tool:'erase',x:0,z:0,rotated:false});s=flag(s,3);expect(s.pieces.filter(p=>p.kind==='flag')).toHaveLength(5);expect(flag(s,4).pieces).toBe(s.pieces)});
 test('undo and clear restore the available supply',()=>{let s=empty();for(let x=-2;x<=2;x++)s=flag(s,x);s=castleReducer(s,{type:'undo'});expect(s.pieces).toHaveLength(4);s=castleReducer(s,{type:'clear'});expect(s.pieces).toHaveLength(0);s=castleReducer(s,{type:'undo'});expect(s.pieces).toHaveLength(4)});
 test('failed duplicate placement uses no extra flag',()=>{const s=flag(empty(),0);expect(flag(s,0).pieces).toBe(s.pieces)});
});
