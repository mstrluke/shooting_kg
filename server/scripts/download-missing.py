#!/usr/bin/env python3
"""Download all remaining shooting.kg images referenced in post content."""
import json, os, re, urllib.request, urllib.parse, hashlib
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

UPLOAD_DIR = Path("server/uploads/wp-images")
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"

# Load existing map
with open("/tmp/shooting_url_map.json") as f:
    url_map = json.load(f)

# Load post data and find ALL image URLs in content
with open("/tmp/shooting_full_data.json") as f:
    data = json.load(f)

all_urls = set()
for p in data["posts"]:
    content = p.get("content", {}).get("rendered", "")
    for url in re.findall(r'https?://shooting\.kg/wp-content/uploads/[^\s"\'<>)]+', content):
        url = url.rstrip('.,;')
        if url not in url_map:
            all_urls.add(url)

print(f"Need to download {len(all_urls)} additional images")

def download_one(url):
    parsed = urllib.parse.urlparse(url)
    match = re.search(r'wp-content/uploads/(.+)', parsed.path)
    if match:
        filename = re.sub(r'[^\w.\-]', '_', match.group(1).replace('/', '-'))
    else:
        ext = os.path.splitext(parsed.path)[1][:5] or '.jpg'
        filename = hashlib.md5(url.encode()).hexdigest()[:12] + ext
    
    local_path = UPLOAD_DIR / filename
    if local_path.exists() and local_path.stat().st_size > 0:
        return url, f"/uploads/wp-images/{filename}", True
    
    try:
        encoded_path = urllib.parse.quote(parsed.path, safe='/')
        encoded_url = f"{parsed.scheme}://{parsed.netloc}{encoded_path}"
        req = urllib.request.Request(encoded_url, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = resp.read()
            if len(data) < 100:
                return url, "", False
            local_path.write_bytes(data)
            return url, f"/uploads/wp-images/{filename}", True
    except Exception as e:
        return url, str(e)[:60], False

ok = 0
fail = 0
with ThreadPoolExecutor(max_workers=10) as pool:
    futures = {pool.submit(download_one, u): u for u in all_urls}
    for i, fut in enumerate(as_completed(futures), 1):
        url, path, success = fut.result()
        if success:
            ok += 1
            url_map[url] = path
        else:
            fail += 1
        if i % 50 == 0:
            print(f"  {i}/{len(all_urls)} ({ok} ok, {fail} fail)")

print(f"\n✅ Done: {ok} downloaded, {fail} failed")
print(f"Total URL map: {len(url_map)} entries")

with open("/tmp/shooting_url_map.json", "w") as f:
    json.dump(url_map, f, indent=2)
