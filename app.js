(function(){
  var y=document.getElementById('yr'); if(y) y.textContent=new Date().getFullYear();
  var body=document.body, btn=document.getElementById('menuBtn');
  if(btn){
    btn.addEventListener('click',function(){var open=body.classList.toggle('menu-open');btn.setAttribute('aria-expanded',open?'true':'false');});
    document.querySelectorAll('#nav a').forEach(function(a){a.addEventListener('click',function(){body.classList.remove('menu-open');btn.setAttribute('aria-expanded','false');});});
  }
  var io=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:.12,rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('.reveal').forEach(function(el){io.observe(el);});
  if(!window.matchMedia('(prefers-reduced-motion:reduce)').matches){
    var nodes=document.querySelectorAll('.loop-svg .node');
    if(nodes.length){var i=0;setInterval(function(){nodes.forEach(function(n){n.classList.remove('active');});nodes[i%nodes.length].classList.add('active');i++;},1400);}
  }
  // contact form -> sends to info@sentrios.ai via FormSubmit (AJAX, stays on page)
  var form=document.getElementById('cform');
  if(form){
    var status=document.getElementById('cform-status');
    var setStatus=function(msg,cls){ if(status){status.innerHTML=msg;status.className='cform-status'+(cls?(' '+cls):'');} };
    form.addEventListener('submit',function(e){
      e.preventDefault();
      if(form._honey && form._honey.value){return;} // bot trap
      var g=function(id){var el=document.getElementById(id);return el?el.value.trim():'';};
      var company=g('cf-company');
      var payload={
        name:g('cf-name'), company:company, email:g('cf-email'), message:g('cf-msg'),
        _subject:'New SentriOS website inquiry'+(company?(' \u2014 '+company):''),
        _template:'table', _captcha:'false'
      };
      var sbtn=form.querySelector('button[type=submit]');
      setStatus('Sending\u2026');
      if(sbtn){sbtn.disabled=true;}
      fetch('https://formsubmit.co/ajax/info@sentrios.ai',{
        method:'POST',
        headers:{'Content-Type':'application/json','Accept':'application/json'},
        body:JSON.stringify(payload)
      }).then(function(r){return r.json();}).then(function(d){
        if(d && (d.success===true || d.success==='true')){
          form.reset();
          setStatus('Thanks \u2014 your message was sent. We\u2019ll be in touch shortly.','ok');
        } else { throw new Error('failed'); }
      }).catch(function(){
        setStatus('Something went wrong. Please email us directly at <a href="mailto:info@sentrios.ai">info@sentrios.ai</a>.','err');
      }).finally(function(){ if(sbtn){sbtn.disabled=false;} });
    });
  }

  // ROI calculator (construction.html #roi)
  if(document.getElementById('roi-cams')){
    var rq=function(id){return document.getElementById(id);};
    var usd=function(n){return '$'+Math.round(n).toLocaleString('en-US');};
    var rIds=['roi-cams','roi-trad','roi-inc','roi-hrs'];
    var SENT_MON=80, AVG_LOSS=10000, DOWN_WEEKS=1, DOWN_COST=8000, MISS_RATE=0.03, LABOR=65, RH_SENT=0.25;
    var rNum=function(id){return parseFloat(rq(id).value)||0;};
    var rFill=function(el){ if(!el)return; var mn=+el.min, mx=+el.max, v=+el.value;
      el.style.setProperty('--pct',((v-mn)/(mx-mn)*100)+'%'); };
    var rCalc=function(){
      var cams=rNum('roi-cams'), tradMon=rNum('roi-trad');
      var inc=rNum('roi-inc'), rh=rNum('roi-hrs');

      rq('roi-v-cams').textContent=cams.toLocaleString();
      rq('roi-v-trad').textContent=usd(tradMon);
      rq('roi-v-inc').textContent=inc.toLocaleString();
      rq('roi-v-hrs').textContent=rh;
      rIds.forEach(function(id){rFill(rq(id));});

      var w1=cams*tradMon*12, c1=cams*SENT_MON*12, s1=w1-c1;
      var perInc=AVG_LOSS+DOWN_WEEKS*DOWN_COST, w2=inc*perInc, c2=w2*MISS_RATE, s2=w2-c2;
      var w4=inc*rh*LABOR, c4=inc*RH_SENT*LABOR, s4=w4-c4, hoursSaved=inc*Math.max(0,rh-RH_SENT);
      var totalW=w1+w2+w4, totalC=c1+c2+c4, totalS=totalW-totalC;
      var invest=c1, ret=invest>0?totalS/invest:0, perCam=cams>0?totalS/cams:0;

      rq('roi-total').textContent=usd(totalS);
      rq('roi-percam').textContent=usd(perCam);
      rq('roi-return').textContent=(ret>=10?Math.round(ret):ret.toFixed(1))+'×';
      rq('roi-spend').textContent=usd(c1);
      rq('roi-without').textContent=usd(totalW);
      rq('roi-with').textContent=usd(totalC);

      var mxW=Math.max(totalW,1);
      rq('roi-bar-without').style.width='100%';
      rq('roi-bar-with').style.width=Math.max(3,(totalC/mxW)*100)+'%';

      rq('roi-k1-without').textContent=usd(w1); rq('roi-k1-with').textContent=usd(c1); rq('roi-k1-save').textContent=usd(s1);
      rq('roi-k2-without').textContent=usd(w2); rq('roi-k2-with').textContent=usd(c2); rq('roi-k2-save').textContent=usd(s2);
      rq('roi-k4-save').textContent=usd(s4); rq('roi-k4-hours').textContent=Math.round(hoursSaved).toLocaleString();
    };
    rIds.forEach(function(id){var el=rq(id); if(el) el.addEventListener('input',rCalc);});
    rCalc();
  }
})();
