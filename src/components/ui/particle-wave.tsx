"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface ParticleWaveProps {
  className?: string;
  particleColor?: string;
  glowColor?: string;
  countX?: number;
  countZ?: number;
  separation?: number;
  waveSpeed?: number;
  waveHeight?: number;
}

export function ParticleWave({
  className,
  particleColor = "rgba(168, 85, 247, 0.75)", // Soft purple
  glowColor = "rgba(192, 132, 252, 0.4)",
  countX = 55,
  countZ = 42,
  separation = 34,
  waveSpeed = 0.03,
  waveHeight = 32,
}: ParticleWaveProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse coordinates with easing
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      // Normalized between -1 and 1
      targetMouseX = (e.clientX / width) * 2 - 1;
      targetMouseY = (e.clientY / height) * 2 - 1;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        targetMouseX = (e.touches[0].clientX / width) * 2 - 1;
        targetMouseY = (e.touches[0].clientY / height) * 2 - 1;
      }
    };

    const handleResize = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.width = window.innerWidth * dpr;
      height = canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("resize", handleResize);

    // Initial setup with dpr
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.width = window.innerWidth * dpr;
    height = canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);

    let step = 0;

    const render = () => {
      const renderWidth = width / dpr;
      const renderHeight = height / dpr;

      ctx.clearRect(0, 0, renderWidth, renderHeight);

      // Smooth mouse interpolation
      mouseX += (targetMouseX - mouseX) * 0.06;
      mouseY += (targetMouseY - mouseY) * 0.06;

      step += waveSpeed;

      const fov = 380;
      const centerX = renderWidth / 2;
      const centerY = renderHeight * 0.52;

      // Dynamic tilt based on mouse position
      const pitch = 0.58 + mouseY * 0.18; // Camera tilt angle
      const cosPitch = Math.cos(pitch);
      const sinPitch = Math.sin(pitch);
      const yaw = mouseX * 0.22; // Subtle side rotation
      const cosYaw = Math.cos(yaw);
      const sinYaw = Math.sin(yaw);

      const halfX = (countX * separation) / 2;
      const halfZ = (countZ * separation) / 2;

      // Draw particle wave
      for (let ix = 0; ix < countX; ix++) {
        for (let iz = 0; iz < countZ; iz++) {
          // World 3D positions
          const rawX = ix * separation - halfX;
          const rawZ = iz * separation - halfZ;

          // Double sine wave oscillation with mouse wave disturbance
          const distToCenter = Math.sqrt(rawX * rawX + rawZ * rawZ) / 380;
          const mouseDist = Math.hypot(
            (rawX / renderWidth) * 2 - mouseX,
            (rawZ / renderHeight) * 2 - mouseY
          );
          const mouseWave = Math.sin(mouseDist * 6 - step * 2) * Math.max(0, 1.2 - mouseDist) * 16;

          const y =
            Math.sin(ix * 0.3 + step) * waveHeight +
            Math.sin(iz * 0.4 + step * 1.3) * (waveHeight * 0.75) +
            Math.cos(distToCenter * 4 - step) * 14 +
            mouseWave;

          // Yaw rotation (side to side)
          const rx = rawX * cosYaw - rawZ * sinYaw;
          const rz = rawX * sinYaw + rawZ * cosYaw;

          // Pitch rotation (looking down towards ground plane)
          const rotY = y * cosPitch - (rz + 260) * sinPitch;
          const rotZ = y * sinPitch + (rz + 260) * cosPitch + 480;

          if (rotZ > 10) {
            const scale = fov / rotZ;
            const screenX = centerX + rx * scale;
            const screenY = centerY + rotY * scale;

            // Particle depth-based sizing and opacity
            const depthFactor = Math.max(0, Math.min(1, 1 - (rotZ - 200) / 1000));
            const radius = Math.max(0.7, (1.2 + (y / waveHeight) * 0.9) * scale * 1.3);

            // Shading: wave crests are brighter white/cyan, troughs are deep purple
            const crest = Math.max(0, Math.min(1, (y + waveHeight) / (waveHeight * 2)));
            const alpha = Math.max(0.12, Math.min(0.95, depthFactor * (0.35 + crest * 0.65)));

            ctx.beginPath();
            ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);

            // Crest highlight
            if (crest > 0.65 && depthFactor > 0.4) {
              ctx.fillStyle = `rgba(245, 240, 255, ${alpha})`;
            } else if (crest > 0.35) {
              ctx.fillStyle = `rgba(192, 132, 252, ${alpha})`;
            } else {
              ctx.fillStyle = `rgba(147, 51, 234, ${alpha * 0.85})`;
            }

            ctx.fill();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("resize", handleResize);
    };
  }, [countX, countZ, separation, waveSpeed, waveHeight, particleColor, glowColor]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("absolute inset-0 block h-full w-full pointer-events-none select-none", className)}
      style={{ touchAction: "none" }}
    />
  );
}

/**
 * DemoOne component matching the exact snippet requested
 */
const DemoOne = () => {
  return (
    <div className="relative w-full h-screen bg-background overflow-hidden">
      <ParticleWave />
      <div className="absolute top-4 left-4 z-10 text-foreground/80 text-sm font-mono">
        <p>Particle Wave Animation</p>
        <p className="text-xs opacity-60 mt-1">Move your mouse to interact</p>
      </div>
    </div>
  );
};

export { DemoOne };
export default ParticleWave;
