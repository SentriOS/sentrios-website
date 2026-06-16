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
})();
