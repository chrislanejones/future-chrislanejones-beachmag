import {describe,expect,test} from 'vitest';
import {beachWashAt,erosionAt,WASH_IN_MS,WASH_CLEAR_MS,WASH_RETREAT_MS,WASH_END_MS,WASH_REACH} from './beach-wash';
import {castleReducer,initialCastle} from './sandcastle-model';

describe('clear-beach tide',()=>{
 test('advances, covers the entire viewport during reset, then retreats',()=>{
  expect(beachWashAt(0).advance).toBe(0);
  expect(beachWashAt(WASH_IN_MS/2).advance).toBeGreaterThan(0);
  expect(beachWashAt(WASH_IN_MS).advance).toBe(WASH_REACH);
  expect(beachWashAt(WASH_CLEAR_MS).advance).toBe(WASH_REACH);
  // The most distant shore coordinate is -1.22, with up to .04 tide variation.
  expect(beachWashAt(WASH_CLEAR_MS).advance-1.22-.04).toBeGreaterThan(.025);
  expect(beachWashAt((WASH_RETREAT_MS+WASH_END_MS)/2).advance).toBeLessThan(WASH_REACH);
  expect(beachWashAt(WASH_END_MS)).toEqual({advance:0,damp:0,covered:true,done:true});
 });
 test('stays bounded with no snap at either turnaround',()=>{
  for(let ms=-100;ms<6000;ms+=17){const {advance,damp}=beachWashAt(ms);expect(advance).toBeGreaterThanOrEqual(0);expect(advance).toBeLessThanOrEqual(WASH_REACH);expect(damp).toBeGreaterThanOrEqual(0);expect(damp).toBeLessThanOrEqual(1)}
  expect(Math.abs(beachWashAt(WASH_RETREAT_MS-1).advance-beachWashAt(WASH_RETREAT_MS+1).advance)).toBeLessThan(.001);
 });
 test('one covered reset removes structures, terrain and decorations and supports one undo',()=>{
  const withFlag=castleReducer(initialCastle,{type:'place',tool:'flag',x:1,z:0,rotated:false});
  const cleared=castleReducer(withFlag,{type:'clear'});
  expect(cleared.pieces).toHaveLength(0);
  expect(cleared.history.length).toBe(withFlag.history.length+1);
  expect(castleReducer(cleared,{type:'undo'}).pieces).toEqual(withFlag.pieces);
 });
});

 test("erosion follows the water front and finishes before reset",()=>{expect(erosionAt(0,.2,.2)).toBe(0);expect(erosionAt(.5,.8,.8)).toBeGreaterThan(erosionAt(.5,.2,.2));for(const x of [0,.5,1])for(const y of [0,.5,1])expect(erosionAt(beachWashAt(WASH_CLEAR_MS).advance,x,y)).toBe(1)});
