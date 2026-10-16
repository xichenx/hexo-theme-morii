'use strict';
hexo.extend.helper.register('morii_effects', () => {
  const config = hexo.theme.config.appearance?.effects || {};
  const enabled = config.enable !== false;
  const density = Number(config.density ?? 48);
  return {
    enabled,
    aurora: enabled && config.aurora !== false,
    particles: enabled && config.particles !== false,
    glass: enabled && config.glass !== false,
    spotlight: enabled && config.spotlight !== false,
    tilt: enabled && config.tilt !== false,
    ripple: enabled && config.ripple !== false,
    transition: enabled && config.theme_transition !== false,
    density: Number.isFinite(density) ? Math.round(Math.max(12, Math.min(80, density))) : 48
  };
});
