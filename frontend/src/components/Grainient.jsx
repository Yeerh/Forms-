import { useMemo } from "react";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function Grainient({
  color1 = "#4f78d8",
  color2 = "#f5f5f5",
  color3 = "#0f33e6",
  timeSpeed = 0.25,
  colorBalance = 0,
  warpStrength = 1,
  warpFrequency = 5,
  warpSpeed = 2,
  warpAmplitude = 50,
  blendAngle = 0,
  blendSoftness = 0.05,
  rotationAmount = 500,
  noiseScale = 2,
  grainAmount = 0.1,
  grainScale = 2,
  grainAnimated = false,
  contrast = 1.5,
  gamma = 1,
  saturation = 1,
  centerX = 0,
  centerY = 0,
  zoom = 0.9,
}) {
  const gradientStyle = useMemo(() => {
    const cx = clamp(50 + centerX * 20, 0, 100);
    const cy = clamp(50 + centerY * 20, 0, 100);
    const softness = clamp(blendSoftness * 1000, 5, 60);
    const balance = clamp(colorBalance * 20, -25, 25);

    return {
      background: `
        linear-gradient(${blendAngle}deg, ${color1} 0%, ${color2} ${50 + balance}%, ${color3} 100%),
        radial-gradient(circle at ${cx}% ${cy}%, ${color3} 0%, transparent ${softness}%),
        radial-gradient(circle at ${100 - cx}% ${100 - cy}%, ${color1} 0%, transparent ${softness}%)
      `,
      filter: `contrast(${contrast}) saturate(${saturation}) brightness(${gamma})`,
      transform: `scale(${zoom}) rotate(${rotationAmount * 0.001}deg)`,
    };
  }, [
    blendAngle,
    blendSoftness,
    centerX,
    centerY,
    color1,
    color2,
    color3,
    colorBalance,
    contrast,
    gamma,
    rotationAmount,
    saturation,
    zoom,
  ]);

  const warpStyle = useMemo(() => {
    const frequency = clamp(warpFrequency, 1, 16);
    const speed = clamp(warpSpeed, 0.1, 8);
    const strength = clamp(warpStrength, 0, 4);
    const amplitude = clamp(warpAmplitude, 0, 120);
    const duration = clamp(40 / Math.max(timeSpeed, 0.01), 6, 120);

    return {
      opacity: clamp(0.12 * strength, 0, 0.5),
      backgroundSize: `${120 / frequency}px ${120 / frequency}px`,
      animationDuration: `${duration / speed}s`,
      transform: `translate3d(0, 0, 0) scale(${1 + amplitude / 1000})`,
    };
  }, [timeSpeed, warpAmplitude, warpFrequency, warpSpeed, warpStrength]);

  const grainStyle = useMemo(() => {
    const opacity = clamp(grainAmount, 0, 1) * 0.3;
    const size = clamp(120 / grainScale, 30, 220);
    const animatedDuration = clamp(4 / Math.max(timeSpeed, 0.01), 0.6, 16);

    return {
      opacity,
      backgroundSize: `${size * noiseScale}px ${size * noiseScale}px`,
      animationDuration: `${animatedDuration}s`,
      animationPlayState: grainAnimated ? "running" : "paused",
    };
  }, [grainAmount, grainAnimated, grainScale, noiseScale, timeSpeed]);

  return (
    <div className="grainient-root">
      <div className="grainient-gradient" style={gradientStyle} />
      <div className="grainient-warp" style={warpStyle} />
      <div className="grainient-grain" style={grainStyle} />
    </div>
  );
}

export default Grainient;

