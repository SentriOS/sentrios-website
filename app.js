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
  // contact form -> opens mail client (static-site friendly, no backend)
  var form=document.getElementById('cform');
  if(form){
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var g=function(id){var el=document.getElementById(id);return el?el.value.trim():'';};
      var name=g('cf-name'),company=g('cf-company'),email=g('cf-email'),msg=g('cf-msg');
      var subject='SentriOS inquiry'+(company?(' — '+company):'');
      var body='Name: '+name+'\nCompany: '+company+'\nEmail: '+email+'\n\n'+msg;
      window.location.href='mailto:info@sentrios.ai?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
    });
  }
})();
