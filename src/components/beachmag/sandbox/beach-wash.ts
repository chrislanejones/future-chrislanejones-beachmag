export const WASH_IN_MS = 1800;
export const WASH_CLEAR_MS = 2050;
export const WASH_RETREAT_MS = 2350;
export const WASH_END_MS = 4400;
export const WASH_REACH = 1.55;

function ease(value:number){
 const t=Math.max(0,Math.min(1,value));
 return t*t*(3-2*t);
}

/** One incoming wave, a covered reset, then a slower retreat. */
export function beachWashAt(elapsed:number){
 const advance=elapsed<WASH_IN_MS
  ? WASH_REACH*ease(elapsed/WASH_IN_MS)
  : WASH_REACH*(1-ease((elapsed-WASH_RETREAT_MS)/(WASH_END_MS-WASH_RETREAT_MS)));
 const damp=ease(elapsed/WASH_IN_MS)*(1-ease((elapsed-WASH_RETREAT_MS)/(WASH_END_MS-WASH_RETREAT_MS)));
 return {advance,damp,covered:elapsed>=WASH_CLEAR_MS,done:elapsed>=WASH_END_MS};
}
