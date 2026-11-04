(function(){
  var $=function(id){return document.getElementById(id)};
  var rp=function(n){return "Rp"+Math.round(n).toLocaleString("id-ID")};
  var reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var lastText="";

  function fmtInput(e){
    var d=e.target.value.replace(/\D/g,"").slice(0,12);
    e.target.value=d?Number(d).toLocaleString("id-ID"):"";
  }
  var num=function(id){return Number($(id).value.replace(/\./g,""))||0};
  $("gaji").addEventListener("input",fmtInput);
  $("tunj").addEventListener("input",fmtInput);

  /* Tabel pengali: [jumlah jam, pengali] berurutan */
  function jadwal(sis,hari,libur){
    if(hari==="biasa") return {s:[[1,1.5],[99,2]],batas:4};
    if(sis==="5") return {s:[[8,2],[1,3],[3,4]],batas:12};
    if(hari==="minggu") return {s:[[7,2],[1,3],[3,4]],batas:11};
    if(libur) return {s:[[5,2],[1,3],[3,4]],batas:9};
    return {s:[[1,1.5],[99,2]],batas:4};
  }
  function pengali(s,n){ /* n = jam ke-n (mulai 1) */
    var acc=0;
    for(var i=0;i<s.length;i++){acc+=s[i][0];if(n<=acc)return s[i][1]}
    return s[s.length-1][1];
  }

  function rowHtml(){
    var w=document.createElement("div");
    w.className="entry";
    w.innerHTML=
      '<div><label>Hari</label><select class="hari"><option value="biasa">Hari kerja biasa (Senin sampai Jumat)</option><option value="sabtu">Sabtu</option><option value="minggu">Minggu</option></select></div>'+
      '<div><label class="jl">Jumlah jam lembur</label><input class="jam" type="number" min="0.5" max="24" step="0.5" placeholder="4"></div>'+
      '<button type="button" class="del" aria-label="Hapus hari lembur">Hapus</button>'+
      '<label class="chk"><input type="checkbox" class="libur"> Bertepatan dengan hari libur resmi</label>';
    w.querySelector(".del").onclick=function(){
      if($("entries").children.length>1) w.remove();
    };
    w.querySelector(".hari").onchange=function(){sync(w)};
    sync(w);
    return w;
  }
  function sync(w){
    var biasa=w.querySelector(".hari").value==="biasa";
    var sis=document.querySelector("input[name=sis]:checked").value;
    w.querySelector(".jl").textContent=biasa?"Total jam kerja hari itu (normal "+(sis==="5"?8:7)+" jam)":"Jumlah jam lembur";
    w.querySelector(".jam").placeholder=biasa?"12":"4";
    w.querySelector(".chk").hidden=biasa;
  }
  [].forEach.call(document.querySelectorAll("input[name=sis]"),function(r){r.onchange=function(){[].forEach.call($("entries").children,sync)}});
  $("entries").appendChild(rowHtml());
  $("add").onclick=function(){
    if($("entries").children.length<6) $("entries").appendChild(rowHtml());
  };

  function countUp(el,to){
    if(reduce){el.textContent=rp(to);return}
    var t0=performance.now(),dur=700;
    (function f(t){
      var p=Math.min(1,(t-t0)/dur);
      el.textContent=rp(to*(1-Math.pow(1-p,3)));
      if(p<1) requestAnimationFrame(f);
    })(t0);
  }

  $("go").onclick=function(){
    var err=$("err");err.textContent="";
    var sebulan=num("gaji")+num("tunj");
    if(num("gaji")<=0){err.textContent="Isi gaji pokok dengan angka lebih dari 0.";$("gaji").focus();return}
    var sis=document.querySelector("input[name=sis]:checked").value;
    var rows=[].slice.call($("entries").children);
    var data=[];
    for(var i=0;i<rows.length;i++){
      var j=parseFloat(rows[i].querySelector(".jam").value),hr=rows[i].querySelector(".hari").value,tot=j;
      if(!(j>0)){err.textContent=(hr==="biasa"?"Isi total jam kerja":"Isi jumlah jam lembur")+" pada hari ke-"+(i+1)+".";rows[i].querySelector(".jam").focus();return}
      if(j>24){err.textContent="Jumlah jam tidak boleh lebih dari 24.";return}
      if(hr==="biasa"){
        var normal=sis==="5"?8:7;
        j=j-normal;
        if(j<=0){err.textContent="Hari ke-"+(i+1)+": total jam kerja belum melewati jam normal ("+normal+" jam), jadi belum ada lembur.";rows[i].querySelector(".jam").focus();return}
      }
      data.push({hari:hr,libur:hr!=="biasa"&&rows[i].querySelector(".libur").checked,jam:j,total:tot});
    }
    var sejam=sebulan/173,total=0,html="",warns="",txt=[];
    txt.push("Kalkulator Penghitung Lembur by Kahfi");
    txt.push("Upah sebulan "+rp(sebulan)+", upah sejam "+rp(sejam)+" (1/173), sistem "+sis+" hari kerja");
    data.forEach(function(d,k){
      var jd=jadwal(sis,d.hari,d.libur),sub=0,body="";
      var nama=d.hari==="biasa"?"Hari kerja biasa (kerja "+String(d.total).replace(".",",")+" jam)":(d.hari==="sabtu"?"Sabtu":"Minggu")+(d.libur?" (libur resmi)":"");
      for(var h=1;h<=Math.ceil(d.jam);h++){
        var dur=Math.min(1,d.jam-(h-1)),m=pengali(jd.s,h),nom=dur*m*sejam;
        sub+=nom;
        var c="m"+(m===1.5?1:m);
        body+='<tr><td>Jam ke-'+h+(dur<1?' ('+String(dur).replace(".",",")+' jam)':'')+'</td><td class="'+c+'">'+String(m).replace(".",",")+' ×</td><td class="r">'+rp(nom)+'</td></tr>';
      }
      total+=sub;
      html+='<div class="scroll"><table><caption>'+nama+', lembur '+String(d.jam).replace(".",",")+' jam</caption>'+
        '<thead><tr><th>Jam</th><th>Pengali</th><th class="r">Nominal</th></tr></thead><tbody>'+body+
        '<tr><td colspan="2"><b>Subtotal</b></td><td class="r"><b>'+rp(sub)+'</b></td></tr></tbody></table></div>';
      txt.push(nama+", lembur "+d.jam+" jam: "+rp(sub));
      if(d.jam>jd.batas){
        if(jd.batas===4) warns+='<p class="warn">'+nama+': lembur harian maksimal 4 jam. Jam di atas itu tetap dihitung dengan pengali 2 ×, tetapi mungkin tidak sesuai batas aturan.</p>';
        else warns+='<p class="warn">'+nama+': jam melebihi '+jd.batas+' jam, di luar tabel pengali umum. Pengali terakhir (4 ×) tetap dipakai, mohon cek ketentuan perusahaan Anda.</p>';
      }
    });
    txt.push("Total upah lembur: "+rp(total));
    lastText=txt.join("\n");
    $("sejam").textContent=rp(sejam);
    $("sebulan").textContent=rp(sebulan);
    $("formula").innerHTML="Rumus: upah sejam = 1/173 × "+rp(sebulan)+" = <b>"+rp(sejam)+"</b>. Nominal per jam = durasi × pengali × upah sejam.";
    $("tables").innerHTML=html;
    $("warns").innerHTML=warns;
    $("out").hidden=false;
    countUp($("total"),total);
    $("out").scrollIntoView({behavior:reduce?"auto":"smooth",block:"start"});
  };

  $("reset").onclick=function(){
    $("gaji").value="";$("tunj").value="";$("err").textContent="";
    document.querySelector("input[name=sis][value='5']").checked=true;
    $("entries").innerHTML="";$("entries").appendChild(rowHtml());
    $("out").hidden=true;
  };

  $("copy").onclick=function(){
    var b=$("copy");
    function ok(){b.textContent="Tersalin";setTimeout(function(){b.textContent="Salin hasil"},1800)}
    try{
      navigator.clipboard.writeText(lastText).then(ok,function(){fallback()});
    }catch(e){fallback()}
    function fallback(){
      var t=document.createElement("textarea");t.value=lastText;document.body.appendChild(t);t.select();
      try{document.execCommand("copy");ok()}catch(e){b.textContent="Gagal menyalin"}
      t.remove();
    }
  };
})();
