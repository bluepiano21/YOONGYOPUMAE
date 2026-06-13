import sys
import re

filepath = r"c:\Users\윤교마녀\OneDrive - (주)예누\vive-yenu\blog\src\app\page.js"

query = sys.argv[1] if len(sys.argv) > 1 else ""
if not query:
    print("Please provide a query.")
    sys.exit(1)

print(f"Searching for '{query}' in {filepath}...")
with open(filepath, "r", encoding="utf-8") as f:
    for idx, line in enumerate(f, 1):
        if re.search(query, line, re.IGNORECASE):
            print(f"{idx}: {line.strip()}")
