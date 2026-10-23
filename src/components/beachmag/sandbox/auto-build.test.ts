import {test,expect} from 'vitest';
import {castleReducer,initialCastle,onBeach} from './sandcastle-model';
test('build a complete castle with five flags and restore the prior beach in one undo',()=>{
 const built=castleReducer(initialCastle,{type:'build'});
 expect(built.pieces.filter(p=>p.kind==='flag')).toHaveLength(5);
 expect(built.pieces.filter(p=>p.kind==='tower')).toHaveLength(5);
 expect(built.pieces.every(p=>onBeach(p.x,p.z))).toBe(true);
 expect(new Set(built.pieces.map(p=>p.id)).size).toBe(built.pieces.length);
 expect(castleReducer(built,{type:'undo'}).pieces).toEqual(initialCastle.pieces);
 expect(castleReducer(built,{type:'build'}).pieces.length).toBe(built.pieces.length);
 expect(castleReducer(built,{type:'clear'}).pieces).toHaveLength(0);
});
