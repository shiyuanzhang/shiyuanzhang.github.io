(function(root){
  'use strict';
  function before(rows, value, column=0){
    let low=0,high=rows.length-1;
    while(low<high){const mid=Math.ceil((low+high)/2);if(rows[mid][column]<=value)low=mid;else high=mid-1;}
    return rows[low];
  }
  function toSim(run, seconds, mode){return mode==='raw'?Math.min(run.duration,seconds+.1):before(run.mapping,seconds)[1];}
  function toVideo(run, seconds, mode){return mode==='raw'?Math.max(0,seconds-.1):before(run.mapping,seconds,1)[0];}
  function passes(row, criterion){return row.success && (criterion==='original'||row.full_extraction_success);}
  const api={before,toSim,toVideo,passes};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ReplayCore=api;
})(typeof window!=='undefined'?window:globalThis);
