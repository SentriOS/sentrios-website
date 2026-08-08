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

  /* ===================================================================
     ROI calculator — construction.html #roi
     Two models: trailer fleet (channel economics) and job sites (owner).
     SentriOS pricing and the SentriOS-side churn figure are intentionally
     NOT rendered anywhere. Every displayed figure is already net of them.
     =================================================================== */
  if(document.getElementById('roi-inputs')){
  (function(){
    "use strict";

    /* --- constants that never reach the page --- */
    var PRICE       = 100;   // $ per stream per month, all features included
    var SENT_CHURN  = 5;     // % annual churn with SentriOS
    var SENT_DEP_HR = 0.25;  // technician hours to deploy one trailer
    var SENT_MISS   = 2;     // % of events SentriOS misses
    var GROWTH_DISC = 0.5;   // confidence haircut on growth + retention (fleet)
    var LOSS_DISC   = 0.4;   // haircut on job-site avoided loss + reporting time

    var mode = "fleet", preset = "cons";

    // Site monitoring rate is $0 (no monitoring today) or $100–$250. Nothing between.
    var SITE_RATES = (function(){var a=[0],v; for(v=100;v<=250;v+=5){a.push(v);} return a;})();
    var NO_MON_MISS = 100;  // with no monitoring, nothing is intercepted
    var NO_MON_INC  = 3;    // theft events per site per year, borne in full

    var P = {
      fleet:{
        cons:{trailers:200,monPct:70,cams:3,rate:120,rev:1000,depNow:2,tech:85,months:9,churnNow:15,extra1:0,extra2:0},
        exp: {trailers:200,monPct:80,cams:4,rate:150,rev:1200,depNow:3,tech:85,months:10,churnNow:22,extra1:4,extra2:3},
        agg: {trailers:200,monPct:90,cams:5,rate:250,rev:1500,depNow:4,tech:95,months:11,churnNow:30,extra1:8,extra2:6}
      },
      site:{
        cons:{sites:12,cams:6,rate:120,inc:0.5,loss:7500,down:5000,missNow:15,adminH:6,adminR:65,months:9},
        exp: {sites:12,cams:6,rate:150,inc:0.8,loss:10000,down:8000,missNow:25,adminH:6,adminR:65,months:10},
        agg: {sites:12,cams:8,rate:250,inc:1.5,loss:15000,down:12000,missNow:35,adminH:8,adminR:75,months:11}
      }
    };
    var S = {fleet:copy(P.fleet.cons), site:copy(P.site.cons)};

    var F = {
      fleet:[
        {g:"Your fleet"},
        {k:"trailers",l:"Trailers in your fleet",h:"Total units you own or manage",min:10,max:2000,step:10},
        {k:"monPct",  l:"Share on monitored contracts",h:"Units where a customer pays for monitoring, %",min:10,max:100,step:5},
        {k:"cams",    l:"Cameras or streams per trailer",h:"",min:1,max:5,step:1},
        {g:"Your economics today"},
        {k:"rate",  l:"What monitoring costs you per stream",h:"$ per stream per month, paid to your monitoring provider",min:100,max:250,step:5},
        {k:"rev",   l:"What you charge per trailer",h:"$ per trailer per month, rental plus monitoring",min:400,max:3000,step:50},
        {k:"depNow",l:"Hours to deploy your current monitoring solution",h:"Technician time per trailer, as it works today",min:0.5,max:4,step:0.5},
        {k:"tech",  l:"Your loaded technician rate",h:"$ per hour",min:40,max:180,step:5},
        {g:"What changes with SentriOS"},
        {k:"months",  l:"Months live in year one",h:"Allow for phased rollout; go-live is 2–4 weeks per unit",min:1,max:12,step:1},
        {k:"churnNow",l:"Your annual churn on monitored contracts",h:"% of monitored units you lose in a year today",min:10,max:40,step:1},
        {k:"extra1",  l:"Extra trailers you win — response and recall",h:"Per year, on 13-second dispatch and a 20–25% improvement in recall. Leave at 0 to exclude.",min:0,max:60,step:1},
        {k:"extra2",  l:"Extra trailers you win — custom agents",h:"Per year, on use cases your customer defines in plain language, live from day one. Leave at 0 to exclude.",min:0,max:60,step:1}
      ],
      site:[
        {g:"Your sites"},
        {k:"sites",l:"Active job sites",h:"Sites running at any one time",min:1,max:300,step:1},
        {k:"cams", l:"Cameras per site",h:"Large projects and data-centre builds run into the hundreds",min:2,max:400,step:1},
        {g:"What you spend today"},
        {k:"rate",l:"What monitoring costs you per stream",h:"$ per stream per month paid to your provider, from $100. Enter 0 if you have no monitoring today — the model then assumes nothing is intercepted and 3 theft events per site per year.",min:0,max:250,step:5,vals:SITE_RATES},
        {g:"What happens when something goes wrong"},
        {k:"inc", l:"Theft or loss events per site",h:"Per site per year, attempted or successful",min:0,max:6,step:0.1},
        {k:"loss",l:"Average material loss per event",h:"$ — tools, copper, fuel, equipment",min:0,max:60000,step:500},
        {k:"down",l:"Average downtime cost per event",h:"$ — standby, resequencing, replacement lead time",min:0,max:60000,step:500},
        {g:"How much gets stopped"},
        {k:"missNow",l:"Events your setup misses today",h:"% — what an operator queue does not intercept in time",min:10,max:35,step:5},
        {g:"Reporting and rollout"},
        {k:"adminH",l:"Admin hours per incident report",h:"PM and admin time to compile today",min:0,max:24,step:0.5},
        {k:"adminR",l:"Loaded admin rate",h:"$ per hour",min:30,max:180,step:5},
        {k:"months",l:"Months live in year one",h:"Go-live is 2–4 weeks per site",min:1,max:12,step:1}
      ]
    };

    var LOCKS = {
      fleet:[
        {l:"SentriOS, all features included",r:"One flat rate per stream",h:"No setup fee, no new hardware, no tiers"},
        {l:"Detection to 911 dispatch",r:"13 sec",h:"Against a 20–30 minute operator queue"},
        {l:"Recall vs a fixed classifier",r:"+20–25%",h:"Fewer events missed on the same cameras"}
      ],
      site:[
        {l:"SentriOS, all features included",r:"One flat rate per stream",h:"No setup fee, no new hardware, no tiers"},
        {l:"Events SentriOS misses",r:"2%",h:"A planning assumption, not a published benchmark. See the basis below."},
        {l:"Detection to 911 dispatch",r:"13 sec",h:"Against a 20–30 minute operator queue"}
      ]
    };

    /* --- helpers --- */
    function copy(o){var r={},k; for(k in o){if(Object.prototype.hasOwnProperty.call(o,k)) r[k]=o[k];} return r;}
    function $(id){return document.getElementById(id);}
    function money(n){var neg=n<0; n=Math.round(Math.abs(n)); return (neg?"−$":"$")+n.toLocaleString("en-US");}
    function num(n,d){return Number(n).toFixed(d||0);}
    function pct(n){return num(n,0)+"%";}
    function nearestIdx(vals,v){var bi=0,bd=Infinity,i,d; for(i=0;i<vals.length;i++){d=Math.abs(vals[i]-v); if(d<bd){bd=d;bi=i;}} return bi;}
    function snapVal(f,v){return f.vals ? f.vals[nearestIdx(f.vals,v)] : Math.min(f.max,Math.max(f.min,v));}
    function fill(el){ if(!el) return; var mn=+el.min, mx=+el.max, v=+el.value;
      el.style.setProperty("--pct", (mx>mn ? (v-mn)/(mx-mn)*100 : 0)+"%"); }

    /* --- models --- */
    function calcFleet(s){
      var monitored = Math.round(s.trailers * s.monPct/100);
      var cams      = monitored * s.cams;

      // hard cash: the monitoring line inside your cost of goods
      var cogsCut      = cams * (s.rate - PRICE) * 12;
      var perTrailerMo = s.cams * (s.rate - PRICE);
      var cBefore = s.rev - s.cams*s.rate;
      var cAfter  = s.rev - s.cams*PRICE;
      var mBefore = s.rev>0 ? cBefore/s.rev*100 : 0;
      var mAfter  = s.rev>0 ? cAfter /s.rev*100 : 0;

      // technician time released on cut-over (year one only)
      var hrsSaved   = Math.max(0, s.depNow - SENT_DEP_HR);
      var deploySave = monitored * hrsSaved * s.tech;

      // growth + retention, risk adjusted
      var unit      = cAfter * 12;
      var extra1Adj = s.extra1 * unit * GROWTH_DISC;
      var extra2Adj = s.extra2 * unit * GROWTH_DISC;
      var retained  = monitored * Math.max(0, s.churnNow - SENT_CHURN)/100;
      var churnAdj  = retained * unit * GROWTH_DISC;
      var growth    = extra1Adj + extra2Adj + churnAdj;

      var steady = cogsCut + growth;
      var y1     = steady*(s.months/12) + deploySave;

      return {monitored:monitored,cams:cams,cogsCut:cogsCut,perTrailerMo:perTrailerMo,
        cBefore:cBefore,cAfter:cAfter,mBefore:mBefore,mAfter:mAfter,
        hrsSaved:hrsSaved,deploySave:deploySave,extra1Adj:extra1Adj,extra2Adj:extra2Adj,
        retained:retained,churnAdj:churnAdj,growth:growth,steady:steady,y1:y1,
        unitsGained:retained + s.extra1 + s.extra2};
    }

    function calcSite(s){
      var cams = s.sites * s.cams;
      var cash = cams * (s.rate - PRICE) * 12;
      var spend = cams * PRICE * 12;

      var banded      = s.cams > 100;
      var noMon       = s.rate === 0;
      var missEff     = noMon ? NO_MON_MISS : s.missNow;
      var incidents   = s.sites * s.inc;
      var exposure    = s.loss + s.down;
      var intercepted = incidents * (missEff - SENT_MISS)/100;
      var lossGross   = Math.max(0, intercepted) * exposure;
      var adminGross  = incidents * s.adminH * s.adminR * 0.9;
      var keep        = 1 - LOSS_DISC;
      var lossVal     = lossGross * keep;
      var adminVal    = adminGross * keep;

      var net  = cash + lossVal + adminVal;
      var ret  = spend>0 ? (cams*s.rate*12 + lossVal + adminVal)/spend : 0;
      return {cams:cams,cash:cash,incidents:incidents,exposure:exposure,noMon:noMon,missEff:missEff,
        banded:banded,intercepted:Math.max(0,intercepted),lossGross:lossGross,lossVal:lossVal,
        adminGross:adminGross,adminVal:adminVal,
        net:net,ret:ret,y1:net*(s.months/12),perCam:cams>0?net/cams:0};
    }

    /* --- inputs --- */
    function renderInputs(){
      var box=$("roi-inputs"); box.innerHTML="";
      F[mode].forEach(function(f){
        if(f.g){var g=document.createElement("div"); g.className="roi-grp"; g.textContent=f.g; box.appendChild(g); return;}
        var wrap=document.createElement("div"); wrap.className="roi-field";
        var id="roi-in-"+f.k, dec=(f.step<1)?1:0;
        wrap.innerHTML =
          '<div class="roi-field-top"><label for="'+id+'">'+f.l+
          (f.h?'<span class="hint">'+f.h+'</span>':'')+'</label>'+
          '<input type="number" id="'+id+'" min="'+f.min+'" max="'+f.max+'" step="'+f.step+'"></div>'+
          '<input type="range" id="roi-rg-'+f.k+'" min="'+f.min+'" max="'+f.max+'" step="'+f.step+'" aria-labelledby="'+id+'">';
        box.appendChild(wrap);
        var n=$(id), r=$("roi-rg-"+f.k);
        if(f.vals){ r.min=0; r.max=f.vals.length-1; r.step=1; }
        paint(S[mode][f.k]);
        function paint(v){ n.value=num(v,dec); r.value=f.vals?nearestIdx(f.vals,v):v; fill(r); }
        function set(v){
          v=parseFloat(v); if(isNaN(v)) v=f.vals?f.vals[0]:f.min;
          v=snapVal(f,v);
          S[mode][f.k]=v; paint(v); afterChange(f.k); render();
        }
        r.addEventListener("input",function(){set(f.vals?f.vals[+r.value]:r.value);});
        n.addEventListener("input",function(){
          var v=parseFloat(n.value); if(isNaN(v))return;
          v=snapVal(f,Math.min(f.max,Math.max(f.min,v)));
          S[mode][f.k]=v; r.value=f.vals?nearestIdx(f.vals,v):v; fill(r); afterChange(f.k); render();
        });
        n.addEventListener("blur",function(){set(n.value);});
      });
      if(mode==="site"){ lastRate=S.site.rate; lockMiss(S.site.rate===0); }
      $("roi-locks").innerHTML = LOCKS[mode].map(function(x){
        return '<div class="roi-lock"><span class="l">'+x.l+(x.h?'<span class="hint">'+x.h+'</span>':'')+
               '</span><span class="r">'+x.r+'</span></div>';
      }).join("");
    }

    /* No monitoring today: nothing is intercepted, and 3 events a site a year
       land in full. The miss rate is forced and locked; the event count is set
       once on the way in and stays editable. Both revert if a rate comes back. */
    var lastRate=null, stashInc=null;
    function syncField(k,v,dec){
      var n=$("roi-in-"+k), r=$("roi-rg-"+k);
      if(!n||!r) return;
      n.value=num(v,dec||0); r.value=v; fill(r);
    }
    function lockMiss(on){
      var n=$("roi-in-missNow"), r=$("roi-rg-missNow");
      if(!n||!r) return;
      var wrap=n.parentNode.parentNode, note=wrap.querySelector(".forced");
      wrap.className="roi-field"+(on?" is-forced":"");
      n.disabled=on; r.disabled=on;
      n.value = on ? NO_MON_MISS : num(S.site.missNow,0);
      if(on && !note){
        note=document.createElement("div"); note.className="forced";
        note.textContent="Forced to 100% — with no monitoring in place, nothing is intercepted before it happens.";
        wrap.appendChild(note);
      } else if(!on && note){ wrap.removeChild(note); }
    }
    function afterChange(k){
      if(mode!=="site") return;
      // if they overrode our 3 while at $0, that is their number now — do not undo it
      if(k==="inc" && lastRate===0){ stashInc=null; return; }
      if(k!=="rate") return;
      var s=S.site, zero=(s.rate===0), wasZero=(lastRate===0);
      if(zero && !wasZero){ stashInc=s.inc; s.inc=NO_MON_INC; syncField("inc",NO_MON_INC,1); }
      else if(!zero && wasZero && stashInc!==null){ s.inc=stashInc; syncField("inc",stashInc,1); stashInc=null; }
      lastRate=s.rate; lockMiss(zero);
    }

    function row(t,m,v,cls,extra){
      return '<div class="roi-line'+(extra||'')+'"><div class="l"><div class="t">'+t+'</div>'+
             (m?'<div class="m">'+m+'</div>':'')+'</div><div class="v '+(cls||'')+'">'+v+'</div></div>';
    }
    function sign(n){return n>=0?"pos":"neg";}
    function flag(html){return '<div class="roi-flag">'+html+'</div>';}

    var DISC = {
      fleet:"These are estimates built from the inputs above, not a quotation. Actual results vary by fleet, "+
            "contract mix and deployment. In this model the monitoring line and the technician time are "+
            "contractual and shown at full value; the three growth and retention lines are probabilistic and "+
            "each carries a stated 50% confidence discount before it reaches any total. Every line is already "+
            "net of what you pay SentriOS.",
      site: "These are estimates built from the inputs above, not a quotation. Actual results vary by site, "+
            "camera coverage, incident profile and deployment. In this model the cash line is a cancelled "+
            "invoice — contractual, shown at full value. Everything below it is probabilistic and carries a "+
            "fixed 40% discount before it reaches the total. Every line is already net of what you pay SentriOS."
    };

    /* --- render --- */
    function render(){
      var s=S[mode], L=$("roi-ledger");
      if(mode==="fleet"){
        var r=calcFleet(s);
        $("roi-dek").textContent="You already own the trailers, the cameras and the customer. The question that matters is what an agent does to the monitoring line in your cost of goods — and to the contracts you keep and win.";
        $("roi-ledger-title").textContent="Your gross profit, before and after";
        $("roi-ledger-note").textContent=r.monitored.toLocaleString()+" monitored trailers · "+r.cams.toLocaleString()+" streams";
        $("roi-hero-lbl").textContent="Annual gross profit lift, steady state";
        $("roi-hero-val").textContent=money(r.steady);
        $("roi-hero-val").className="big "+sign(r.steady);
        $("roi-hero-sub").innerHTML="Year one including cut-over <b>"+money(r.y1)+
          "</b> · per trailer per month <b>"+money(r.perTrailerMo)+"</b>";

        var warn = (s.rate < PRICE) ? flag("<b>At this rate you already pay less per stream than SentriOS "+
          "costs.</b> On price alone this is an increase, not a saving — the monitoring line below is negative "+
          "and says so. What you would be buying is autonomous resolution and 13-second dispatch in place of an "+
          "alert queue, which is a conversation about capability rather than cost.") : "";

        L.innerHTML = warn +
          row("Monitoring line in your cost of goods",
              r.cams.toLocaleString()+" streams × 12 months, net of SentriOS",
              money(r.cogsCut), sign(r.cogsCut), "  roi-sub-total") +
          (s.extra1>0 ? row("Contracts won on response and recall",
              s.extra1+" trailers × "+money(r.cAfter)+" contribution × 12 = "+money(s.extra1*r.cAfter*12)+
              ", less a 50% confidence discount — probabilistic, not contractual",
              money(r.extra1Adj),"pos") : "") +
          (s.extra2>0 ? row("Contracts won on customer-defined agents",
              s.extra2+" trailers × "+money(r.cAfter)+" contribution × 12 = "+money(s.extra2*r.cAfter*12)+
              ", less a 50% confidence discount — probabilistic",
              money(r.extra2Adj),"pos") : "") +
          row("Contracts you stop losing",
              num(r.retained,1)+" trailers retained from "+pct(s.churnNow)+" churn × "+money(r.cAfter)+
              " × 12 = "+money(r.retained*r.cAfter*12)+", less a 50% confidence discount — probabilistic",
              money(r.churnAdj),"pos") +
          ((s.extra1>0||s.extra2>0) ? row("Growth and retention, risk-adjusted",
              "every line above carries a 50% confidence discount",
              money(r.growth),"pos","  roi-sub-total") : "") +
          row("Technician time released at cut-over",
              r.monitored.toLocaleString()+" trailers × "+num(r.hrsSaved,2)+" hrs saved × $"+num(s.tech)+" — year one only",
              money(r.deploySave),"pos") +
          row("Steady-state annual lift","full twelve months, rollout complete",money(r.steady),sign(r.steady),"  roi-total");

        $("roi-strip").innerHTML =
          '<div><div class="k">Contribution margin<br>per trailer</div><div class="n">'+pct(r.mBefore)+' → '+pct(r.mAfter)+'</div></div>'+
          '<div><div class="k">Trailers kept or won<br>per year</div><div class="n">'+num(r.unitsGained,1)+'</div></div>'+
          '<div><div class="k">Three-year<br>cumulative lift</div><div class="n">'+money(r.y1+r.steady*2)+'</div></div>';
      } else {
        var q=calcSite(s);
        $("roi-dek").textContent="Two kinds of money are in play here, and they are not worth the same. One is an invoice you cancel. The other is a loss you avoid. This keeps them apart.";
        $("roi-ledger-title").textContent="Cash first, then risk";
        $("roi-ledger-note").textContent=s.sites+" sites · "+q.cams.toLocaleString()+" streams"+(q.noMon?" · no monitoring today":"");
        $("roi-hero-lbl").textContent="Net annual benefit, after paying SentriOS";
        $("roi-hero-val").textContent=money(q.net);
        $("roi-hero-val").className="big "+sign(q.net);
        $("roi-hero-sub").innerHTML="Of which bankable cash <b>"+money(q.cash)+
          "</b> · year one <b>"+money(q.y1)+"</b>";

        var notes = "";
        if(q.banded){
          notes += flag("<b>At "+s.cams+" cameras on a site you are above the per-camera band.</b> Projects at "+
            "this density are priced as a monthly site fee with a camera allowance, so adding cameras inside the "+
            "band costs nothing extra. The arithmetic below still describes the economics; the invoice is "+
            "structured differently. Bring the camera count to a working session and we will price the band.");
        }
        if(q.incidents<=0){
          notes += flag("<b>You have entered zero theft or loss events.</b> The model therefore credits zero loss "+
            "avoidance and zero reporting time — correctly. Only the cash line moves, and that line does not depend "+
            "on any estimate at all.");
        } else if(q.missEff<=2){
          notes += flag("<b>Your current setup is set to miss no more than SentriOS does.</b> The model therefore "+
            "credits zero loss avoidance — correctly. Everything below the cash line stays at zero until there is "+
            "a gap to close.");
        }

        L.innerHTML = notes +
          row("Monitoring cash, net",
              q.cams.toLocaleString()+" streams × 12 months at $"+num(s.rate)+", net of SentriOS",
              money(q.cash), sign(q.cash), "  roi-sub-total") +
          row("Losses intercepted, risk-adjusted",
              (q.noMon
                ? "you intercept nothing today with no monitoring, against 2% missed with SentriOS — a gap of "
                : "miss rate "+pct(q.missEff)+" today vs 2% with SentriOS — a gap of ")+
              num(q.intercepted,1)+" events × "+money(q.exposure)+" exposure = "+money(q.lossGross)+
              ", less a "+pct(LOSS_DISC*100)+" discount — probabilistic, not contractual",
              money(q.lossVal),"pos") +
          row("Reporting time recovered, risk-adjusted",
              num(q.incidents,1)+" events × "+num(s.adminH,1)+" hrs × $"+num(s.adminR)+
              " = "+money(q.adminGross/0.9)+", credited at a 90% reduction, less a "+pct(LOSS_DISC*100)+
              " discount — probabilistic",
              money(q.adminVal),"pos") +
          row("Net annual benefit","cash plus avoided loss, after SentriOS",money(q.net),sign(q.net),"  roi-total");

        $("roi-strip").innerHTML =
          '<div><div class="k">Return on every<br>dollar of spend</div><div class="n">'+num(q.ret,2)+'×</div></div>'+
          '<div><div class="k">Net benefit per<br>stream per year</div><div class="n">'+money(q.perCam)+'</div></div>'+
          '<div><div class="k">Extra events<br>stopped per year</div><div class="n">'+num(q.intercepted,1)+'</div></div>';
      }
      var dq=document.querySelector(".roi-disc"); if(dq) dq.textContent=DISC[mode];
      renderBasis();
    }

    function renderBasis(){
      var common =
        '<h4>What is fixed</h4><ul>'+
        '<li>SentriOS is one flat rate per stream with every agent feature included — verification, voice-down deterrence, RapidSOS dispatch, two-way SMS, and incident documentation into Procore. No setup fee, no hardware, no tiers. It is an indicative planning rate for direct purchase, before any channel transfer discount, and it is not a quotation.</li>'+
        '<li><b>Every line in this ledger is already net of what you pay SentriOS.</b> There is no gross-spend line with the cost subtracted underneath — the monitoring line is the net movement itself, and every line below it is money you keep. Nothing is netted off anywhere you cannot see it.</li>'+
        '<li>Every other number on this page is yours to change. Nothing else is hard-coded into the result.</li>'+
        '<li>Incident response improves from a 20–30 minute operator queue to 13 seconds. That is stated as a capability, not converted into a dollar figure, because doing so would require an interdiction-probability assumption we have not measured.</li>'+
        '</ul>';

      var fleetB =
        '<h4>How the fleet model works</h4><ul>'+
        '<li>Monitoring is treated as your cost of goods, not your customer’s. The saving is the difference between what you pay per stream today and what you pay SentriOS, across monitored units only.</li>'+
        '<li>Contribution margin compares your rental revenue per trailer against the monitoring cost inside it. Other costs — the trailer, transport, power, service — are unchanged by SentriOS and are left out of both sides.</li>'+
        '<li><b>Technician time is a saving, not a cost.</b> SentriOS is a software overlay on cameras you already run, so a cut-over takes roughly fifteen minutes a trailer against the hours your current solution needs. It is credited once, in year one. If your trailers redeploy between sites during the year, this recurs and the model does not credit it.</li>'+
        '<li>Retention is credited only on the gap between the churn you enter and the churn we see on monitored SentriOS units — and then halved. Contracts won on response, recall and customer-defined agents default to zero; if you cannot name the bids, leave them there.</li>'+
        '<li>Three-year cumulative is year one plus two steady-state years. No price escalation, no fleet growth, no discounting applied.</li>'+
        '</ul>';

      var siteB =
        '<h4>How the job-site model works</h4><ul>'+
        '<li><b>The comparison is miss rate against miss rate.</b> Your current setup intercepts most events; the model credits SentriOS only with the difference between what you miss today and the 2% SentriOS misses.</li>'+
        '<li><b>If you have no monitoring today, enter $0.</b> The miss rate is then forced to 100% — nothing is intercepted before it happens — and the event count is set to three per site per year, the figure unmonitored sites tend to run at. That event count stays yours to change; the miss rate does not.</li>'+
        '<li>Events are entered <b>per site per year</b> and multiplied by site count, so the answer scales the way a portfolio actually does.</li>'+
        '<li><b>Cash and avoidance are never added together without a label.</b> The first line is a cancelled invoice — contractual, shown at full value. Everything below it is probabilistic: real across a portfolio and a year, lumpy on any single site, and discounted by 40% before it reaches the total. That discount is fixed rather than a slider, so the figure in front of you is not one anybody can quietly tune.</li>'+
        '<li>Reporting time is credited at a 90% reduction, not 100% — someone still reviews the report.</li>'+
        '<li>Year one is scaled by months live to reflect phased go-live.</li>'+
        '</ul>';

      var src =
        '<h4>Where the default assumptions come from</h4><ul>'+
        '<li>Traditional monitoring at $120–$250 per stream per month sits inside the $200–$400 range quoted across the remote-monitoring market; the conservative default deliberately uses the bottom of it, which understates the saving.</li>'+
        '<li>Construction equipment theft loss estimates draw on National Equipment Register and NICB reporting, with recovery rates below 25%. Downtime cost per event is a planning figure and should be replaced with your own standby and resequencing rates.</li>'+
        '<li>Go-live of two to four weeks on existing cameras and VMS is a SentriOS deployment standard, not a modelled assumption.</li>'+
        '</ul>'+
        '<h4>On the 2% miss rate, stated precisely</h4><ul>'+
        '<li>SentriOS publishes alert accuracy at or above 95% and a false-positive rate under 5%. Both describe <b>precision</b> — how many of the alerts we raise turn out to be real. Neither describes <b>recall</b> — how many real events we catch. They are different measurements, and one cannot be derived from the other.</li>'+
        '<li>The 2% used here is therefore <b>a planning assumption, not a published performance figure</b>. A validated recall benchmark, measured on a frozen stratified evaluation set, is in progress; when it exists it will replace this figure and the methodology will be published alongside it.</li>'+
        '<li>If you want the conservative reading, ignore every loss-avoidance line and look at the cash line on its own. The cash line does not depend on this number at all.</li>'+
        '</ul>'+
        '<h4>What this is not</h4><ul>'+
        '<li>Not a quotation, and not a guarantee. Bring your camera and VMS inventory to a working session and these inputs get replaced with your actual numbers.</li>'+
        '<li>Not an insurance calculation. Premium and deductible effects are excluded entirely, and for most portfolios they are additive to the figures shown.</li>'+
        '</ul>';

      $("roi-basis").innerHTML = common + (mode==="fleet"?fleetB:siteB) + src;
    }

    /* --- copy summary --- */
    function summary(){
      var s=S[mode], out=[];
      if(mode==="fleet"){
        var r=calcFleet(s);
        out.push("SENTRIOS ROI — TRAILER FLEET");
        out.push("Fleet: "+s.trailers+" trailers, "+pct(s.monPct)+" monitored ("+r.monitored+" units), "+s.cams+" streams each");
        out.push("Monitoring today: $"+num(s.rate)+"/stream/mo. All figures below are net of SentriOS.");
        out.push("");
        out.push("Cost of goods reduction:          "+money(r.cogsCut)+"   [contractual]");
        if(s.extra1>0) out.push("Won on response and recall (50%): "+money(r.extra1Adj));
        if(s.extra2>0) out.push("Won on custom agents (50%):       "+money(r.extra2Adj));
        out.push("Contracts retained:               "+money(r.churnAdj)+"   [probabilistic, 50% discount]");
        out.push("Technician time at cut-over:      "+money(r.deploySave)+"  (year one only)");
        out.push("");
        out.push("STEADY-STATE ANNUAL LIFT:         "+money(r.steady));
        out.push("YEAR ONE:                         "+money(r.y1));
        out.push("Contribution margin per trailer:  "+pct(r.mBefore)+" -> "+pct(r.mAfter));
        out.push("Trailers kept or won per year:    "+num(r.unitsGained,1));
      } else {
        var q=calcSite(s);
        out.push("SENTRIOS ROI — JOB SITES");
        out.push("Portfolio: "+s.sites+" active sites, "+s.cams+" cameras each ("+q.cams+" streams)");
        out.push("Monitoring today: $"+num(s.rate)+"/stream/mo. All figures below are net of SentriOS.");
        out.push("Events: "+num(s.inc,1)+"/site/yr, "+money(q.exposure)+" exposure each");
        out.push(q.noMon
          ? "No monitoring today: 100% missed, "+num(s.inc,1)+" events/site/yr assumed. SentriOS misses 2%."
          : "Miss rate today "+pct(q.missEff)+" vs 2% with SentriOS");
        out.push("");
        out.push("Monitoring cash, net:             "+money(q.cash)+"   [contractual]");
        out.push("Losses intercepted (risk-adj):    "+money(q.lossVal)+"   [probabilistic, 40% discount]");
        out.push("Reporting time recovered:         "+money(q.adminVal)+"   [probabilistic, 40% discount]");
        out.push("");
        out.push("NET ANNUAL BENEFIT:               "+money(q.net));
        out.push("Year one:                         "+money(q.y1));
        out.push("Return per dollar of spend:       "+num(q.ret,2)+"x");
        out.push("Extra events stopped per year:    "+num(q.intercepted,1));
      }
      out.push("");
      out.push("Assumption set: "+({cons:"Conservative",exp:"Expected",agg:"Aggressive"}[preset]));
      out.push("Every line above is already net of what you pay SentriOS.");
      out.push("[contractual] lines are invoices you cancel. [probabilistic] lines carry a stated discount.");
      out.push("The 2% SentriOS miss rate is a planning assumption, not a published benchmark.");
      out.push("Estimates only, based on the inputs above. Not a quotation.");
      return out.join("\n");
    }

    $("roi-copy").addEventListener("click",function(){
      var t=summary(), b=this;
      function done(){b.textContent="Copied";setTimeout(function(){b.textContent="Copy summary";},1600);}
      function fallback(){
        var ta=document.createElement("textarea"); ta.value=t;
        ta.style.position="fixed"; ta.style.opacity="0"; document.body.appendChild(ta);
        ta.select(); try{document.execCommand("copy");done();}catch(e){b.textContent="Press Ctrl+C";}
        document.body.removeChild(ta);
      }
      if(navigator.clipboard && window.isSecureContext){navigator.clipboard.writeText(t).then(done,fallback);}
      else fallback();
    });

    /* --- capture ---------------------------------------------------------
       Point CAPTURE_ENDPOINT at the roi-capture Cloudflare Worker to record
       submissions in the Airtable CRM. Null means nothing leaves the browser.
       Either way the summary opens in the visitor's own mail client and the
       result on screen is never gated behind the address. */
    var CAPTURE_ENDPOINT = null;   // e.g. "https://roi-capture.<sub>.workers.dev"

    function capture(email, quiet){
      if(!CAPTURE_ENDPOINT) return Promise.resolve();
      var r = mode==="fleet" ? calcFleet(S.fleet) : calcSite(S.site);
      var payload = {
        email: email || "", mode: mode, preset: preset, inputs: S[mode],
        headline: mode==="fleet" ? r.steady : r.net,
        yearOne: r.y1, summary: summary(),
        page: location.pathname, referrer: document.referrer || "",
        company_website: ($("roi-company-website")||{}).value || ""
      };
      var req = fetch(CAPTURE_ENDPOINT,{method:"POST",keepalive:!!quiet,
        headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
      // quiet: the anonymous on-leave log, which must never surface an error
      if(quiet) return req.catch(function(){});
      return req.then(function(res){
        if(!res.ok) throw new Error("store_failed");
        return res.json().catch(function(){ return {ok:true}; });
      }).then(function(d){ if(d && d.ok===false) throw new Error(d.error||"failed"); });
    }

    /* The panel only appears once there is somewhere for a submission to go.
       With CAPTURE_ENDPOINT null it stays hidden rather than promising an email
       nobody will receive. */
    var sendBox = $("roi-send");
    if(CAPTURE_ENDPOINT && sendBox){
      sendBox.hidden = false;
      var busy = false;
      var send = function(){
        if(busy) return;
        var el=$("roi-send-email"), email=el.value.trim(), msg=$("roi-send-msg"), btn=$("roi-send-btn");
        if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
          msg.className="msg err";
          msg.textContent="That address doesn't look right.";
          el.focus(); return;
        }
        busy=true; btn.disabled=true;
        msg.className="msg"; msg.textContent="Sending\u2026";
        capture(email, false).then(function(){
          msg.className="msg";
          msg.textContent="On its way to "+email+".";
          el.value="";
        }).catch(function(){
          msg.className="msg err";
          msg.innerHTML='That didn\u2019t send. Email us at <a href="mailto:info@sentrios.ai">info@sentrios.ai</a> and we\u2019ll send it over.';
        }).then(function(){ busy=false; btn.disabled=false; });
      };
      $("roi-send-btn").addEventListener("click", send);
      $("roi-send-email").addEventListener("keydown", function(e){ if(e.key==="Enter"){ e.preventDefault(); send(); } });
    }

    /* --- mode + preset --- */
    function setMode(m){
      mode=m;
      $("roi-m-fleet").setAttribute("aria-pressed", m==="fleet");
      $("roi-m-site").setAttribute("aria-pressed", m==="site");
      renderInputs(); render();
    }
    $("roi-m-fleet").addEventListener("click",function(){setMode("fleet");});
    $("roi-m-site").addEventListener("click",function(){setMode("site");});

    Array.prototype.forEach.call(document.querySelectorAll("[data-roi-p]"),function(b){
      b.addEventListener("click",function(){
        preset=b.getAttribute("data-roi-p");
        Array.prototype.forEach.call(document.querySelectorAll("[data-roi-p]"),function(x){
          x.setAttribute("aria-pressed", x===b);
        });
        S.fleet=copy(P.fleet[preset]); S.site=copy(P.site[preset]);
        renderInputs(); render();
      });
    });

    /* One anonymous log per visit, on leave, and only if they moved something.
       No address attached — this is the input distribution, not a lead. */
    var touched=false;
    document.getElementById("roi-inputs").addEventListener("input",function(){touched=true;});
    document.querySelectorAll("[data-roi-p], #roi-m-fleet, #roi-m-site").forEach(function(b){
      b.addEventListener("click",function(){touched=true;});
    });
    var logged=false;
    document.addEventListener("visibilitychange",function(){
      if(document.visibilityState==="hidden" && touched && !logged){ logged=true; capture("", true); }
    });

    setMode("fleet");
  })();
  }
})();
