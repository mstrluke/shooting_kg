#!/usr/bin/env python3
"""Download all images from shooting.kg and save locally."""
import json, os, sys, urllib.request, urllib.error, hashlib, re
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

UPLOAD_DIR = Path(__file__).parent.parent / "uploads" / "wp-images"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"

def url_to_filename(url: str) -> str:
    """Convert URL to a safe local filename preserving the path structure."""
    # Extract path after wp-content/uploads/
    match = re.search(r'wp-content/uploads/(.+)', url)
    if match:
        path = match.group(1)
        # Flatten path: 2023/02/image.jpg -> 2023-02-image.jpg
        return path.replace('/', '-')
    # Fallback: hash the URL
    ext = os.path.splitext(url)[1][:5] or '.jpg'
    return hashlib.md5(url.encode()).hexdigest()[:12] + ext

def download_one(url: str) -> tuple[str, str, bool]:
    """Download a single image. Returns (url, local_path, success)."""
    filename = url_to_filename(url)
    local_path = UPLOAD_DIR / filename
    
    if local_path.exists() and local_path.stat().st_size > 0:
        return url, str(local_path), True
    
    try:
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = resp.read()
            if len(data) < 100:  # Too small, probably error
                return url, "", False
            local_path.write_bytes(data)
            return url, str(local_path), True
    except Exception as e:
        return url, str(e)[:60], False

def main():
    with open("/tmp/shooting_images.json") as f:
        urls = json.load(f)
    
    print(f"Downloading {len(urls)} images to {UPLOAD_DIR}")
    
    success = 0
    failed = 0
    url_map = {}  # remote_url -> local_path
    
    with ThreadPoolExecutor(max_workers=8) as pool:
        futures = {pool.submit(download_one, url): url for url in urls}
        for i, fut in enumerate(as_completed(futures), 1):
            url, path, ok = fut.result()
            if ok:
                success += 1
                # Map remote URL to local serve path
                filename = os.path.basename(path)
                url_map[url] = f"/uploads/wp-images/{filename}"
            else:
                failed += 1
                if failed <= 5:
                    print(f"  FAIL: {url[:80]} -> {path}")
            
            if i % 20 == 0:
                print(f"  Progress: {i}/{len(urls)} ({success} ok, {failed} fail)")
    
    print(f"\n✅ Done: {success} downloaded, {failed} failed")
    
    # Save URL mapping
    with open("/tmp/shooting_url_map.json", "w") as f:
        json.dump(url_map, f, indent=2)
    print(f"URL map saved: {len(url_map)} entries")

if __name__ == "__main__":
    main()
