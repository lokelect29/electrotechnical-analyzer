import { useEffect, useRef, useState } from 'react';
import { Harmonic } from '../types';

interface PointByPointCanvasProps {
  harmonics: Harmonic[];
  f0: number;
  time: number;
  width?: number;
  height?: number;
  language: 'fr' | 'ar' | 'en';
}

const COLORS = {
  components: ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#ec4899', '#14b8a6'],
  sum: '#ffffff',
  grid: '#374151',
  background: '#111827',
  text: '#9ca3af',
  cursor: '#fbbf24',
};

export function PointByPointCanvas({
  harmonics,
  f0,
  time,
  width = 900,
  height = 500,
  language
}: PointByPointCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cursorX, setCursorX] = useState<number | null>(null);
  const [hoveredTime, setHoveredTime] = useState<number | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    setCursorX(x);

    const padding = { top: 40, right: 20, bottom: 60, left: 60 };
    const chartWidth = width - padding.left - padding.right;

    const relativeX = x - padding.left;
    const periods = 3;
    const T = 1 / f0;
    const hoveredT = (relativeX / chartWidth) * (periods * T) + time;
    setHoveredTime(hoveredT);
  };

  const handleMouseLeave = () => {
    setCursorX(null);
    setHoveredTime(null);
  };

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

    const padding = { top: 40, right: 20, bottom: 60, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const periods = 3;
    const samplesPerPeriod = 500;
    const totalSamples = periods * samplesPerPeriod;
    const T = 1 / f0;
    const omega0 = 2 * Math.PI * f0;

    const t = Array.from({ length: totalSamples }, (_, i) => (i / samplesPerPeriod) * T + time);

    const enabledHarmonics = harmonics.filter(h => h.enabled);
    const componentSignals: number[][] = [];
    const sumSignal = new Array(totalSamples).fill(0);

    enabledHarmonics.forEach(h => {
      const signal = new Array(totalSamples);
      for (let i = 0; i < totalSamples; i++) {
        const value = h.amp * Math.sin(h.k * omega0 * t[i] + h.phase);
        signal[i] = value;
        sumSignal[i] += value;
      }
      componentSignals.push(signal);
    });

    const allValues = [...sumSignal, ...componentSignals.flat()];
    const maxVal = Math.max(...allValues.map(Math.abs), 1);
    const yScale = chartHeight / (2 * maxVal * 1.2);
    const xScale = chartWidth / (totalSamples - 1);

    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);

    for (let i = -2; i <= 2; i++) {
      const y = padding.top + chartHeight / 2 - i * (chartHeight / 4);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartWidth, y);
      ctx.stroke();
    }

    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
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

    componentSignals.forEach((signal, idx) => {
      ctx.strokeStyle = COLORS.components[idx % COLORS.components.length];
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.6;

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

    ctx.globalAlpha = 1;
    ctx.strokeStyle = COLORS.sum;
    ctx.lineWidth = 3;

    ctx.beginPath();
    sumSignal.forEach((val, i) => {
      const x = padding.left + i * xScale;
      const y = padding.top + chartHeight / 2 - val * yScale;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    if (cursorX !== null && cursorX >= padding.left && cursorX <= padding.left + chartWidth) {
      ctx.strokeStyle = COLORS.cursor;
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(cursorX, padding.top);
      ctx.lineTo(cursorX, padding.top + chartHeight);
      ctx.stroke();

      if (hoveredTime !== null) {
        let sum = 0;
        const values: number[] = [];

        enabledHarmonics.forEach(h => {
          const value = h.amp * Math.sin(h.k * omega0 * hoveredTime + h.phase);
          values.push(value);
          sum += value;
        });

        let yPos = padding.top + chartHeight / 2;
        ctx.font = '12px monospace';
        ctx.fillStyle = COLORS.background;
        ctx.strokeStyle = COLORS.text;
        ctx.lineWidth = 1;

        const boxX = cursorX < width / 2 ? cursorX + 10 : cursorX - 180;
        const boxY = padding.top + 10;
        const boxWidth = 170;
        const boxHeight = 20 + values.length * 18 + 25;

        ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
        ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

        ctx.fillStyle = COLORS.text;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        let textY = boxY + 5;

        values.forEach((val, idx) => {
          ctx.fillStyle = COLORS.components[idx % COLORS.components.length];
          ctx.fillText(`H${enabledHarmonics[idx].k}: ${val.toFixed(2)}A`, boxX + 5, textY);
          textY += 18;
        });

        ctx.fillStyle = COLORS.sum;
        ctx.font = 'bold 13px monospace';
        const sumLabel = language === 'fr' ? 'Somme' : language === 'ar' ? 'المجموع' : 'Sum';
        ctx.fillText(`${sumLabel}: ${sum.toFixed(2)}A`, boxX + 5, textY + 5);
      }
    }

    ctx.fillStyle = COLORS.text;
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const timeLabel = language === 'fr' ? 'Temps (périodes)' : language === 'ar' ? 'الزمن (دورات)' : 'Time (periods)';
    ctx.fillText(timeLabel, width / 2, height - 25);

    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const currentLabel = language === 'fr' ? 'Courant (A)' : language === 'ar' ? 'التيار (أمبير)' : 'Current (A)';
    ctx.fillText(currentLabel, 0, 0);
    ctx.restore();

    ctx.font = '14px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    enabledHarmonics.forEach((h, idx) => {
      ctx.fillStyle = COLORS.components[idx % COLORS.components.length];
      ctx.fillText(`H${h.k}`, padding.left + 10 + idx * 50, 10);
    });

    ctx.fillStyle = COLORS.sum;
    ctx.font = 'bold 14px sans-serif';
    const sumLabel = language === 'fr' ? 'Somme' : language === 'ar' ? 'المجموع' : 'Sum';
    ctx.fillText(sumLabel, padding.left + 10 + enabledHarmonics.length * 50, 10);

  }, [harmonics, f0, time, width, height, cursorX, hoveredTime, language]);

  return (
    <canvas
      ref={canvasRef}
      className="rounded-lg border border-gray-700 cursor-crosshair"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    />
  );
}
