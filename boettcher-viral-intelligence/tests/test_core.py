import unittest, tempfile, os
from pathlib import Path
from app import core
class CoreTests(unittest.TestCase):
 def setUp(self):
  self.temp=tempfile.TemporaryDirectory()
  core.HOME=Path(self.temp.name);core.DB=core.HOME/'data.sqlite3';core.SEARXNG_URL='';core.OLLAMA_URL=''
 def tearDown(self):self.temp.cleanup()
 def test_reference_without_metrics(self):
  r=core.save_reference({'url':'https://www.instagram.com/reel/TEST/','title':'Prueba'})
  self.assertIsNone(r['views']);self.assertEqual(r['views_source'],'unavailable')
 def test_verified_manual_metrics(self):
  r=core.save_reference({'url':'https://www.instagram.com/reel/TEST/','title':'Prueba','views':12500})
  self.assertEqual(r['views'],12500);self.assertEqual(r['views_source'],'manual_public')
 def test_research_offline(self):
  r=core.research('seguro arriendo');self.assertEqual(r['mode'],'manual');self.assertEqual(r['results'],[])
 def test_project(self):
  p=core.create_project('seguro de arriendo',45)
  self.assertEqual(p['storyboard']['duration'],45);self.assertEqual(len(p['brief']['hooks']),10)
  self.assertEqual(p['storyboard']['topic'],'seguro de arriendo')
  self.assertEqual(len(p['storyboard']['chapters']),5);self.assertIsNotNone(core.get_project(p['id']))
 def test_project_includes_relevant_public_reference(self):
  url='https://youtu.be/example'
  core.save_reference({'url':url,'title':'Protección de ingresos por arriendo'})
  project=core.create_project('Los riesgos de arrendar un departamento sin seguro de arriendo en Chile')
  self.assertEqual([r['url'] for r in project['brief']['references']],[url])
 def test_blank_project(self):
  with self.assertRaises(ValueError):core.create_project('  ')
 def test_invalid(self):
  with self.assertRaises(ValueError):core.save_reference({'url':'file:///etc/passwd'})
if __name__=='__main__':unittest.main()
