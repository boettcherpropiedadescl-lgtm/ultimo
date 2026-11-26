"""Run with: python -m app.server --port 8787 (Python 3.10+)."""
import argparse, json
from http.server import BaseHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit,parse_qs
from . import core

HERE=Path(__file__).resolve().parent
class Handler(BaseHTTPRequestHandler):
 def respond(self,body,status=200,ctype='application/json; charset=utf-8'):
  data=(json.dumps(body,ensure_ascii=False).encode('utf-8') if not isinstance(body,(bytes,bytearray)) else body)
  self.send_response(status)
  self.send_header('Content-Type',ctype)
  self.send_header('Content-Length',str(len(data)))
  self.send_header('Cache-Control','no-store')
  self.send_header('X-Content-Type-Options','nosniff')
  self.send_header('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self' data:; object-src 'none'; frame-ancestors 'none'")
  self.end_headers();self.wfile.write(data)
 def do_GET(self):
  u=urlsplit(self.path);q=parse_qs(u.query)
  try:
   if u.path=='/':return self.respond((HERE/'index.html').read_bytes(),ctype='text/html; charset=utf-8')
   if u.path=='/ui.js':return self.respond((HERE/'ui.js').read_bytes(),ctype='application/javascript; charset=utf-8')
   if u.path=='/ui.css':return self.respond((HERE/'ui.css').read_bytes(),ctype='text/css; charset=utf-8')
   if u.path=='/api/status':return self.respond({'ok':True,'search_configured':bool(core.SEARXNG_URL),'ollama_configured':bool(core.OLLAMA_URL),'storage':str(core.DB),'styles':[{'id':s[0],'name':s[1],'description':s[2]} for s in core.STYLES]})
   if u.path=='/api/references':return self.respond(core.list_references(q.get('q',[''])[0]))
   if u.path=='/api/projects':return self.respond(core.list_projects())
   if u.path.startswith('/api/projects/'):
    p=core.get_project(int(u.path.rsplit('/',1)[-1]));return self.respond(p,200 if p else 404)
   return self.respond({'error':'Ruta no encontrada'},404)
  except Exception as e:return self.respond({'error':str(e)},400)
 def do_POST(self):
  try:
   if self.headers.get_content_type()!='application/json':
    return self.respond({'error':'Se requiere application/json'},415)
   if int(self.headers.get('Content-Length','0'))>150000:return self.respond({'error':'Solicitud demasiado grande'},413)
   obj=json.loads(self.rfile.read(int(self.headers.get('Content-Length','0'))) or b'{}')
   if not isinstance(obj,dict):raise ValueError('Objeto JSON requerido')
   if self.path=='/api/research':return self.respond(core.research(str(obj.get('topic',''))))
   if self.path=='/api/references':return self.respond(core.save_reference(obj),201)
   if self.path=='/api/projects':return self.respond(core.create_project(str(obj.get('topic','')),obj.get('seconds',45),bool(obj.get('ollama',False))),201)
   return self.respond({'error':'Ruta no encontrada'},404)
  except Exception as e:return self.respond({'error':str(e)},400)
 def log_message(self,*args):pass

def main():
 parser=argparse.ArgumentParser();parser.add_argument('--port',type=int,default=8787);parser.add_argument('--host',default='127.0.0.1');args=parser.parse_args()
 if args.host not in ('127.0.0.1','localhost','::1'):parser.error('Solo escucha en localhost; usa túnel SSH autenticado para acceder remotamente.')
 core.connect().close()
 srv=ThreadingHTTPServer(('127.0.0.1',args.port),Handler)
 print(f'Boettcher Viral Intelligence disponible en http://127.0.0.1:{args.port}',flush=True)
 try:srv.serve_forever()
 except KeyboardInterrupt:pass
if __name__=='__main__':main()
