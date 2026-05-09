import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

export async function exportToPdf(
  canvasEl: HTMLElement,
  title: string,
  creator: string,
  version: string,
  mode: string,
) {
  const dataUrl = await toPng(canvasEl, { quality: 1, pixelRatio: 2 });

  const img = new Image();
  await new Promise<void>((res) => {
    img.onload = () => res();
    img.src = dataUrl;
  });

  const imgW = img.naturalWidth;
  const imgH = img.naturalHeight;
  const ratio = imgW / imgH;

  const pdf = new jsPDF({ orientation: ratio >= 1 ? 'landscape' : 'portrait', unit: 'mm' });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  // Title area
  const titleH = 24;
  pdf.setFillColor(30, 41, 59);
  pdf.rect(0, 0, pageW, titleH, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(14);
  pdf.text(title || 'net-flow-online', 10, 10);
  pdf.setFontSize(9);
  pdf.text(`${mode} · v${version} · ${creator} · ${new Date().toLocaleDateString('de-DE')}`, 10, 18);

  // Diagram image
  const imgAreaH = pageH - titleH - 4;
  const imgAreaW = pageW - 8;
  let drawW = imgAreaW;
  let drawH = drawW / ratio;
  if (drawH > imgAreaH) {
    drawH = imgAreaH;
    drawW = drawH * ratio;
  }
  const x = (pageW - drawW) / 2;
  pdf.addImage(dataUrl, 'PNG', x, titleH + 2, drawW, drawH);
  pdf.save(`${title.replace(/\s+/g, '_') || 'diagramm'}.pdf`);
}
