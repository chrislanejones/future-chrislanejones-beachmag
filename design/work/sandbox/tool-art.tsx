import type {CastleTool} from './sandcastle-model';

/** Small drawings of the actual beach tools and resulting sand shapes. */
export function ToolArt({tool}:{tool:CastleTool}){
 return <svg viewBox="0 0 64 64" className="game-tool-art" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
  {tool==='bucket'&&<>
   <path className="tool-accent-fill" d="M15 24 21 54Q32 59 43 54L49 24Z"/>
   <path d="M15 24 21 54Q32 59 43 54L49 24M16 26C4 48 54 50 48 26" />
   <ellipse cx="32" cy="24" rx="18" ry="5" className="tool-sand-fill"/>
   <path d="M17 20V18C17 2 47 2 47 18V20M21 31 25 49M43 31 40 49" />
   <path d="M22 22Q26 17 31 20Q35 15 41 22" strokeWidth="1.3"/>
   <circle cx="16" cy="28" r="2"/><circle cx="48" cy="28" r="2"/>
  </>}
  {tool==='tower'&&<>
   <path className="tool-sand-fill" d="M20 29 17 55Q32 61 47 55L44 29Z"/>
   <path className="tool-sand-fill" d="M16 17 23 14 23 21 29 20 29 12 36 12 36 20 42 21 42 14 49 17 48 30Q32 37 16 30Z"/>
   <path d="M17 26Q32 33 48 26M20 52Q32 57 44 52M22 36 21 49M42 35 43 49" strokeWidth="1.3"/>
   <path className="tool-shadow-fill" d="M29 56V45Q32 40 35 45V56"/>
   <path d="M10 58Q14 55 18 57M47 57 54 59" strokeWidth="1.3"/>
  </>}
  {tool==='wall'&&<>
   <path className="tool-sand-fill" d="M8 24 16 21 16 29 24 27 24 19 32 16 32 24 40 22 40 14 48 12 48 43 8 55Z"/>
   <path className="tool-shadow-fill" d="M48 12 56 17 56 48 48 43Z"/>
   <path d="M8 55 16 59 56 48M16 21 24 26M32 16 40 21M8 24 16 29M8 34 48 22M9 46 48 34M21 31V42M35 27V38M27 41V49M48 43 48 51" strokeWidth="1.3"/>
  </>}
  {tool==='shell'&&<>
   <path className="tool-shell-fill" d="M26 54 20 49Q9 44 7 32Q3 22 12 21Q9 11 20 13Q23 3 32 10Q41 3 44 13Q55 11 52 21Q61 22 57 32Q55 44 44 49L38 54Z"/>
   <path d="M32 51V14M29 51Q24 32 21 17M26 49Q17 34 12 25M25 47Q16 41 11 33M35 51Q40 32 43 17M38 49Q47 34 52 25M39 47Q48 41 53 33" strokeWidth="1.3"/>
   <path className="tool-sand-fill" d="M26 51 23 57Q32 61 41 57L38 51Z"/>
  </>}
  {tool==='pile'&&<>
   <path className="tool-sand-fill" d="M5 51Q14 47 21 34Q29 19 37 35Q42 45 58 51Q34 59 5 51Z"/>
   <path d="M22 47 28 37M35 41 40 47M15 52 18 51M30 50H33M45 51H48"/>
   <path className="tool-accent-fill" d="m42 8 14 6-6 14-11-4Z"/>
   <path d="m40 9 1-4 18 8-1 4M42 28l-1 4M47 30l-1 5" strokeWidth="1.3"/>
  </>}
  {tool==='moat'&&<>
   <path className="tool-sand-fill" d="M7 46Q18 32 31 42T57 42V54Q43 61 30 52T7 56Z"/>
   <path className="tool-water" d="M10 49Q21 39 32 47T55 47"/>
   <path className="tool-water" d="M12 53Q22 45 32 51T51 52" strokeWidth="1.4"/>
   <g transform="rotate(25 32 28)"><path d="M29 15V35H35V15"/><path className="tool-accent-fill" d="M25 6H39V13Q32 20 25 13ZM29 9V12H35V9Z"/><path className="tool-accent-fill" d="M25 34H39V42Q37 49 32 52Q27 49 25 42Z"/><path d="M32 39V46"/></g>
  </>}
  {tool==='flag'&&<>
   <path d="M18 58V9" strokeWidth="2.5"/>
   <path className="tool-accent-fill" d="M19 10 52 20 19 31Z"/>
   <path d="M11 58Q18 54 26 58M23 16 37 20" strokeWidth="1.3"/>
  </>}
  {tool==='erase'&&<>
   <path className="tool-accent-fill" d="m12 40 24-25q3-3 6 0l13 13q3 3 0 6L34 56H25Z"/>
   <path className="tool-sand-fill" d="m12 40 12-12 21 21-11 7h-9Z"/>
   <path d="M30 56H56M45 53H48M50 49H53"/>
  </>}
 </svg>
}
