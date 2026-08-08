from pathlib import Path
import re,sys
p=Path(sys.argv[1])
s=p.read_text(encoding='utf-8',errors='replace')
s=re.sub(r'<div\s+id=["\']aybSahaImza["\'][^>]*>.*?</div>\s*','',s,flags=re.S|re.I)
s=re.sub(r'<script>\s*/\*[^<]*?sw\.js önbelleği.*?beforeinstallprompt.*?</script>\s*','',s,flags=re.S|re.I)
p.write_text(s,encoding='utf-8')
print('Native/PWA cleanup OK')
