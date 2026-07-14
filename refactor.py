import os
import re

def main():
    src_dir = os.path.join("apps", "web", "src", "components", "modules")
    
    count = 0
    for root, dirs, files in os.walk(src_dir):
        for f in files:
            if f.endswith(".tsx") or f.endswith(".ts"):
                path = os.path.join(root, f)
                with open(path, "r", encoding="utf-8") as file:
                    content = file.read()
                
                if "activeRole" not in content:
                    continue
                
                original = content
                
                # Remove activeRole from props interface
                content = re.sub(r"activeRole\s*:\s*[a-zA-Z0-9_]+;", "", content)
                
                # Replace { activeRole }: Props with ()
                content = re.sub(r"\{\s*activeRole\s*\}\s*:\s*[a-zA-Z0-9_]+", "()", content)
                
                # Inject usePermissions
                if "import { usePermissions }" not in content:
                    content = 'import { usePermissions } from "@/hooks/use-permissions";\n' + content
                
                # Find export function
                def replacer(m):
                    sig = m.group(1)
                    if "()" in sig and "usePermissions" not in content:
                        # Add hook inside function
                        return sig + '\n  const { role } = usePermissions();\n  const activeRole = role as any;'
                    return sig
                
                content = re.sub(r"(export\s+(?:default\s+)?function\s+[A-Za-z0-9_]+\s*\([^)]*\)\s*\{)", replacer, content)
                
                # But wait, what if usePermissions is already imported but the hook isn't injected?
                def replacer2(m):
                    sig = m.group(1)
                    return sig + '\n  const { role } = usePermissions();\n  const activeRole = role as any;'
                
                # If we couldn't do it via replacer, let's just do it manually
                if "const activeRole = role" not in content:
                    content = re.sub(r"(export\s+(?:default\s+)?function\s+[A-Za-z0-9_]+\s*\(\s*\)\s*\{)", replacer2, content)

                if content != original:
                    with open(path, "w", encoding="utf-8") as file:
                        file.write(content)
                    print(f"Modified {path}")
                    count += 1

    print(f"Fixed {count} files")

if __name__ == "__main__":
    main()
