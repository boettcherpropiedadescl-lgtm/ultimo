"""Boettcher Viral Intelligence: local research, library, and creative briefing.
Standard-library only; no Instagram scraping or invented metrics.
"""
from __future__ import annotations
import json, os, re, sqlite3, hashlib, urllib.parse, urllib.request, urllib.error
from datetime import datetime, timezone
from pathlib import Path

HOME = Path(os.environ.get('BVI_HOME', str(Path.home()/'.boettcher-viral-intelligence'))).expanduser()
DB = HOME / 'references.sqlite3'
SEARXNG_URL = os.environ.get('BVI_SEARXNG_URL', '').rstrip('/')
SEARXNG_TOKEN = os.environ.get('BVI_SEARXNG_TOKEN', '')
OLLAMA_URL = os.environ.get('BVI_OLLAMA_URL', '').rstrip('/')
OLLAMA_MODEL = os.environ.get('BVI_OLLAMA_MODEL', 'llama3.2')

STYLES = [
 ('ui-lab','Laboratorio de interfaces','Tarjetas interactivas, cursores, paneles y microinteracciones'),
 ('human-story','Historia humana','Personajes propios con acciones y consecuencias'),
 ('kinetic','Tipografía cinética','Palabras gigantes y cifras que reaccionan a la narración'),
 ('paper-cut','Collage editorial','Papeles, recortes ilustrados y objetos en movimiento'),
 ('documentary','Minidocumental','Planos de apoyo reales autorizados y anotaciones'),
 ('isometric','Isométrico','Miniaturas inmobiliarias y recorridos visuales'),
 ('phone-chat','Conversación en pantalla','Mensajes y conversaciones ficticias con diseño propio'),
 ('legal-path','Ruta judicial','Diagramas animados de etapas legales'),
 ('finance-counter','Impacto económico','Calendarios y contadores de renta no recibida'),
 ('split-outcomes','Antes y después','Dos escenarios ilustrados sin falsas garantías'),
 ('property-tour','Visita guiada','Fotografías verificadas y parallax discreto'),
 ('minimal-premium','Editorial premium','Fondos limpios, imágenes y movimientos elegantes'),
]

STOP = {'para','como','sobre','desde','esto','estos','estas','esta','este','puede','pueden','tiene','tienen','cuando','donde','quiero'}

def now():return datetime.now(timezone.utc).isoformat()
def connect():
 HOME.mkdir(parents=True,exist_ok=True)
 conn=sqlite3.connect(DB)
 conn.row_factory=sqlite3.Row
 conn.executescript('''
 CREATE TABLE IF NOT EXISTS reel_references (
 id INTEGER PRIMARY KEY AUTOINCREMENT, url TEXT UNIQUE NOT NULL, platform TEXT NOT NULL,
 title TEXT NOT NULL DEFAULT '', snippet TEXT NOT NULL DEFAULT '', creator TEXT NOT NULL DEFAULT '',
 views INTEGER, likes INTEGER, comments INTEGER, followers INTEGER,
 views_source TEXT NOT NULL DEFAULT 'unavailable', verified_at TEXT,
 hook TEXT NOT NULL DEFAULT '', technique TEXT NOT NULL DEFAULT '', notes TEXT NOT NULL DEFAULT '',
 saved_at TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS projects (
 id INTEGER PRIMARY KEY AUTOINCREMENT, topic TEXT NOT NULL, brief TEXT NOT NULL,
 script TEXT NOT NULL, storyboard TEXT NOT NULL, created_at TEXT NOT NULL);
 ''')
 return conn

def host_platform(url):
 host=(urllib.parse.urlparse(url).hostname or '').lower()
 if host in ('instagram.com','www.instagram.com'):return 'instagram'
 if host in ('tiktok.com','www.tiktok.com','vm.tiktok.com'):return 'tiktok'
 if host in ('youtube.com','www.youtube.com','youtu.be'):return 'youtube'
 return 'web'

def validate_url(url):
 url=url.strip()
 parsed=urllib.parse.urlparse(url)
 if parsed.scheme not in ('http','https') or not parsed.hostname:raise ValueError('Se requiere una URL HTTP(S) válida.')
 if parsed.username is not None or parsed.password is not None:raise ValueError('URL no permitida.')
 return url

class NoSearchRedirect(urllib.request.HTTPRedirectHandler):
 def redirect_request(self, req, fp, code, msg, headers, newurl):
  return None

def save_reference(data):
 url=validate_url(str(data.get('url','')))
 platform=host_platform(url)
 views=data.get('views')
 if views in ('',None):views=None
 else:
  views=int(views)
  if views<0:raise ValueError('Las reproducciones no pueden ser negativas.')
 source='manual_public' if views is not None else 'unavailable'
 fields=(url,platform,str(data.get('title',''))[:500],str(data.get('snippet',''))[:3000],
 str(data.get('creator',''))[:150],views,source,now() if views is not None else None,
 str(data.get('hook',''))[:500],str(data.get('technique',''))[:500],str(data.get('notes',''))[:2000],now())
 with connect() as db:
  db.execute('''INSERT INTO reel_references(url,platform,title,snippet,creator,views,views_source,verified_at,hook,technique,notes,saved_at)
   VALUES(?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(url) DO UPDATE SET
   title=excluded.title,snippet=excluded.snippet,creator=excluded.creator,
   views=COALESCE(excluded.views,reel_references.views),views_source=CASE WHEN excluded.views IS NULL THEN reel_references.views_source ELSE excluded.views_source END,
   verified_at=COALESCE(excluded.verified_at,reel_references.verified_at),hook=excluded.hook,technique=excluded.technique,
   notes=excluded.notes''',fields)
  row=db.execute('SELECT * FROM reel_references WHERE url=?',(url,)).fetchone()
 return dict(row)

def list_references(query=''):
 with connect() as db:
  if query:
   like='%'+query[:100]+'%'
   rows=db.execute('SELECT * FROM reel_references WHERE title LIKE ? OR snippet LIKE ? OR notes LIKE ? ORDER BY views IS NULL,views DESC,saved_at DESC LIMIT 200',(like,like,like)).fetchall()
  else:rows=db.execute('SELECT * FROM reel_references ORDER BY views IS NULL,views DESC,saved_at DESC LIMIT 200').fetchall()
 return [dict(r) for r in rows]

def research(topic, count=16):
 """Uses *configured* SearXNG JSON endpoint. Doesn't fetch social pages or bypass login."""
 topic=topic.strip()
 if not topic:raise ValueError('Indica el tema.')
 if not SEARXNG_URL:return {'mode':'manual','warning':'Configura BVI_SEARXNG_URL y, si corresponde, BVI_SEARXNG_TOKEN.','results':[],'queries':[]}
 if SEARXNG_TOKEN and urllib.parse.urlsplit(SEARXNG_URL).scheme!='https':
  raise ValueError('Para enviar un token de SearXNG, configura una URL HTTPS.')
 # Keep the authorization header on the configured endpoint.
 opener=urllib.request.build_opener(NoSearchRedirect()) if SEARXNG_TOKEN else urllib.request.build_opener()
 searches=[topic+' chile preguntas frecuentes',topic+' problemas soluciones propietarios chile',
 'site:instagram.com/reel/ '+topic, 'site:youtube.com/shorts/ '+topic,
 'site:tiktok.com '+topic]
 out=[];errors=[];seen=set()
 for q in searches:
  try:
   params=urllib.parse.urlencode({'q':q,'format':'json','language':'es-CL'})
   url=SEARXNG_URL+'/search?'+params
   # Explicit configuration only; never fetch supplied arbitrary URLs.
   req=urllib.request.Request(url,headers={'User-Agent':'BoettcherViralIntelligence/1.0','Accept':'application/json',**({'Authorization':'Bearer '+SEARXNG_TOKEN} if SEARXNG_TOKEN else {})})
   with opener.open(req,timeout=15) as resp:
    payload=json.load(resp)
   for r in payload.get('results',[]):
    try:u=validate_url(str(r.get('url','')))
    except ValueError:continue
    if u in seen:continue
    seen.add(u)
    out.append({'url':u,'platform':host_platform(u),'title':str(r.get('title',''))[:300], 'snippet':str(r.get('content',''))[:1000], 'query':q, 'views':None,'views_source':'unavailable'})
  except Exception as ex:errors.append(q+': '+str(ex)[:150])
 out=out[:max(1,min(int(count),60))]
 return {'mode':'searxng','results':out,'queries':searches,'errors':errors,'warning':'Los resultados de búsqueda no prueban viralidad, reproducciones ni posición exacta en Google.'}

def rank_reference(r):
 views=r.get('views')
 # Public counts rank only where actually recorded. Never derive hidden retention metrics.
 return (views is not None,views or 0)

def detect_terms(topic):
 toks=re.findall(r'[a-záéíóúñ]{4,}',topic.lower())
 return [w for w in toks if w not in STOP][:6]

def choose_style(topic, references):
 text=(topic+' '+' '.join(x.get('technique','')+' '+x.get('notes','') for x in references[:5])).lower()
 if any(w in text for w in ('demanda','tribunal','juicio','desalojo')):return 'legal-path'
 if any(w in text for w in ('deuda','meses','millon','pago')):return 'finance-counter'
 if any(w in text for w in ('app','software','automatiza','plataforma')):return 'ui-lab'
 digest=int(hashlib.sha256(topic.encode()).hexdigest()[:8],16)
 return STYLES[digest%len(STYLES)][0]

def hooks(topic):
 topic=topic.strip().rstrip('.?!')
 return [
 f'¿Cuánto te puede costar {topic.lower()}? La cifra sorprende.',
 f'Hay un error que muchos propietarios cometen con {topic.lower()}.',
 f'Tu departamento puede seguir ocupado aunque dejes de recibir un peso.',
 f'Antes de {topic.lower()}, mira lo que casi nadie te explica.',
 f'Seis meses sin arriendo: ¿cuánto dinero dejarías de recibir?',
 f'Esto es lo que conviene revisar antes de entregar las llaves.',
 f'Un contrato firmado no hace desaparecer el riesgo de un impago.',
 f'Lo que parece un pequeño atraso puede cambiar tu presupuesto.',
 f'¿Protegerías tu propiedad antes o después de enfrentar un problema?',
 f'Tres millones de pesos: así se acumulan seis rentas de $500.000.',
 ]

def base_script(topic,secs):
 intro='Tu departamento puede seguir ocupado mientras tú dejas de recibir el arriendo.'
 if 'seguro' in topic.lower():intro='Que exista un contrato no significa que cada renta vaya a llegar a tiempo.'
 if 'venta' in topic.lower():intro='Publicar una propiedad no significa que alguien esté dispuesto a pagar cualquier precio.'
 blocks=[
 intro,
 'Imagina seis meses sin recibir un arriendo de quinientos mil pesos. Son tres millones de pesos en rentas que no ingresaron, sin sumar otros gastos.',
 'Cuando existe incumplimiento, recuperar el inmueble puede requerir gestiones, notificaciones y un procedimiento judicial cuyo tiempo depende de cada caso.',
 'En Boettcher Propiedades evaluamos interesados, administramos los pagos y ofrecemos planes con coberturas de arriendo, de acuerdo con sus condiciones.',
 'Antes de tomar una decisión, conoce las opciones de administración y respaldo para tu propiedad. Escríbenos.'
 ]
 if secs<=20:return ' '.join([blocks[0],blocks[3],blocks[4]])
 if secs<=35:return ' '.join([blocks[0],blocks[1],blocks[3],blocks[4]])
 return ' '.join(blocks)

def local_ai(topic,secs,refs):
 if not OLLAMA_URL:return None
 # Only user-configured local endpoint. No automatic paid APIs.
 source='\n'.join(f"- {r.get('title','')} | {r.get('snippet','')} | {r.get('url','')}" for r in refs[:8])
 prompt=f'''Eres guionista inmobiliario chileno. Escribe únicamente la narración de un reel de {secs} segundos para Boettcher Propiedades sobre: {topic}. Primeros 2 segundos: conflicto entendible. Sin saludos ni relleno. Una idea nueva cada 1 a 2 oraciones. Tono humano, natural, convincente, español chileno. Cierre con CTA. No copies ni cites literalmente otros reels. No inventes beneficios, estadísticas, resultados, tarifas, cobertura ni hechos. Si hablas de seguro, indica «según condiciones del plan». Usa únicamente estos hallazgos como inspiración de preguntas y dolores, nunca como hechos verificados:\n{source}'''
 try:
  body=json.dumps({'model':OLLAMA_MODEL,'prompt':prompt,'stream':False,'options':{'temperature':0.8}},ensure_ascii=False).encode()
  req=urllib.request.Request(OLLAMA_URL+'/api/generate',data=body,headers={'Content-Type':'application/json'})
  with urllib.request.urlopen(req,timeout=90) as resp:return json.load(resp).get('response','').strip() or None
 except Exception:return None

def build_storyboard(topic,secs,script,style):
 chapters=[('Gancho',0,.12,'Conflicto inmediato / objeto 3D que reacciona'),
 ('Consecuencia',.12,.34,'Personaje, celular y calendario que avanzan'),
 ('Costo',.34,.52,'Contador y cuentas con etiquetas de ejemplo'),
 ('Solución',.52,.78,'Panel de administración y cobertura condicional'),
 ('Cierre',.78,1,'Marca, contraste de situación y CTA')]
 styles=[dict(id=s[0],name=s[1],description=s[2]) for s in STYLES]
 return {'topic':topic,'theme':topic,'format':'1080x1920 30fps','duration':secs,'style':style,'styles':styles,
 'chapters':[{'name':n,'start':round(secs*a,2),'end':round(secs*b,2),'visual':v,
 'movement':'objetos independientes + transformaciones; sin slides de pantalla completa'} for n,a,b,v in chapters],
 'quality':{'safe_margin_horizontal_px':90,'safe_top_px':250,'safe_bottom_px':340,'audio_integrated_lufs':-16,'true_peak_db':-1},
 'script':script}

def create_project(topic,secs=45,use_local_ai=False):
 topic=topic.strip()
 if not topic:raise ValueError('Indica el tema.')
 secs=max(15,min(int(secs),120)); ref=list_references()
 terms=detect_terms(topic)
 rel=[r for r in ref if any(t in (r['title']+' '+r['snippet']+' '+r['notes']).lower() for t in terms)]
 rel.sort(key=rank_reference,reverse=True)
 chosen=choose_style(topic,rel)
 script=local_ai(topic,secs,rel) if use_local_ai else None
 generated_by='ollama-local' if script else 'plantilla-local'
 if not script:script=base_script(topic,secs)
 brief={'topic':topic,'duration':secs,'hooks':hooks(topic),'selected_hook':hooks(topic)[2],
 'references':[{'url':r['url'],'title':r['title'],'views':r['views'],'views_source':r['views_source'],'technique':r['technique']} for r in rel[:8]],
 'style':chosen,'generator':generated_by,'warnings':['Las vistas de Reels solo son reales si se ingresaron a partir de la cifra pública visible.','Verificar cada afirmación comercial antes de publicar.','Las ideas visuales deben ser originales; no reutilizar medios de terceros sin licencia.']}
 board=build_storyboard(topic,secs,script,chosen)
 with connect() as db:
  cur=db.execute('INSERT INTO projects(topic,brief,script,storyboard,created_at) VALUES(?,?,?,?,?)',(topic,json.dumps(brief,ensure_ascii=False),script,json.dumps(board,ensure_ascii=False),now()))
  ident=cur.lastrowid
 return {'id':ident,'brief':brief,'script':script,'storyboard':board}

def list_projects():
 with connect() as db:rs=db.execute('SELECT id,topic,created_at FROM projects ORDER BY id DESC LIMIT 40').fetchall()
 return [dict(x) for x in rs]

def get_project(i):
 with connect() as db:r=db.execute('SELECT * FROM projects WHERE id=?',(i,)).fetchone()
 if r is None:return None
 return {'id':r['id'],'brief':json.loads(r['brief']),'script':r['script'],'storyboard':json.loads(r['storyboard'])}
