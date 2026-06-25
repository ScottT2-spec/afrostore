#!/usr/bin/env python3
"""
Updates all .tsx files to import filled icons from @/components/icons/FilledIcons
instead of lucide-react, keeping geometric/spinner icons in lucide-react.
"""

import re
import os
import glob

# Icons that stay in lucide-react
KEEP_LUCIDE = {
    'Loader2',
    'ChevronDown', 'ChevronLeft', 'ChevronRight', 'ChevronUp',
    'X', 'Plus', 'Check', 'ArrowLeft', 'ArrowRight',
}

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'lucide-react' not in content:
        return False
    
    original = content
    
    # Find all lucide-react import statements (handle both single and multi-line)
    # Pattern: import { ... } from "lucide-react" or 'lucide-react'
    pattern = re.compile(
        r'import\s*\{([^}]+)\}\s*from\s*["\']lucide-react["\'];?\n?',
        re.MULTILINE | re.DOTALL
    )
    
    matches = list(pattern.finditer(content))
    if not matches:
        return False
    
    lucide_icons = set()
    filled_icons = set()
    alias_map = {}  # e.g., Search as SearchIcon -> SearchIcon alias
    
    for match in matches:
        icons_str = match.group(1)
        # Parse individual icons (handle aliases like "Search as SearchIcon")
        for icon_item in re.split(r',', icons_str):
            icon_item = icon_item.strip()
            if not icon_item:
                continue
            # Handle alias: "Search as SearchIcon"
            alias_match = re.match(r'(\w+)\s+as\s+(\w+)', icon_item)
            if alias_match:
                original_name = alias_match.group(1)
                alias_name = alias_match.group(2)
                alias_map[original_name] = alias_name
                if original_name in KEEP_LUCIDE:
                    lucide_icons.add(icon_item)
                else:
                    filled_icons.add(original_name)
            else:
                name = icon_item
                if name in KEEP_LUCIDE:
                    lucide_icons.add(name)
                else:
                    filled_icons.add(name)
    
    # Remove all lucide-react imports
    content = pattern.sub('', content)
    
    # Build new import lines
    new_imports = []
    
    if lucide_icons:
        sorted_lucide = sorted(lucide_icons)
        new_imports.append(f'import {{ {", ".join(sorted_lucide)} }} from "lucide-react";')
    
    if filled_icons:
        # Handle aliases - we import by original name from FilledIcons
        # But we need to re-add aliases as local aliases if they existed
        filled_import_items = []
        alias_imports = []
        
        for icon in sorted(filled_icons):
            if icon in alias_map:
                filled_import_items.append(f'{icon} as {alias_map[icon]}')
            else:
                filled_import_items.append(icon)
        
        new_imports.append(f'import {{ {", ".join(filled_import_items)} }} from "@/components/icons/FilledIcons";')
    
    # Insert new imports at the top (after any existing imports or at the top)
    if new_imports:
        new_import_block = '\n'.join(new_imports) + '\n'
        # Find where to insert - after the last remaining import or at top
        # Strategy: find first non-blank, non-comment, non-"use client" line
        # and insert before the first original import block location
        
        # Find the position of the first lucide import in the original to use as reference
        # Since we removed them, insert at top (after "use client" if present)
        
        if content.startswith('"use client"') or content.startswith("'use client'"):
            # Insert after "use client" line
            first_newline = content.index('\n') + 1
            content = content[:first_newline] + new_import_block + content[first_newline:]
        else:
            content = new_import_block + content
    
    # Clean up extra blank lines (more than 2 consecutive)
    content = re.sub(r'\n{3,}', '\n\n', content)
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False


def main():
    base = '/root/.openclaw/workspace/afrostore/src'
    tsx_files = glob.glob(f'{base}/**/*.tsx', recursive=True)
    
    updated = []
    for fp in sorted(tsx_files):
        if process_file(fp):
            updated.append(fp)
            print(f'Updated: {fp}')
    
    print(f'\nTotal files updated: {len(updated)}')


if __name__ == '__main__':
    main()
