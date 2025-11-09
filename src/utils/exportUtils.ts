export function exportCanvasToPNG(canvas: HTMLCanvasElement, filename: string) {
  canvas.toBlob((blob) => {
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  });
}

export function exportAllCanvases(canvases: { canvas: HTMLCanvasElement; name: string }[]) {
  canvases.forEach(({ canvas, name }) => {
    exportCanvasToPNG(canvas, name);
  });
}
