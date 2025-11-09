import { useEffect, useRef } from 'react';
import { PhasorData } from '../types';

interface PhasorDiagramProps {
  phasorData: PhasorData;
  width?: number;
  height?: number;
}

const COLORS = {
  phaseA: '#ef4444',
  phaseB: '#3b82f6',
  phaseC: '#22c55e',
  neutral: '#f59e0b',
  grid: '#374151',
  background: '#111827',
  text: '#9ca3af',
  sequenceDirect: '#00ff00',    // Vert pour séquence directe
  sequenceInverse: '#ff00ff',   // Magenta pour séquence inverse
  sequenceHomopolar: '#ffff00', // Jaune pour séquence homopolaire
};

export function PhasorDiagram({ phasorData, width = 400, height = 400 }: PhasorDiagramProps) {
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

    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) / 2 - 40;

    const maxMagnitude = Math.max(
      phasorData.ia.magnitude,
      phasorData.ib.magnitude,
      phasorData.ic.magnitude,
      phasorData.in.magnitude,
      1
    );
    const scale = maxRadius / maxMagnitude;

    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);

    for (let i = 1; i <= 3; i++) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, (maxRadius / 3) * i, 0, 2 * Math.PI);
      ctx.stroke();

      ctx.fillStyle = COLORS.text;
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${((maxMagnitude / 3) * i).toFixed(0)}A`, centerX + 5, centerY - (maxRadius / 3) * i);
    }

    ctx.setLineDash([]);
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(centerX - maxRadius - 10, centerY);
    ctx.lineTo(centerX + maxRadius + 10, centerY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX, centerY - maxRadius - 10);
    ctx.lineTo(centerX, centerY + maxRadius + 10);
    ctx.stroke();

    const drawPhasor = (magnitude: number, angle: number, color: string, label: string, lineWidth: number = 3) => {
      if (magnitude < 0.01) return;

      const endX = centerX + magnitude * scale * Math.cos(angle);
      const endY = centerY - magnitude * scale * Math.sin(angle);

      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = lineWidth;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      const arrowLength = 12;
      const arrowAngle = Math.PI / 6;

      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(
        endX - arrowLength * Math.cos(angle - arrowAngle),
        endY + arrowLength * Math.sin(angle - arrowAngle)
      );
      ctx.lineTo(
        endX - arrowLength * Math.cos(angle + arrowAngle),
        endY + arrowLength * Math.sin(angle + arrowAngle)
      );
      ctx.closePath();
      ctx.fill();

      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const labelDistance = Math.max(magnitude * scale + 25, 40);
      const labelX = centerX + labelDistance * Math.cos(angle);
      const labelY = centerY - labelDistance * Math.sin(angle);

      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 4;
      ctx.fillText(label, labelX, labelY);

      ctx.font = '12px sans-serif';
      const magText = `${magnitude.toFixed(1)}A`;
      const angleText = `${((angle * 180 / Math.PI + 360) % 360).toFixed(0)}°`;
      ctx.fillText(`${magText}, ${angleText}`, labelX, labelY + 17);

      ctx.shadowBlur = 0;
    };

    if (phasorData.in.magnitude > 0.5) {
      drawPhasor(phasorData.in.magnitude, phasorData.in.angle, COLORS.neutral, 'In', 5);
    }

    if (phasorData.ia.magnitude > 0.01) {
      drawPhasor(phasorData.ia.magnitude, phasorData.ia.angle, COLORS.phaseA, 'Ia', 4);
    }

    if (phasorData.ib.magnitude > 0.01) {
      drawPhasor(phasorData.ib.magnitude, phasorData.ib.angle, COLORS.phaseB, 'Ib', 4);
    }

    if (phasorData.ic.magnitude > 0.01) {
      drawPhasor(phasorData.ic.magnitude, phasorData.ic.angle, COLORS.phaseC, 'Ic', 4);
    }

    // Afficher les séquences si disponibles
    if (phasorData.sequences) {
      if (phasorData.sequences.direct.magnitude > 0.01) {
        drawPhasor(phasorData.sequences.direct.magnitude, phasorData.sequences.direct.angle, COLORS.sequenceDirect, 'Seq+', 6);
      }
      if (phasorData.sequences.inverse.magnitude > 0.01) {
        drawPhasor(phasorData.sequences.inverse.magnitude, phasorData.sequences.inverse.angle, COLORS.sequenceInverse, 'Seq-', 6);
      }
      if (phasorData.sequences.homopolar.magnitude > 0.01) {
        drawPhasor(phasorData.sequences.homopolar.magnitude, phasorData.sequences.homopolar.angle, COLORS.sequenceHomopolar, 'Seq0', 6);
      }
    }

    ctx.fillStyle = COLORS.text;
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    const debugY = 10;
    ctx.fillText(`Ia: ${phasorData.ia.magnitude.toFixed(1)}A ∠${((phasorData.ia.angle * 180 / Math.PI + 360) % 360).toFixed(0)}°`, 10, debugY);
    ctx.fillText(`Ib: ${phasorData.ib.magnitude.toFixed(1)}A ∠${((phasorData.ib.angle * 180 / Math.PI + 360) % 360).toFixed(0)}°`, 10, debugY + 15);
    ctx.fillText(`Ic: ${phasorData.ic.magnitude.toFixed(1)}A ∠${((phasorData.ic.angle * 180 / Math.PI + 360) % 360).toFixed(0)}°`, 10, debugY + 30);
    ctx.fillText(`In: ${phasorData.in.magnitude.toFixed(1)}A`, 10, debugY + 45);

    // Afficher les informations des séquences si disponibles
    if (phasorData.sequences) {
      ctx.fillStyle = COLORS.sequenceDirect;
      ctx.fillText(`Seq+: ${phasorData.sequences.direct.magnitude.toFixed(1)}A ∠${((phasorData.sequences.direct.angle * 180 / Math.PI + 360) % 360).toFixed(0)}°`, 10, debugY + 65);
      ctx.fillStyle = COLORS.sequenceInverse;
      ctx.fillText(`Seq-: ${phasorData.sequences.inverse.magnitude.toFixed(1)}A ∠${((phasorData.sequences.inverse.angle * 180 / Math.PI + 360) % 360).toFixed(0)}°`, 10, debugY + 80);
      ctx.fillStyle = COLORS.sequenceHomopolar;
      ctx.fillText(`Seq0: ${phasorData.sequences.homopolar.magnitude.toFixed(1)}A ∠${((phasorData.sequences.homopolar.angle * 180 / Math.PI + 360) % 360).toFixed(0)}°`, 10, debugY + 95);
    }

  }, [phasorData, width, height]);

  return <canvas ref={canvasRef} className="rounded-lg border border-gray-700" />;
}
