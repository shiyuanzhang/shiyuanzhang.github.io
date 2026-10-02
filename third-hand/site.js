(() => {
  'use strict';
  const videos=[...document.querySelectorAll('video')];
  for (const video of videos) {
    let retried=false;
    const error=video.parentElement.querySelector('.media-error');
    const fallback=()=>{
      if(!retried){
        retried=true;const mp4=video.querySelector('source[type="video/mp4"]');
        if(mp4){const shouldPlay=!video.paused;video.src=mp4.src;video.load();if(shouldPlay)video.play().catch(()=>{});return;}
      }
      if(error)error.hidden=false;
    };
    video.addEventListener('error',fallback);
    video.addEventListener('playing',()=>{if(error)error.hidden=true;});
    let sourceErrors=0;
    const sources=[...video.querySelectorAll('source')];
    sources.forEach(s=>s.addEventListener('error',()=>{sourceErrors++;if(sourceErrors===sources.length)fallback();}));
  }
  const allButton=document.getElementById('play-all');
  const gallery=[...document.querySelectorAll('.video-grid video')];
  let playing=false;
  allButton.addEventListener('click',()=>{
    if(playing){gallery.forEach(v=>v.pause());playing=false;allButton.textContent='Play all nine';}
    else {gallery.forEach(v=>{v.muted=true;v.currentTime=0;v.play().catch(()=>{});});playing=true;allButton.textContent='Pause all';}
    allButton.setAttribute('aria-pressed',String(playing));
  });
})();
