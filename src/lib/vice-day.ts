/**
 * The Beach City edition (code name "vice"): a day-long skin for 11-19-2026.
 * It turns itself on for VICE_DAY on the Eastern clock, so the daily ISR
 * cache never decides it; ?vice=on or ?vice=off previews or hides it for the
 * rest of the browser tab. Sunlit paper becomes Vice days, After dark becomes
 * Vice nights. Styles: src/components/beachmag/vice.css (html.vice).
 */
export const VICE_DAY = "2026-11-19";
export const VICE_ZONE = "America/New_York";
/** Held over past midnight: off at 3 AM Eastern on the 20th. */
export const VICE_END = "2026-11-20T08:00:00Z";

/** Runs in <head> before first paint (layout.tsx), so the page never flashes the coastal skin. */
export const VICE_SCRIPT = `(function(){try{
var q=new URLSearchParams(location.search).get("vice");
if(q==="on"||q==="off")sessionStorage.setItem("vice",q);
var o=sessionStorage.getItem("vice");
var n=new Date();
var d=new Intl.DateTimeFormat("en-CA",{timeZone:${JSON.stringify(VICE_ZONE)}}).format(n);
document.documentElement.classList.toggle("vice",o?o==="on":d>=${JSON.stringify(VICE_DAY)}&&n.getTime()<Date.parse(${JSON.stringify(VICE_END)}));
}catch(e){}})();`;
