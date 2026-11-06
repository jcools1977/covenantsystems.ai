"""Regenerate checked-in public schema and Markdown from the visible site and public facts."""
from pathlib import Path
import json,re
from public_markdown import Markdown
root=Path(__file__).resolve().parents[1]
facts=json.loads((root/'site.json').read_text())
origin=facts['canonicalUrl'].rstrip('/')
service=facts['service']
graph=[{'@type':'Organization','@id':origin+'/#organization','name':facts['name'],'legalName':facts['legalOperator'],'url':origin,'email':facts['contact']},
 {'@type':'WebSite','@id':origin+'/#website','url':origin,'name':facts['name'],'publisher':{'@id':origin+'/#organization'}},
 {'@type':'Service','@id':origin+'/#blueprint-service','name':service['name'],'url':service['url'],'serviceType':'Business transformation discovery and implementation planning','description':'A paid 45-day discovery engagement to map workflows, prioritize opportunities and prepare an implementation plan. Scope, fees and kickoff agreed in writing. Implementation scoped separately.','provider':{'@id':origin+'/#organization'},'audience':{'@type':'BusinessAudience','audienceType':', '.join(service['audience'])}}]
p=root/'index.html';html=p.read_text()
html=re.sub(r'<script id="discovery-jsonld" type="application/ld\+json">.*?</script>', '<!-- DISCOVERY_SCHEMA -->',html,flags=re.S)
schema=json.dumps({'@context':'https://schema.org','@graph':graph},ensure_ascii=False).replace('<','\\u003c')
html=html.replace('<!-- DISCOVERY_SCHEMA -->','<script id="discovery-jsonld" type="application/ld+json">'+schema+'</script>')
p.write_text(html)
(root/'index.md').write_text(Markdown().render(html)+'\nCanonical URL: '+origin+'/\n')
