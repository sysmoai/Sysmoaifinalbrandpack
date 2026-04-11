import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NavigationSystem, FloatingNavDots } from './NavigationSystem';
import { FinalBrandSystem } from './FinalBrandSystem';

// ============================================================================
// LOGO SVG GENERATION (for export)
// ============================================================================
function getLogoSVG(variant: "brand-dark" | "brand-light" | "mono-white" | "mono-black", size: number): string {
  const sw = size <= 64 ? 3 : size <= 128 ? 2.5 : 2;
  const styles: Record<string, { fills: string[]; fillOps: number[]; strokes: string[]; strokeOps: number[] }> = {
    "brand-dark": {
      fills: ["#1E3A8A", "#2563EB", "#3B82F6"],
      fillOps: [0.3, 0.5, 1],
      strokes: ["#2563EB", "#3B82F6", "#60A5FA"],
      strokeOps: [0.6, 0.8, 1],
    },
    "brand-light": {
      fills: ["#1E3A8A", "#2563EB", "#1E3A8A"],
      fillOps: [0.08, 0.15, 0.85],
      strokes: ["#1E40AF", "#2563EB", "#1E3A8A"],
      strokeOps: [0.35, 0.55, 1],
    },
    "mono-white": {
      fills: ["#FFFFFF", "#FFFFFF", "#FFFFFF"],
      fillOps: [0.12, 0.3, 1],
      strokes: ["#FFFFFF", "#FFFFFF", "#FFFFFF"],
      strokeOps: [0.5, 0.7, 1],
    },
    "mono-black": {
      fills: ["#000000", "#000000", "#000000"],
      fillOps: [0.08, 0.2, 0.9],
      strokes: ["#000000", "#000000", "#000000"],
      strokeOps: [0.4, 0.6, 1],
    },
  };
  const s = styles[variant];
  const paths = [
    "M25 34 L50 24 L75 34 L75 54 L50 64 L25 54 Z",
    "M30 49 L50 40 L70 49 L70 64 L50 73 L30 64 Z",
    "M40 61 L50 56 L60 61 L60 71 L50 76 L40 71 Z",
  ];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100" fill="none">${paths.map((d, i) =>
    `<path d="${d}" fill="${s.fills[i]}" fill-opacity="${s.fillOps[i]}" stroke="${s.strokes[i]}" stroke-opacity="${s.strokeOps[i]}" stroke-width="${sw}" stroke-linejoin="round"/>`
  ).join('')}</svg>`;
}

function getWordmarkSVG(color: string, fontSize: number): string {
  const w = fontSize * 4.2;
  const h = fontSize * 1.4;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <text y="${fontSize}" font-family="Inter, SF Pro Display, -apple-system, system-ui, sans-serif" font-size="${fontSize}" fill="${color}" letter-spacing="-0.5">
      <tspan font-weight="700" letter-spacing="-0.02em">SYS</tspan><tspan font-weight="400" letter-spacing="-0.04em" opacity="0.65">mo</tspan><tspan font-weight="700" letter-spacing="0.02em">AI</tspan>
    </text>
  </svg>`;
}

async function renderToCanvas(
  width: number,
  height: number,
  bgColor: string,
  elements: Array<{ svg: string; x: number; y: number; w: number; h: number }>,
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  for (const el of elements) {
    const blob = new Blob([el.svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = url;
    });
    ctx.drawImage(img, el.x, el.y, el.w, el.h);
    URL.revokeObjectURL(url);
  }

  return canvas;
}

function downloadCanvas(canvas: HTMLCanvasElement, filename: string, format: 'png' | 'jpeg') {
  const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
  const quality = format === 'jpeg' ? 0.95 : undefined;
  const link = document.createElement('a');
  link.download = `${filename}.${format}`;
  link.href = canvas.toDataURL(mime, quality);
  link.click();
}

function downloadSVG(svgContent: string, filename: string) {
  const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `${filename}.svg`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}

// ============================================================================
// MARKETPLACE-READY BRAND SYSTEM WRAPPER
// ============================================================================

export function MarketplaceBrandSystem() {
  const [currentSection, setCurrentSection] = useState('hero');
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const sectionIds = [
    'hero', 'lockups', 'tagline-system', 'icon-mark', 'construction', 'clear-space', 'wordmark',
    'color-system', 'incorrect', 'social-profile-icon', 'social-profile-lockup',
    'cover-photos', 'platform-matrix', 'batch-export', 'qa-audit', 'roadmap',
    'stacked-lockup', 'responsive-logo', 'favicon', 'extended-palette',
    'semantic-colors', 'gradients', 'wcag-contrast', 'typefaces', 'type-scale',
    'type-hierarchy', 'base-grid', 'spacing-tokens', 'layout-grid', 'breakpoints',
    'icon-style', 'photography', 'voice-tone', 'writing', 'terminology',
    'button-system', 'card-system', 'form-elements', 'badges-tags', 'easing',
    'duration', 'transitions', 'business-card', 'linkedin-banner',
    'email-signature', 'social-post', 'proposal-cover',
    'brand-pattern', 'brand-style-guide', 'dtcg-structure', 'token-naming', 'export-formats'
  ];

  // IntersectionObserver for scroll tracking
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.target.id) {
          setCurrentSection(entry.target.id);
        }
      });
    }, options);

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element && observerRef.current) {
        observerRef.current.observe(element);
      }
    });

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);

  // Keyboard shortcut: Cmd/Ctrl + \ to toggle nav
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault();
        setIsNavCollapsed(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavigate = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setCurrentSection(sectionId);
    }
  }, []);

  const handleToggleCollapse = useCallback(() => {
    setIsNavCollapsed(prev => !prev);
  }, []);

  // Comprehensive export function for all brand assets
  const handleExportAllAssets = useCallback(async () => {
    const PLATFORMS = [
      { name: 'Facebook', profile: { width: 512 }, cover: { width: 820, height: 312 } },
      { name: 'Instagram', profile: { width: 512 } },
      { name: 'WhatsApp', profile: { width: 512 } },
      { name: 'LinkedIn', profile: { width: 512 }, cover: { width: 1584, height: 396 } },
      { name: 'TikTok', profile: { width: 512 } },
      { name: 'GitHub', profile: { width: 512 } },
      { name: 'Discord', profile: { width: 512 }, cover: { width: 960, height: 540 } },
    ];

    try {
      // 1. Export Logo SVGs (all variants)
      console.log('📦 Step 1/6: Exporting logo SVGs...');
      const logoVariants: Array<{ variant: "brand-dark" | "brand-light" | "mono-white" | "mono-black"; name: string }> = [
        { variant: 'brand-dark', name: 'Brand_Dark' },
        { variant: 'brand-light', name: 'Brand_Light' },
        { variant: 'mono-white', name: 'Mono_White' },
        { variant: 'mono-black', name: 'Mono_Black' },
      ];

      for (const { variant, name } of logoVariants) {
        const svg = getLogoSVG(variant, 512);
        downloadSVG(svg, `SYSmoAI_Icon_${name}`);
        await new Promise(r => setTimeout(r, 150));
      }

      // 2. Export Social Media Profile Pictures (PNG - Best Quality)
      console.log('📦 Step 2/6: Exporting social media profile pictures...');
      for (const platform of PLATFORMS) {
        const size = platform.profile.width;
        const logoSize = Math.round(size * 0.55);
        const logoOffset = Math.round((size - logoSize) / 2);

        // Brand on dark
        const svgDark = getLogoSVG("brand-dark", logoSize);
        const canvasDark = await renderToCanvas(size, size, '#000000', [
          { svg: svgDark, x: logoOffset, y: logoOffset, w: logoSize, h: logoSize },
        ]);
        downloadCanvas(canvasDark, `SYSmoAI_DP_${platform.name}_Dark_${size}`, 'png');
        await new Promise(r => setTimeout(r, 200));

        // Mono white
        const svgWhite = getLogoSVG("mono-white", logoSize);
        const canvasWhite = await renderToCanvas(size, size, '#000000', [
          { svg: svgWhite, x: logoOffset, y: logoOffset, w: logoSize, h: logoSize },
        ]);
        downloadCanvas(canvasWhite, `SYSmoAI_DP_${platform.name}_Mono_${size}`, 'png');
        await new Promise(r => setTimeout(r, 200));
      }

      // 3. Export Facebook, LinkedIn, and Discord Cover Photos (PNG - Highest Quality)
      console.log('📦 Step 3/6: Exporting cover photos (Facebook, LinkedIn, Discord)...');
      const platformsWithCovers = PLATFORMS.filter(p => p.cover);
      
      for (const platform of platformsWithCovers) {
        if (!platform.cover) continue;
        
        const { width, height } = platform.cover;
        const logoSize = Math.round(height * 0.4);
        const wordSize = Math.round(height * 0.15);
        const wordW = Math.round(wordSize * 4.2);
        const wordH = Math.round(wordSize * 1.4);
        const totalW = logoSize + 16 + wordW;
        const logoX = Math.round((width - totalW) / 2);
        const logoY = Math.round((height - logoSize) / 2);
        const wordX = logoX + logoSize + 16;
        const wordY = Math.round((height - wordH) / 2);

        // Brand Dark variant (on dark background)
        const logoSvgDark = getLogoSVG("brand-dark", logoSize);
        const wordSvgWhite = getWordmarkSVG("#FFFFFF", wordSize);
        const canvasDark = await renderToCanvas(width, height, '#0A0B0F', [
          { svg: logoSvgDark, x: logoX, y: logoY, w: logoSize, h: logoSize },
          { svg: wordSvgWhite, x: wordX, y: wordY, w: wordW, h: wordH },
        ]);
        downloadCanvas(canvasDark, `SYSmoAI_Cover_${platform.name}_${width}x${height}_Dark`, 'png');
        await new Promise(r => setTimeout(r, 250));

        // Brand Light variant (on light background)
        const logoSvgLight = getLogoSVG("brand-light", logoSize);
        const wordSvgBlack = getWordmarkSVG("#000000", wordSize);
        const canvasLight = await renderToCanvas(width, height, '#FFFFFF', [
          { svg: logoSvgLight, x: logoX, y: logoY, w: logoSize, h: logoSize },
          { svg: wordSvgBlack, x: wordX, y: wordY, w: wordW, h: wordH },
        ]);
        downloadCanvas(canvasLight, `SYSmoAI_Cover_${platform.name}_${width}x${height}_Light`, 'png');
        await new Promise(r => setTimeout(r, 250));
      }

      // 4. Export Lockup Variants (PNG at multiple sizes - Best Quality)
      console.log('📦 Step 4/6: Exporting lockup variants...');
      const lockupSizes = [512, 1024, 2048];
      for (const size of lockupSizes) {
        const logoSize = Math.round(size * 0.38);
        const fontSize = Math.round(size * 0.18);
        const svgLogo = getLogoSVG("brand-dark", logoSize);
        const svgWord = getWordmarkSVG("#FFFFFF", fontSize);
        
        const canvas = await renderToCanvas(size, size, '#0A0B0F', [
          { svg: svgLogo, x: Math.round((size - logoSize) / 2), y: Math.round(size * 0.25), w: logoSize, h: logoSize },
          { svg: svgWord, x: Math.round((size - fontSize * 4.2) / 2), y: Math.round(size * 0.65), w: fontSize * 4.2, h: fontSize * 1.4 },
        ]);
        downloadCanvas(canvas, `SYSmoAI_Lockup_${size}`, 'png');
        await new Promise(r => setTimeout(r, 200));
      }

      // 5. Export Universal Sizes (PNG - Transparent Background)
      console.log('📦 Step 5/6: Exporting universal sizes...');
      const universalSizes = [512, 1024];
      for (const size of universalSizes) {
        const logoSize = Math.round(size * 0.55);
        const logoOffset = Math.round((size - logoSize) / 2);

        // Brand dark on transparent
        const svgBrand = getLogoSVG("brand-dark", logoSize);
        const canvasBrand = await renderToCanvas(size, size, 'transparent', [
          { svg: svgBrand, x: logoOffset, y: logoOffset, w: logoSize, h: logoSize },
        ]);
        downloadCanvas(canvasBrand, `SYSmoAI_Universal_${size}_Brand`, 'png');
        await new Promise(r => setTimeout(r, 150));

        // Mono white on transparent
        const svgMono = getLogoSVG("mono-white", logoSize);
        const canvasMono = await renderToCanvas(size, size, 'transparent', [
          { svg: svgMono, x: logoOffset, y: logoOffset, w: logoSize, h: logoSize },
        ]);
        downloadCanvas(canvasMono, `SYSmoAI_Universal_${size}_Mono`, 'png');
        await new Promise(r => setTimeout(r, 150));
      }

      // 6. Export High-Resolution Favicon/App Icons
      console.log('📦 Step 6/6: Exporting favicon and app icons...');
      const iconSizes = [16, 32, 64, 128, 256, 512];
      for (const size of iconSizes) {
        const logoSize = Math.round(size * 0.7);
        const logoOffset = Math.round((size - logoSize) / 2);
        const svg = getLogoSVG("brand-dark", logoSize);
        const canvas = await renderToCanvas(size, size, 'transparent', [
          { svg, x: logoOffset, y: logoOffset, w: logoSize, h: logoSize },
        ]);
        downloadCanvas(canvas, `SYSmoAI_Icon_${size}x${size}`, 'png');
        await new Promise(r => setTimeout(r, 100));
      }

      console.log('✅ Export complete! All assets downloaded.');
      console.log('📊 Summary:');
      console.log('  - 4 Logo SVGs');
      console.log('  - 14 Social Profile Pictures');
      console.log('  - 6 Cover Photos (Facebook, LinkedIn, Discord - Dark & Light)');
      console.log('  - 3 Lockup Variants');
      console.log('  - 4 Universal Size Exports');
      console.log('  - 6 App Icon Sizes');
      console.log('  TOTAL: 37 files exported');
    } catch (error) {
      console.error('❌ Export failed:', error);
      throw error;
    }
  }, []);

  return (
    <div className="relative min-h-screen bg-[#0A0B0F]" ref={containerRef}>
      {/* Navigation System */}
      <NavigationSystem
        currentSection={currentSection}
        onNavigate={handleNavigate}
        isCollapsed={isNavCollapsed}
        onToggleCollapse={handleToggleCollapse}
        onExportAllAssets={handleExportAllAssets}
      />
      
      {/* Floating Nav Dots (collapsed state) */}
      <FloatingNavDots currentSection={currentSection} sections={sectionIds} isCollapsed={isNavCollapsed} />

      {/* Main Content — adjusts padding based on nav state */}
      <div
        className="transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lg:pr-0 pr-0"
        style={{
          // Only apply right padding on desktop (lg+)
        }}
      >
        <style>{`
          @media (min-width: 1024px) {
            .brand-content-area {
              padding-right: ${isNavCollapsed ? 52 : 340}px;
              transition: padding-right 500ms cubic-bezier(0.16, 1, 0.3, 1);
            }
          }
        `}</style>
        <div className="brand-content-area">
          <FinalBrandSystem />
        </div>
      </div>

      {/* Keyboard Navigation Helper */}
      <KeyboardNavigationHelper
        currentSection={currentSection}
        sections={sectionIds}
        onNavigate={handleNavigate}
      />
    </div>
  );
}

function KeyboardNavigationHelper({
  currentSection,
  sections,
  onNavigate,
}: {
  currentSection: string;
  sections: string[];
  onNavigate: (sectionId: string) => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const currentIndex = sections.findIndex(s => s === currentSection);
      
      if (e.key === 'ArrowUp' && e.ctrlKey && currentIndex > 0) {
        e.preventDefault();
        onNavigate(sections[currentIndex - 1]);
      } else if (e.key === 'ArrowDown' && e.ctrlKey && currentIndex < sections.length - 1) {
        e.preventDefault();
        onNavigate(sections[currentIndex + 1]);
      }
      
      if (e.key === 'Home' && e.ctrlKey) {
        e.preventDefault();
        onNavigate(sections[0]);
      } else if (e.key === 'End' && e.ctrlKey) {
        e.preventDefault();
        onNavigate(sections[sections.length - 1]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSection, sections, onNavigate]);

  return null;
}