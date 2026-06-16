document.getElementById('yr').textContent = new Date().getFullYear();
var body=document.body, btn=document.getElementById('menuBtn');
if(btn){
  btn.addEventListener('click',function(){var open=body.classList.toggle('menu-open');btn.setAttribute('aria-expanded',open?'true':'false');});
  document.querySelectorAll('#nav a').forEach(function(a){a.addEventListener('click',function(){body.classList.remove('menu-open');btn.setAttribute('aria-expanded','false');});});
}
var io=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:.12,rootMargin:'0px 0px -8% 0px'});
document.querySelectorAll('.reveal').forEach(function(el){io.observe(el);});
(function(){
  if(window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  var nodes=document.querySelectorAll('.loop-svg .node'); if(!nodes.length) return;
  var i=0; setInterval(function(){nodes.forEach(function(n){n.classList.remove('active');});nodes[i%nodes.length].classList.add('active');i++;},1400);
})();
