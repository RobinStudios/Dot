import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth/auth';
import { db } from '@/lib/db/client';
import { z } from 'zod';
import JSZip from 'jszip';

const ExportSchema = z.object({
  designIds: z.array(z.string().uuid()),
  format: z.enum(['html', 'react', 'vue', 'angular']),
  styling: z.enum(['css', 'tailwind', 'styled-components']).optional(),
});

function generateHTML(elements: any[], name: string): string {
  const elementsHTML = elements.map(el => {
    const style = `position: absolute; left: ${el.x}px; top: ${el.y}px; width: ${el.width}px; height: ${el.height}px; ${el.fill ? `background-color: ${el.fill};` : ''} ${el.fontSize ? `font-size: ${el.fontSize}px;` : ''}`;
    
    if (el.type === 'text') {
      return `<div style="${style}">${el.text || 'Text'}</div>`;
    }
    if (el.type === 'rectangle') {
      return `<div style="${style} ${el.cornerRadius ? `border-radius: ${el.cornerRadius}px;` : ''}"></div>`;
    }
    if (el.type === 'ellipse') {
      return `<div style="${style} border-radius: 50%;"></div>`;
    }
    return `<div style="${style}"></div>`;
  }).join('\n    ');

  return `<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>${name}</title>\n    <style>\n        body { margin: 0; padding: 0; font-family: Inter, sans-serif; }\n        .container { position: relative; width: 100%; height: 100vh; }\n    </style>\n</head>\n<body>\n    <div class="container">\n    ${elementsHTML}\n    </div>\n</body>\n</html>`;
}

function generateReact(elements: any[], name: string): string {
  const elementsJSX = elements.map(el => {
    const style = `{{ position: 'absolute', left: ${el.x}, top: ${el.y}, width: ${el.width}, height: ${el.height}${el.fill ? `, backgroundColor: '${el.fill}'` : ''}${el.fontSize ? `, fontSize: ${el.fontSize}` : ''} }}`;
    
    if (el.type === 'text') {
      return `      <div style={${style}}>${el.text || 'Text'}</div>`;
    }
    return `      <div style={${style}}></div>`;
  }).join('\n');

  return `import React from 'react';\n\nexport default function ${name.replace(/\s+/g, '')}() {\n  return (\n    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>\n${elementsJSX}\n    </div>\n  );\n}`;
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await authService.verifySession(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { designIds, format, styling = 'css' } = ExportSchema.parse(body);

    const zip = new JSZip();
    const results = [];

    for (const designId of designIds) {
      const { data: design } = await db
        .from('designs')
        .select('*')
        .eq('id', designId)
        .single();

      if (!design) continue;

      let code = '';
      let filename = '';

      switch (format) {
        case 'html':
          code = generateHTML(design.elements, design.name);
          filename = `${design.name.replace(/\s+/g, '-').toLowerCase()}.html`;
          break;
        case 'react':
          code = generateReact(design.elements, design.name);
          filename = `${design.name.replace(/\s+/g, '-').toLowerCase()}.tsx`;
          break;
        case 'vue':
          code = `<template>\n  <div class="container">\n    <!-- Vue implementation -->\n  </div>\n</template>\n\n<script>\nexport default {\n  name: '${design.name.replace(/\s+/g, '')}'\n}\n</script>`;
          filename = `${design.name.replace(/\s+/g, '-').toLowerCase()}.vue`;
          break;
        case 'angular':
          code = `import { Component } from '@angular/core';\n\n@Component({\n  selector: 'app-${design.name.replace(/\s+/g, '-').toLowerCase()}',\n  template: \`<div class="container"><!-- Angular implementation --></div>\`\n})\nexport class ${design.name.replace(/\s+/g, '')}Component {}`;
          filename = `${design.name.replace(/\s+/g, '-').toLowerCase()}.component.ts`;
          break;
      }

      zip.file(filename, code);
      results.push({ designId, filename, success: true });
    }

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
    const base64Zip = zipBuffer.toString('base64');

    return NextResponse.json({ 
      results,
      downloadUrl: `data:application/zip;base64,${base64Zip}`,
      filename: `designs-export-${format}.zip`
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      );
    }
    
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Export failed' },
      { status: 500 }
    );
  }
}