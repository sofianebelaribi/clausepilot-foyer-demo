"""Offline, deterministic PDF indexing and contract-scoped BM25 retrieval.

Evidence retrieval only; never a coverage decision, and not connected to the
browser demo. Scanned PDF pages require a separate OCR validation step.
"""
from __future__ import annotations
import argparse
from collections import Counter
from dataclasses import dataclass, asdict
from pathlib import Path
import hashlib
import json
import math
import re
import unicodedata

SCHEMA = 'clausepilot.passages.v1'
INJECTION_PATTERNS = (
    re.compile(r'(?i)(?:ignore|oublie|ignorez).{0,55}(?:instructions|consignes|directives)'),
    re.compile(r'(?i)(?:si tu es|if you are|you are now|tu es maintenant).{0,35}(?:ia|ai|assistant|mod[eè]le|model)'),
    re.compile(r'(?i)(?:system prompt|prompt syst[eè]me|developer instructions|instructions d[eé]veloppeur)'),
)

def possible_prompt_injection(text: str) -> bool:
    """Flag suspicious text for review, without discarding or executing it.

    This is a heuristic alert, NOT a safety guarantee or LLM prompt defense.
    """
    return any(pattern.search(text) for pattern in INJECTION_PATTERNS)

STOPWORDS = set('le la les un une des du de d et en dans sur sous pour par est sont au aux a que qui qu il elle je nous votre mon mes ce cette ces ne pas plus ou avec sans lors si son sa ses'.split())

def tokens(text: str) -> list[str]:
    normal = unicodedata.normalize('NFKD', text)
    value = ''.join(c for c in normal if not unicodedata.combining(c))
    return [w for w in re.findall(r'[a-z0-9]{2,}', value.casefold()) if w not in STOPWORDS]

@dataclass(frozen=True)
class Passage:
    contract_id: str
    edition: str
    document_sha256: str
    passage_id: str
    page: int
    text: str
    source_url: str
    possible_prompt_injection: bool

def chunks(words: list[str], size: int=160, overlap: int=28):
    if size <= overlap or overlap < 0: raise ValueError('invalid chunk overlap')
    for start in range(0, len(words), size-overlap):
        part=words[start:start+size]
        if part: yield ' '.join(part)
        if start+size >= len(words): break

def extract_pdf(path: Path) -> list[str]:
    try:
        import fitz
    except ImportError as e:
        raise RuntimeError('Install PyMuPDF with: python -m pip install pymupdf') from e
    with fitz.open(str(path)) as pdf:
        if pdf.is_encrypted: raise ValueError(f'Encrypted PDF: {path.name}')
        pages=[page.get_text('text',sort=True) for page in pdf]
    if not pages or not any(page.strip() for page in pages):
        raise ValueError(f'No embedded text in {path.name}: OCR required')
    return pages

def build(manifest: dict, root: Path, extractor=extract_pdf) -> dict:
    docs=manifest.get('documents')
    if not isinstance(docs,list) or not docs:
        raise ValueError('manifest needs documents array')
    results=[]
    seen=set()
    for doc in docs:
        for field in ('contract_id','edition','path','source_url'):
            if not isinstance(doc.get(field),str) or not doc[field].strip():
                raise ValueError(f'Missing {field}')
        cid=doc['contract_id']
        identity=(cid,doc['edition'])
        if identity in seen: raise ValueError(f'Duplicate contract identity: {identity}')
        seen.add(identity)
        path=(root/doc['path']).resolve()
        if not path.is_file(): raise FileNotFoundError(path)
        if not doc['source_url'].startswith('https://'):
            raise ValueError('HTTPS source_url required')
        sha=hashlib.sha256(path.read_bytes()).hexdigest()
        pages=extractor(path)
        if not pages or not any(page.strip() for page in pages):
            raise ValueError(f'No embedded text in {path.name}: OCR required')
        for page_num, raw in enumerate(pages,1):
            for idx,text in enumerate(chunks(raw.split())):
                if len(tokens(text)) < 4: continue
                passage=Passage(cid,doc['edition'],sha,
                    f'{cid}:{doc["edition"]}:p{page_num}:c{idx}',page_num,text,doc['source_url'],
                    possible_prompt_injection(text))
                results.append(asdict(passage))
    return {'schema':SCHEMA,'documents':[
        {'contract_id':d['contract_id'],'edition':d['edition'],
         'source_url':d['source_url']} for d in docs],
        'passages':results}

def search(index: dict, contract_id: str, query: str, top_k: int=5, edition: str|None=None) -> list[dict]:
    """BM25 retrieval with mandatory document identity and version disambiguation.

    If multiple editions share one contract_id, caller MUST specify the edition.
    A result never merges passages across policy versions.
    """
    if index.get('schema') != SCHEMA: raise ValueError('Unsupported index schema')
    editions={d['edition'] for d in index['documents'] if d['contract_id']==contract_id}
    if not editions: raise ValueError(f'Unknown contract: {contract_id}')
    if edition is None:
        if len(editions)!=1: raise ValueError(f'Edition required for contract {contract_id}')
        edition=next(iter(editions))
    if edition not in editions: raise ValueError(f'Unknown edition {edition} for {contract_id}')
    selected=[p for p in index['passages'] if p['contract_id']==contract_id and p['edition']==edition]
    query_terms=tokens(query)
    if not query_terms or not selected: return []
    tok=[Counter(tokens(p['text'])) for p in selected]
    lengths=[sum(counter.values()) for counter in tok]
    avg=max(1,sum(lengths)/len(lengths))
    df=Counter(t for counter in tok for t in counter)
    n=len(selected)
    result=[]
    for p,c,dl in zip(selected,tok,lengths):
        score=0.0
        for t in set(query_terms):
            tf=c[t]
            if not tf: continue
            idf=math.log(1+(n-df[t]+.5)/(df[t]+.5))
            score+=idf*(tf*2.2)/(tf+1.2*(.25+.75*dl/avg))
        if score>0:
            result.append({**p,'score':round(score,6),
              'href':f"{p['source_url'].split('#')[0]}#page={p['page']}"})
    result.sort(key=lambda p:(-p['score'],p['passage_id']))
    return result[:max(0,top_k)]

def main():
    cli=argparse.ArgumentParser(description='Version-scoped PDF passage retrieval')
    cmd=cli.add_subparsers(dest='command',required=True)
    a=cmd.add_parser('index')
    a.add_argument('--manifest',required=True,type=Path)
    a.add_argument('--output',required=True,type=Path)
    b=cmd.add_parser('search')
    b.add_argument('--index',required=True,type=Path)
    b.add_argument('--contract-id',required=True)
    b.add_argument('--edition',required=False,help='Mandatory when several editions share contract_id')
    b.add_argument('--query',required=True)
    b.add_argument('--top-k',type=int,default=5)
    args=cli.parse_args()
    if args.command=='index':
        data=build(json.loads(args.manifest.read_text(encoding='utf-8')),args.manifest.parent)
        args.output.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
        print(f"Indexed {len(data['documents'])} contracts / {len(data['passages'])} passages")
    else:
        idx=json.loads(args.index.read_text(encoding='utf-8'))
        print(json.dumps(search(idx,args.contract_id,args.query,args.top_k,edition=args.edition),ensure_ascii=False,indent=2))

if __name__=='__main__': main()
