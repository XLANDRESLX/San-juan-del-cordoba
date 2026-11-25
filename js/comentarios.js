// Comentarios públicos: lectura y envío conectados a Google Apps Script.
(function () {
  'use strict';
  const form=document.getElementById('formComentario');
  const list=document.getElementById('listaComentarios');
  if(!form||!list) return;
  const getArticleId=()=>form.querySelector('[name="articulo_id"]')?.value || '';
  const make=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
  async function cargarComentarios(){
    const id=getArticleId(); if(!id||!window.sanjuanAPI)return;
    list.textContent='Cargando comentarios…';
    try{
      const response=await window.sanjuanAPI.getComentarios(id);
      const entries=(response.data||[]).filter(c=>String(c.aprobado).toLowerCase()==='si');
      list.replaceChildren();
      if(!entries.length){list.append(make('p','comentarios__vacio','Sé el primero en comentar.'));return;}
      entries.forEach(c=>{const item=make('article','comentario');item.append(make('strong','',c.nombre||'Visitante'));const d=new Date(c.fecha);if(c.fecha&&!Number.isNaN(d.getTime())){const time=make('time','',d.toLocaleDateString('es-CO'));time.dateTime=d.toISOString();item.append(time);}item.append(make('p','',c.comentario||''));list.append(item);});
    }catch(error){list.textContent='No se pudieron cargar los comentarios.';}
  }
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    if(!getArticleId()){list.textContent='Espera a que se cargue la publicación antes de comentar.';return;}
    const button=form.querySelector('button[type="submit"]');const original=button?.textContent;
    if(button){button.disabled=true;button.textContent='Enviando…';}
    try{
      const values=Object.fromEntries(new FormData(form));
      const response=await window.sanjuanAPI.enviarComentario(values);
      if(response.status==='success'){form.reset();const hidden=form.querySelector('[name="articulo_id"]');if(hidden)hidden.value=getArticleId()||values.articulo_id;list.textContent=response.message||'Tu comentario fue enviado y podrá requerir aprobación.';}
      else list.textContent=response.message||'No fue posible enviar el comentario.';
    }catch(error){list.textContent='Error de conexión al enviar el comentario.';}
    finally{if(button){button.disabled=false;button.textContent=original;}}
  });
  window.sanjuanComentarios={cargar:cargarComentarios};
})();
