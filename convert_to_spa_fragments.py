#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para converter todas as páginas HTML em fragmentos SPA
Mantém CSS inline, extrai scripts inline para arquivos externos
"""

import os
import re
import html
from pathlib import Path

# Diretório base
BASE_DIR = Path('www')
PAGES_DIR = BASE_DIR / 'assets' / 'js' / 'pages'

# Scripts globais que devem ser removidos (já estão no layout.html)
GLOBAL_SCRIPTS = [
    'www-config.js',
    'auth.js',
    'spa-navigation.js',
    'app-state.js',
    'bottom-nav.js',
    'banner-carousel.js'
]

# CSS globais que devem ser removidos (já estão no layout.html)
GLOBAL_CSS = [
    'style.css',
    'pages/_dashboard.css'
]

def extract_styles_from_head(head_content):
    """Extrai todos os <style> do head"""
    styles = []
    style_pattern = r'<style[^>]*>(.*?)</style>'
    for match in re.finditer(style_pattern, head_content, re.DOTALL | re.IGNORECASE):
        styles.append(match.group(0))
    return styles

def extract_inline_scripts_from_head(head_content):
    """Extrai scripts inline do head"""
    scripts = []
    script_pattern = r'<script[^>]*>(.*?)</script>'
    for match in re.finditer(script_pattern, head_content, re.DOTALL | re.IGNORECASE):
        if not match.group(1).strip().startswith('src='):
            scripts.append(match.group(1).strip())
    return scripts

def extract_inline_scripts_from_body(body_content):
    """Extrai scripts inline do body"""
    scripts = []
    script_pattern = r'<script[^>]*>(.*?)</script>'
    for match in re.finditer(script_pattern, body_content, re.DOTALL | re.IGNORECASE):
        script_content = match.group(1).strip()
        if script_content and not script_content.startswith('src='):
            scripts.append(script_content)
    return scripts

def remove_script_tags(content):
    """Remove todas as tags <script> do conteúdo"""
    return re.sub(r'<script[^>]*>.*?</script>', '', content, flags=re.DOTALL | re.IGNORECASE)

def convert_page_to_fragment(html_file_path):
    """Converte uma página HTML para fragmento SPA"""
    print(f"\nProcessando: {html_file_path}")
    
    # Ler arquivo
    with open(html_file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extrair head e body
    head_match = re.search(r'<head[^>]*>(.*?)</head>', content, re.DOTALL | re.IGNORECASE)
    body_match = re.search(r'<body[^>]*>(.*?)</body>', content, re.DOTALL | re.IGNORECASE)
    
    if not body_match:
        print(f"  AVISO: Nao encontrou <body>, pulando...")
        return False
    
    head_content = head_match.group(1) if head_match else ''
    body_content = body_match.group(1)
    
    # Extrair estilos do head (manter inline)
    styles = extract_styles_from_head(head_content)
    
    # Extrair scripts inline do head e body
    inline_scripts_head = extract_inline_scripts_from_head(head_content)
    inline_scripts_body = extract_inline_scripts_from_body(body_content)
    all_inline_scripts = inline_scripts_head + inline_scripts_body
    
    # Remover scripts inline do body (serão movidos para arquivo externo)
    body_content = remove_script_tags(body_content)
    
    # Remover scripts externos globais do body
    for script in GLOBAL_SCRIPTS:
        body_content = re.sub(
            r'<script[^>]*src=["\'][^"\']*' + re.escape(script) + r'[^"\']*["\'][^>]*></script>',
            '',
            body_content,
            flags=re.IGNORECASE
        )
    
    # Criar nome do arquivo JS para scripts inline
    page_name = Path(html_file_path).stem
    js_file_path = PAGES_DIR / f"{page_name}.js"
    
    # Criar arquivo JS com scripts inline (se houver)
    if all_inline_scripts:
        os.makedirs(PAGES_DIR, exist_ok=True)
        js_content = f"""// Scripts inline extraídos de {page_name}.html
// Gerado automaticamente - não editar manualmente

"""
        for i, script in enumerate(all_inline_scripts):
            js_content += f"// Script inline {i+1}\n{script}\n\n"
        
        with open(js_file_path, 'w', encoding='utf-8') as f:
            f.write(js_content)
        print(f"  OK: Scripts inline extraidos para: {js_file_path}")
    
    # Criar fragmento SPA
    fragment = '<div class="app-container">\n'
    
    # Adicionar estilos inline (se houver)
    if styles:
        fragment += '\n'.join(styles) + '\n'
    
    # Adicionar conteúdo do body
    fragment += body_content.strip() + '\n'
    
    # Adicionar referência ao script externo (se foi criado)
    if all_inline_scripts:
        fragment += f'\n<script src="./assets/js/pages/{page_name}.js"></script>\n'
    
    fragment += '</div>'
    
    # Salvar fragmento (sobrescrever arquivo original)
    with open(html_file_path, 'w', encoding='utf-8') as f:
        f.write(fragment)
    
    print(f"  OK: Fragmento criado: {html_file_path}")
    return True

def main():
    """Processa todas as páginas HTML"""
    html_files = []
    
    # Encontrar todos os arquivos HTML
    for html_file in BASE_DIR.rglob('*.html'):
        # Ignorar layout.html e index.html
        if html_file.name in ['layout.html', 'index.html']:
            continue
        # Ignorar arquivos em assets/html
        if 'assets/html' in str(html_file):
            continue
        html_files.append(html_file)
    
    print(f"Encontrados {len(html_files)} arquivos HTML para processar")
    
    # Processar cada arquivo
    success_count = 0
    for html_file in html_files:
        try:
            if convert_page_to_fragment(html_file):
                success_count += 1
        except Exception as e:
            print(f"  ERRO ao processar {html_file}: {e}")
    
    print(f"\nProcessamento concluido: {success_count}/{len(html_files)} paginas convertidas")

if __name__ == '__main__':
    main()

