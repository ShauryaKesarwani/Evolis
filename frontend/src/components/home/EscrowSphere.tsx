"use client";

import { useEffect, useRef } from "react";

interface Particle {
  angle: number;
  radius: number;
  speed: number;
  alpha: number;
}

interface EscrowSphereProps {
  completionPercentage?: number;
}

export default function EscrowSphere({ completionPercentage = 65 }: EscrowSphereProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const setCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    // Initialize particles
    const particleCount = 30;
    for (let i = 0; i < particleCount; i++) {
      particlesRef.current.push({
        angle: Math.random() * Math.PI * 2,
        radius: 120 + Math.random() * 40,
        speed: 0.002 + Math.random() * 0.003,
        alpha: 0.3 + Math.random() * 0.4,
      });
    }

    let rotationX = 0;
    let rotationY = 0;

    const drawSphere = () => {
      const rect = canvas.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const radius = Math.min(rect.width, rect.height) * 0.28;

      ctx.clearRect(0, 0, rect.width, rect.height);

      // Draw particles orbiting
      particlesRef.current.forEach((particle) => {
        particle.angle += particle.speed;
        const x = centerX + Math.cos(particle.angle) * particle.radius;
        const y = centerY + Math.sin(particle.angle) * particle.radius * 0.5;

        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(181, 227, 21, ${particle.alpha})`;
        ctx.fill();
      });

      // Draw outer glow
      const gradient = ctx.createRadialGradient(centerX, centerY, radius * 0.8, centerX, centerY, radius * 1.3);
      gradient.addColorStop(0, "rgba(181, 227, 21, 0)");
      gradient.addColorStop(0.5, "rgba(181, 227, 21, 0.1)");
      gradient.addColorStop(1, "rgba(181, 227, 21, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.3, 0, Math.PI * 2);
      ctx.fill();

      // Draw sphere segments
      const segments = 20;
      const meridians = 12;

      for (let i = 0; i <= segments; i++) {
        const lat = (Math.PI * i) / segments;
        const y = Math.cos(lat);
        const r = Math.sin(lat);

        for (let j = 0; j < meridians; j++) {
          const lon = (2 * Math.PI * j) / meridians;

          // Apply rotation
          let x = r * Math.cos(lon + rotationY);
          let z = r * Math.sin(lon + rotationY);

          const tempY = y;
          const rotatedY = tempY * Math.cos(rotationX) - z * Math.sin(rotationX);
          const rotatedZ = tempY * Math.sin(rotationX) + z * Math.cos(rotationX);

          // Project 3D to 2D
          const scale = 200 / (200 + rotatedZ * 100);
          const x2d = centerX + x * radius * scale;
          const y2d = centerY + rotatedY * radius * scale;

          // Determine if this segment should be filled based on completion
          const segmentPercent = (i / segments) * 100;
          const isFilled = segmentPercent <= completionPercentage;

          // Color based on depth and fill state
          const depthFactor = (rotatedZ + 1) / 2;
          const alpha = 0.3 + depthFactor * 0.5;

          if (isFilled) {
            ctx.fillStyle = `rgba(181, 227, 21, ${alpha})`;
          } else {
            ctx.fillStyle = `rgba(17, 17, 17, ${alpha * 0.3})`;
          }

          ctx.beginPath();
          ctx.arc(x2d, y2d, 3 * scale, 0, Math.PI * 2);
          ctx.fill();

          // Draw connections
          if (j > 0 && i > 0) {
            ctx.strokeStyle = isFilled ? `rgba(181, 227, 21, ${alpha * 0.3})` : `rgba(17, 17, 17, ${alpha * 0.2})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(x2d, y2d);

            // Calculate previous point
            const prevLon = (2 * Math.PI * (j - 1)) / meridians;
            let prevX = r * Math.cos(prevLon + rotationY);
            let prevZ = r * Math.sin(prevLon + rotationY);
            const prevRotatedY = y * Math.cos(rotationX) - prevZ * Math.sin(rotationX);
            const prevRotatedZ = y * Math.sin(rotationX) + prevZ * Math.cos(rotationX);
            const prevScale = 200 / (200 + prevRotatedZ * 100);

            ctx.lineTo(
              centerX + prevX * radius * prevScale,
              centerY + prevRotatedY * radius * prevScale
            );
            ctx.stroke();
          }
        }
      }

      // Draw center text
      ctx.fillStyle = "#111111";
      ctx.font = "bold 48px 'Martian Mono', monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${completionPercentage}%`, centerX, centerY);

      ctx.fillStyle = "#111111";
      ctx.font = "10px 'Martian Mono', monospace";
      ctx.fillText("FUNDED", centerX, centerY + 30);

      // Update rotation
      rotationY += 0.005;
      rotationX = Math.sin(Date.now() * 0.0003) * 0.3;

      animationFrameRef.current = requestAnimationFrame(drawSphere);
    };

    drawSphere();

    return () => {
      window.removeEventListener("resize", setCanvasSize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [completionPercentage]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ width: "100%", height: "100%" }}
      />
      
      {/* Info overlay */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
        <div className="font-mono font-bold text-sm text-[#111111]">Escrow Progress</div>
        <div className="px-3 py-1 bg-accent/20 text-[#111111] text-xs font-bold rounded-full border border-[#111111]/20">
          Live
        </div>
      </div>

      <div className="absolute bottom-6 left-6 right-6">
        <div className="text-2xl font-mono font-black text-[#111111] mb-1">
          35,450 <span className="text-sm text-[#111111]/50">BNB</span>
        </div>
        <div className="text-xs font-sans text-[#111111]/60 tracking-wide">
          LOCKED IN SMART CONTRACT
        </div>
      </div>
    </div>
  );
}
