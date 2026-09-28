"""Uploads design screens to Stitch only if their title is not already on the project canvas, and verifies each one lands.

Usage: python stitch_sync.py  (reads the list below)
"""
import json
import os
import re
import subprocess
import time
import urllib.request

PROJECT = "330652592731776730"
KEY = os.environ["STITCH_API_KEY"]
REPO = r"C:\Users\Rnf-user.DESKTOP-H20A3J8\Desktop\social_agent"
SCRATCH = r"C:\Users\Rnf-user.DESKTOP-H20A3J8\AppData\Local\Temp\claude\C--Users-Rnf-user-DESKTOP-H20A3J8-Desktop-social-agent\0961f288-92d5-46ce-a429-ea293764a829\scratchpad"
UPLOADER = os.path.join(REPO, r".agents\skills\stitch-upload-to-stitch\scripts\upload_to_stitch.py")


def call(name, arguments):
    body = json.dumps({"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": name, "arguments": arguments}}).encode()
    request = urllib.request.Request("https://stitch.googleapis.com/mcp", data=body, headers={"X-Goog-Api-Key": KEY, "Content-Type": "application/json", "Accept": "application/json, text/event-stream"})
    result = json.loads(urllib.request.urlopen(request, timeout=120).read())["result"]
    return result.get("structuredContent") or json.loads(result["content"][0]["text"])


def canvas_titles():
    project = call("get_project", {"name": f"projects/{PROJECT}"})
    titles = {}
    for instance in project.get("screenInstances", []):
        source = instance.get("sourceScreen")
        if source:
            titles[call("get_screen", {"name": source}).get("title")] = source
    return titles


ITEMS = []
for key, name in [("s20a-strategy-draft", "S20a v1 - Strategy - Draft, 30-minute window"), ("s20b-ask-for-changes", "S20b v1 - Strategy - Ask for changes"), ("s20c-strategy-started", "S20c v1 - Strategy - Started on its own")]:
    for size, label in [("desktop", "desktop"), ("tablet", "tablet 768"), ("phone", "phone 390")]:
        ITEMS.append((os.path.join(SCRATCH, "s20", f"{key}-{size}.png"), f"{name} ({label})"))

present = canvas_titles()
print(f"on canvas before: {len(present)}")
for path, title in ITEMS:
    if title in present:
        print(f"already there: {title}")
        continue
    output = subprocess.run(["python", UPLOADER, "--project-id", PROJECT, "--file-path", path, "--api-key", KEY, "--title", title, "--generated-by", "Claude Code"], capture_output=True, text=True).stdout
    match = re.search(r'"sourceScreen": "(projects/\d+/screens/\d+)"', output)
    time.sleep(3)
    placed = bool(match) and any(i.get("sourceScreen") == match.group(1) for i in call("get_project", {"name": f"projects/{PROJECT}"}).get("screenInstances", []))
    print(f"{'placed' if placed else 'NOT PLACED'}: {title}")
print(f"on canvas after: {len(canvas_titles())}")
