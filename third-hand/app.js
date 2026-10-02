(() => {
  'use strict';
  const data=window.EXPERIMENT, core=window.ReplayCore;
  const $=id=>document.getElementById(id);
  const video=$('replay-video');
  const titles={A:'A1 · 独立补充',B:'B1 · 冻结验证',C:'C2 · 冻结验证'};
  const descriptions={A:'单个可行支撑块。此回合从初态独立补跑，目标为 375 mm，并明示执行器原有工作空间边界；不计入九次冻结验证。',B:'两个不同高度的候选方块。高层直接选择较高方块，随后卸力检验支撑，并根据试推结果调整双手协作。',C:'出口横向位置改变，支撑侧增加门缘凸起。展示 C2 正式验证轨迹，观察几何变化下的支撑建立与双手推盘。'};
  let active='B', mode='showcase', pendingSeek=null;
  const run=()=>data.runs[active];
  const num=(value,digits=1)=>Number(value).toFixed(digits);
  function setMetric(id,value,digits,unit){$(id).replaceChildren(document.createTextNode(num(value,digits)+' '));const small=document.createElement('small');small.textContent=unit;$(id).append(small);}
  function update(){
    const current=run(),t=core.toSim(current,video.currentTime||0,mode),sample=core.before(current.trace,t);
    $('sim-clock').textContent=num(t)+' s';
    setMetric('metric-tray',sample[1],1,'mm');setMetric('metric-support',sample[2],2,'N');setMetric('metric-hand',sample[3],2,'N');
    const action=current.actions.find(a=>t>=a.start&&t<a.end)||current.actions[current.actions.length-1];
    $('action-text').textContent=action.text;
    const cursor=$('trace-cursor'); if(cursor){const x=12+276*t/current.duration;cursor.setAttribute('x1',x);cursor.setAttribute('x2',x);}
    const chapters=[...$('chapters').children];let selected=0;chapters.forEach((b,i)=>{if(t>=Number(b.dataset.time)-.3)selected=i;});chapters.forEach((b,i)=>{b.classList.toggle('active',selected===i);b.setAttribute('aria-pressed',String(selected===i));});
  }
  function seek(seconds){
    const target=core.toVideo(run(),seconds,mode);
    if(video.readyState>=1){video.currentTime=Math.min(target,Math.max(0,video.duration-.1));pendingSeek=null;update();}else pendingSeek=target;
  }
  function source(sim=0){
    video.pause();pendingSeek=core.toVideo(run(),sim,mode);$('video-error').hidden=true;
    video.poster=`assets/${active}/poster.png`;
    video.src=`assets/${active}/${mode==='raw'?'raw_two_camera':'showcase'}.mp4`;
    $('video-download').href=video.getAttribute('src');
    $('mode-caption').textContent=mode==='raw'?'连续状态回放 · 1×，保留全部模型等待':'等待段 ×10，动作段 ×1；不是实时在线控制';
    video.load();
  }
  function drawTrace(){
    const current=run();const points=current.trace.map(p=>`${(12+276*p[0]/current.duration).toFixed(2)},${(104-p[1]/400*88).toFixed(2)}`).join(' ');
    $('trace-chart').innerHTML=`<line x1="12" y1="104" x2="288" y2="104" stroke="#e4e6ee"/><line x1="12" y1="38" x2="288" y2="38" stroke="#d5d0ee" stroke-dasharray="3 3"/><text x="12" y="30" fill="#8b84b2" font-size="10">300 mm</text><polyline points="${points}" fill="none" stroke="#655ac9" stroke-width="2.5"/><line id="trace-cursor" x1="12" y1="12" x2="12" y2="104" stroke="#b7afed" stroke-width="1.5"/>`;
    $('trace-duration').textContent=Math.round(current.duration)+' s';
  }
  function selectCase(cls){
    active=cls;const current=run();
    document.querySelectorAll('[data-case]').forEach(b=>{b.classList.toggle('selected',b.dataset.case===cls);b.setAttribute('aria-pressed',String(b.dataset.case===cls));});
    $('case-label').textContent=titles[cls];$('case-description').textContent=descriptions[cls];
    $('final-displacement').textContent=num(current.displacement,2)+' mm';$('final-clearance').textContent=num(current.clearance,2)+' mm';
    $('evaluation-link').href=`assets/${cls}/evaluation.json`;$('mapping-link').href=`assets/${cls}/showcase_mapping.json`;
    $('chapters').replaceChildren();
    const labels=['初态与选物','方块开始承重','托门手卸力','双手推进','最终状态'];
    [...current.stages,current.duration-1].forEach((t,i)=>{const button=document.createElement('button');button.type='button';button.dataset.time=t;button.setAttribute('aria-pressed','false');button.innerHTML=`<b>0${i+1}</b><span>${labels[i]}<small>仿真 ${Math.round(t)} s</small></span>`;button.addEventListener('click',()=>seek(t));$('chapters').append(button);});
    drawTrace();source();update();
  }
  video.addEventListener('loadedmetadata',()=>{if(pendingSeek!==null){video.currentTime=Math.min(pendingSeek,Math.max(0,video.duration-.1));pendingSeek=null;}update();});
  video.addEventListener('timeupdate',update);video.addEventListener('seeked',update);
  video.addEventListener('error',()=>{$('video-error').hidden=false;});
  document.querySelectorAll('[data-case]').forEach(b=>b.addEventListener('click',()=>selectCase(b.dataset.case)));
  $('video-mode').addEventListener('change',e=>{const t=core.toSim(run(),video.currentTime||0,mode);mode=e.target.value;source(t);});
  document.querySelectorAll('[data-b-seek]').forEach(b=>b.addEventListener('click',()=>{if(active!=='B')selectCase('B');seek(Number(b.dataset.bSeek));$('interactive').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});}));
  const senseText={
    support:{values:[['顶部触觉合力','2.138 N'],['门下缘高度','112.44 mm']],context:'左手仍在承受部分载荷。门已经接近方块顶面，但还需要进一步卸力检验。',title:'小幅下降，继续验证承重',action:'底层执行微小位移并持续控制接触。动作后，顶部触觉合力降至 0，门下缘仍为 112.44 mm；之后高层安排左手转向托盘。'},
    resistance:{values:[['前侧触觉合力','8.092 N'],['上次位移增量','0.91 mm']],context:'单手电机上限已达 8 N，托盘只发生微小位移。受力与运动共同提供“尚未明显起动”的反馈。',title:'卸去单手推力，组织双手协作',action:'高层改变手的分工；底层执行左手后退、右手绕开支撑块的连续动作，为双手在托盘后方会合做准备。'},
    force:{values:[['左右前侧触觉','6.019 / 6.016 N'],['上次位移增量','0.07 mm']],context:'两只手均接触托盘，但各 6 N 的试推仍未产生明显位移。高层据此选择更高的下一段力上限。',title:'将每手上限提高到 7.5 N',action:'高频模型在新目标下执行局部推送，随后记录到约 9.27 mm 的位移增量。新的运动结果再回到高层，用于决定后续推进。'}
  };
  let selectedSense='support';
  function showSense(key){
    selectedSense=key;const text=senseText[key],record=data.senses[key];
    document.querySelectorAll('[data-sense]').forEach(b=>{b.classList.toggle('selected',b.dataset.sense===key);b.setAttribute('aria-pressed',String(b.dataset.sense===key));});
    $('sense-values').innerHTML=text.values.map(([label,value])=>`<div><span>${label}</span><strong>${value}</strong></div>`).join('');
    $('sense-context').textContent=text.context;$('sense-quote').textContent=record.quote;
    $('sense-source').textContent=`B1 · 第 ${record.call+1} 次高层调用（日志索引 ${record.call}）· ${num(record.start)} s`;
    $('sense-title').textContent=text.title;$('sense-action').textContent=text.action;
  }
  document.querySelectorAll('[data-sense]').forEach(b=>b.addEventListener('click',()=>showSense(b.dataset.sense)));
  $('sense-replay').addEventListener('click',()=>{if(active!=='B')selectCase('B');seek(data.senses[selectedSense].start);$('interactive').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});});
  function results(criterion){
    document.querySelectorAll('[data-criterion]').forEach(b=>{b.classList.toggle('selected',b.dataset.criterion===criterion);b.setAttribute('aria-pressed',String(b.dataset.criterion===criterion));});
    const count=data.results.filter(r=>core.passes(r,criterion)).length;
    $('criterion-title').textContent=criterion==='original'?'原验收 · ≥300 mm + 安全门槛':'完整取盘 · >365 mm + 安全门槛';
    $('criterion-count').innerHTML=`${count}<span> / 9</span>`;
    $('criterion-explanation').textContent=criterion==='original'?'8 次通过所有冻结安全门槛。A3 首条动作超出执行器工作空间，动作被拒绝，保留为失败。':'B1 和 C2 在正式轨迹中安全地完整取出托盘。其余位移达标回合的后缘仍未完全越过门口；A 类补充不计入此分母。';
    const rows=data.results.map(r=>`<div class="chart-row"><span class="row-label">${r.name.replace('_val',' · ')}</span><div class="bar-track" style="--width:${r.final_tray_mm/400*100}%"><div class="bar ${core.passes(r,criterion)?'':'fail'}"></div><span class="bar-value">${num(r.final_tray_mm)}</span></div></div>`).join('');
    $('result-chart').innerHTML=`<div class="bars"><div class="threshold ${criterion==='full'?'full':''}"><span>${criterion==='full'?'>365':'300'} mm</span></div>${rows}</div><div class="axis"><span>0</span><span>100</span><span>200</span><span>300</span><span>400 mm</span></div>`;
  }
  $('result-table').innerHTML=data.results.map(r=>`<tr><td>${r.name.replace('_val',' · ')}</td><td><span class="status ${r.success?'':'failed'}">${r.success?'通过':'动作越界'}</span></td><td>${num(r.final_tray_mm)}</td><td>${r.minimum_clearance_mm===null?'—':num(r.minimum_clearance_mm)}</td><td>${num(r.max_hand_contact_N,3)}</td><td>${r.calls}</td><td>${r.provider}</td><td><a href="evidence/runs/${r.name}.json" aria-label="${r.name} 独立评价">评价</a></td></tr>`).join('');
  document.querySelectorAll('[data-criterion]').forEach(b=>b.addEventListener('click',()=>results(b.dataset.criterion)));
  if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting)document.querySelectorAll('.nav-links a').forEach(a=>a.classList.toggle('active',a.hash===`#${e.target.id}`));});},{rootMargin:'-20% 0px -55% 0px'});document.querySelectorAll('section[id]').forEach(s=>observer.observe(s));}
  selectCase('B');results('original');showSense('support');
})();
