import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

// ─── helpers ─────────────────────────────────────────────────────────────────

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawTitleBar(
  pdf: jsPDF,
  pageW: number,
  titleH: number,
  title: string,
  mode: string,
  creator: string,
  version: string,
  page: number,
  totalPages: number,
) {
  pdf.setFillColor(30, 41, 59);
  pdf.rect(0, 0, pageW, titleH, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(13);
  pdf.text(title || 'net-flow-online', 8, 9);
  pdf.setFontSize(8);
  pdf.text(
    `${mode} · v${version} · ${creator} · ${new Date().toLocaleDateString('de-DE')}`,
    8,
    16,
  );
  if (totalPages > 1) {
    const label = `Seite ${page} / ${totalPages}`;
    pdf.text(label, pageW - pdf.getTextWidth(label) - 8, 9);
  }
}

// ─── Sequence export (SVG → multi-page PDF) ──────────────────────────────────

async function renderSequenceSvg(svgEl: SVGSVGElement, pixelRatio: number): Promise<HTMLCanvasElement> {
  const svgW = svgEl.width.baseVal.value;
  const svgH = svgEl.height.baseVal.value;

  // Clone so we don't mutate the live DOM
  const clone = svgEl.cloneNode(true) as SVGSVGElement;

  // Reset the sticky-header scroll transform (it's been offset by the scroll position)
  clone.querySelectorAll<SVGGElement>('g[transform]').forEach((g) => {
    const t = g.getAttribute('transform') ?? '';
    if (t.startsWith('translate(0,')) g.setAttribute('transform', 'translate(0,0)');
  });

  // Ensure explicit size (remove % min-width/height so the canvas renders the full SVG)
  clone.setAttribute('width', String(svgW));
  clone.setAttribute('height', String(svgH));
  clone.style.minWidth = '';
  clone.style.minHeight = '';

  const svgStr = new XMLSerializer().serializeToString(clone);
  const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  try {
    const img = await loadImage(url);
    const canvas = document.createElement('canvas');
    canvas.width  = Math.round(svgW * pixelRatio);
    canvas.height = Math.round(svgH * pixelRatio);
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.scale(pixelRatio, pixelRatio);
    ctx.drawImage(img, 0, 0, svgW, svgH);
    return canvas;
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function exportSequencePdf(
  canvasEl: HTMLElement,
  title: string,
  creator: string,
  version: string,
  mode: string,
) {
  const svgEl = canvasEl.querySelector('svg.select-none') as SVGSVGElement | null;
  if (!svgEl) {
    alert('Sequenz-SVG nicht gefunden.');
    return;
  }

  const PIXEL_RATIO = 2;
  const svgW = svgEl.width.baseVal.value;
  const svgH = svgEl.height.baseVal.value;

  const fullCanvas = await renderSequenceSvg(svgEl, PIXEL_RATIO);

  // A4 landscape
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageW = pdf.internal.pageSize.getWidth();  // 297 mm
  const pageH = pdf.internal.pageSize.getHeight(); // 210 mm

  const TITLE_H = 22; // mm
  const MARGIN  = 5;  // mm
  const contentW_mm = pageW - MARGIN * 2;
  const contentH_mm = pageH - TITLE_H - MARGIN;

  // Scale so SVG width fills the page
  const scale   = contentW_mm / svgW;  // mm per SVG pixel
  const numPages = Math.ceil((svgH * scale) / contentH_mm);

  for (let page = 0; page < numPages; page++) {
    if (page > 0) pdf.addPage();

    drawTitleBar(pdf, pageW, TITLE_H, title, mode, creator, version, page + 1, numPages);

    // Which SVG pixel rows go on this page
    const startPx = Math.round((page       * contentH_mm / scale) * PIXEL_RATIO);
    const endPx   = Math.round(Math.min(svgH, (page + 1) * contentH_mm / scale) * PIXEL_RATIO);
    const chunkPx = endPx - startPx;
    const chunkW  = fullCanvas.width;

    const slice = document.createElement('canvas');
    slice.width  = chunkW;
    slice.height = chunkPx;
    const sCtx = slice.getContext('2d')!;
    sCtx.drawImage(fullCanvas, 0, startPx, chunkW, chunkPx, 0, 0, chunkW, chunkPx);

    const chunkH_mm = (chunkPx / PIXEL_RATIO) * scale;
    pdf.addImage(slice.toDataURL('image/png'), 'PNG', MARGIN, TITLE_H + 2, contentW_mm, chunkH_mm);
  }

  pdf.save(`${(title || 'diagramm').replace(/\s+/g, '_')}.pdf`);
}

// ─── Swimlane export (html-to-image, canvas area only) ───────────────────────

async function exportSwimlanePdf(
  canvasEl: HTMLElement,
  title: string,
  creator: string,
  version: string,
  mode: string,
) {
  // Target only the React Flow canvas, not the palette or properties panel
  const rfEl = canvasEl.querySelector<HTMLElement>('.react-flow') ?? canvasEl;

  const dataUrl = await toPng(rfEl, { quality: 1, pixelRatio: 2 });

  const img = await loadImage(dataUrl);
  const ratio = img.naturalWidth / img.naturalHeight;

  const pdf = new jsPDF({ orientation: ratio >= 1 ? 'landscape' : 'portrait', unit: 'mm' });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  const TITLE_H = 22;
  const MARGIN  = 5;

  drawTitleBar(pdf, pageW, TITLE_H, title, mode, creator, version, 1, 1);

  const areaW = pageW - MARGIN * 2;
  const areaH = pageH - TITLE_H - MARGIN;
  let drawW = areaW;
  let drawH = drawW / ratio;
  if (drawH > areaH) { drawH = areaH; drawW = drawH * ratio; }

  pdf.addImage(dataUrl, 'PNG', (pageW - drawW) / 2, TITLE_H + 2, drawW, drawH);
  pdf.save(`${(title || 'diagramm').replace(/\s+/g, '_')}.pdf`);
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function exportToPdf(
  canvasEl: HTMLElement,
  viewType: 'swimlane' | 'sequence',
  title: string,
  creator: string,
  version: string,
  mode: string,
) {
  if (viewType === 'sequence') {
    await exportSequencePdf(canvasEl, title, creator, version, mode);
  } else {
    await exportSwimlanePdf(canvasEl, title, creator, version, mode);
  }
}
