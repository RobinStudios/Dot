import { generateResponsiveCode } from './bedrock';

export interface ResponsiveBreakpoint {
  name: string;
  width: number;
  columns: number;
}

export const breakpoints: ResponsiveBreakpoint[] = [
  { name: 'mobile', width: 375, columns: 1 },
  { name: 'tablet', width: 768, columns: 2 },
  { name: 'desktop', width: 1024, columns: 3 },
  { name: 'wide', width: 1440, columns: 4 },
];

export async function generateResponsiveDesign(design: any) {
  const responsiveCode = await generateResponsiveCode(design);
  
  return {
    html: generateHTML(design),
    css: generateResponsiveCSS(design),
    react: responsiveCode,
    breakpoints: generateBreakpointStyles(design),
  };
}

function generateHTML(design: any): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${design.title || 'AI Generated Design'}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50">
  <div class="container mx-auto px-4 py-8">
    ${generateElementsHTML(design.elements || [])}
  </div>
</body>
</html>`;
}

function generateElementsHTML(elements: any[]): string {
  return elements.map(element => {
    switch (element.type) {
      case 'text':
        return `<${element.tag || 'p'} class="${element.className}">${element.content}</${element.tag || 'p'}>`;
      case 'image':
        return `<img src="${element.src}" alt="${element.alt}" class="${element.className}" />`;
      case 'button':
        return `<button class="${element.className}">${element.text}</button>`;
      default:
        return `<div class="${element.className}">${element.content || ''}</div>`;
    }
  }).join('\n    ');
}

function generateResponsiveCSS(design: any): string {
  return `
/* Mobile First Responsive Design */
.container {
  max-width: 100%;
  margin: 0 auto;
  padding: 1rem;
}

/* Mobile */
@media (max-width: 767px) {
  .grid-responsive { grid-template-columns: 1fr; }
  .text-responsive { font-size: 0.875rem; }
  .spacing-responsive { padding: 0.5rem; }
}

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) {
  .grid-responsive { grid-template-columns: repeat(2, 1fr); }
  .text-responsive { font-size: 1rem; }
  .spacing-responsive { padding: 1rem; }
}

/* Desktop */
@media (min-width: 1024px) {
  .grid-responsive { grid-template-columns: repeat(3, 1fr); }
  .text-responsive { font-size: 1.125rem; }
  .spacing-responsive { padding: 1.5rem; }
}

/* Wide Screen */
@media (min-width: 1440px) {
  .grid-responsive { grid-template-columns: repeat(4, 1fr); }
  .text-responsive { font-size: 1.25rem; }
  .spacing-responsive { padding: 2rem; }
}
`;
}

function generateBreakpointStyles(design: any) {
  return breakpoints.map(bp => ({
    breakpoint: bp.name,
    width: bp.width,
    styles: {
      container: `max-width: ${bp.width}px`,
      grid: `grid-template-columns: repeat(${bp.columns}, 1fr)`,
      fontSize: bp.width < 768 ? '14px' : bp.width < 1024 ? '16px' : '18px',
    }
  }));
}