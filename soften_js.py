import os
path = r'c:\Users\david\OneDrive\Documentos\Portable\Programas\Post-Away'
js_path = os.path.join(path, 'renderer.js')

with open(js_path, 'r', encoding='utf-8') as f:
    js = f.read()

# Soften the white text in the js toggles
js = js.replace("color = isNova ? '#FFF' : 'var(--text-color)';", "color = isNova ? '#E2E8F0' : 'var(--text-color)';")
js = js.replace("color = !isNova ? '#FFF' : 'var(--text-color)';", "color = !isNova ? '#E2E8F0' : 'var(--text-color)';")

with open(js_path, 'w', encoding='utf-8') as f:
    f.write(js)
