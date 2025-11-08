#!/usr/bin/env python3
"""
Extract text from a PDF using pypdf. If pypdf is missing, attempt to install it.
Prints extracted text to stdout.
"""
import sys
from pathlib import Path
p = Path('/workspaces/spaceai/Untitled presentation.pdf')
if not p.exists():
    print('ERROR: PDF not found at', p)
    sys.exit(2)

try:
    from pypdf import PdfReader
except Exception:
    import subprocess
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'pypdf'])
    from pypdf import PdfReader

reader = PdfReader(str(p))
texts = []
for i, page in enumerate(reader.pages, start=1):
    t = page.extract_text() or ''
    texts.append(f"--- PAGE {i} ---\n" + t)

print('\n\n'.join(texts))
