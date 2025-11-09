import { useEffect, useRef } from 'react';
import { SignalData } from '../types';

interface WaveformCanvasProps {
  signalData: SignalData;
  mode: 'single' | 'three_phase';
  width?: number;
  height?: number;
  language?: 'fr' | 'ar' | 'en';
}

const COLORS = {
  phaseA: '#ef4444',
  phaseB: '#3b82f6',
  phaseC: '#22c55e',
  neutral: '#f59e0b',
  grid: '#374151',
  background: '#111827',
  text: '#9ca3af',
};

export function WaveformCanvas({ signalData, mode, width = 800, height = 400, language = 'fr' }: WaveformCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, width, height);

    const padding = { top: 40, right: 20, bottom: 40, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const signals = mode === 'single' ? [signalData.ia] : [signalData.ia, signalData.ib, signalData.ic, signalData.in];
    const colors = mode === 'single' ? [COLORS.phaseA] : [COLORS.phaseA, COLORS.phaseB, COLORS.phaseC, COLORS.neutral];
    const labels = mode === 'single' ? ['i(t)'] : ['ia', 'ib', 'ic', 'in'];

    const allValues = signals.flat();
    const maxVal = Math.max(...allValues.map(Math.abs), 1);
    const yScale = chartHeight / (2 * maxVal * 1.1);
    const xScale = chartWidth / (signalData.t.length - 1);

    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);

    for (let i = -2; i <= 2; i++) {
      const y = padding.top + chartHeight / 2 - i * (chartHeight / 4);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartWidth, y);
      ctx.stroke();

      ctx.fillStyle = COLORS.text;
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${(i * maxVal / 2).toFixed(0)}`, padding.left - 10, y);
    }

    ctx.setLineDash([]);

    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top + chartHeight / 2);
    ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight / 2);
    ctx.stroke();

    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, padding.top + chartHeight);
    ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
    ctx.stroke();

    signals.forEach((signal, idx) => {
      if (signal.length === 0) return;

      ctx.strokeStyle = colors[idx];
      ctx.lineWidth = mode === 'three_phase' && idx === 3 ? 2.5 : 2;
      ctx.setLineDash([]);

      ctx.beginPath();
      signal.forEach((val, i) => {
        const x = padding.left + i * xScale;
        const y = padding.top + chartHeight / 2 - val * yScale;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
    });

    ctx.font = '14px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    labels.forEach((label, idx) => {
      ctx.fillStyle = colors[idx];
      ctx.fillText(label, padding.left + 10 + idx * 60, 10);
    });

    ctx.fillStyle = COLORS.text;
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const timeLabel = language === 'fr' ? 'Temps (périodes)' : language === 'ar' ? 'الزمن (دورات)' : 'Time (periods)';
    ctx.fillText(timeLabel, width / 2, height - 20);

    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const currentLabel = language === 'fr' ? 'Courant (A)' : language === 'ar' ? 'التيار (أمبير)' : 'Current (A)';
    ctx.fillText(currentLabel, 0, 0);
    ctx.restore();

  }, [signalData, mode, width, height, language]);

  return <canvas ref={canvasRef} className="rounded-lg border border-gray-700" />;
}
