<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import showcase from '../../../docs/media/morii.png'
</script>

<template>
  <DefaultTheme.Layout>
    <template #home-hero-image>
      <img
        class="morii-hero-showcase"
        :src="showcase"
        alt="Morii 在桌面显示器、笔记本、平板和手机上的页面预览"
        width="800"
        height="500"
        decoding="async"
      >
    </template>
  </DefaultTheme.Layout>
</template>

<style>
.VPHero:has(.morii-hero-showcase) .image {
  min-width: 0;
  margin: 0 0 28px;
}

.VPHero:has(.morii-hero-showcase) .image-container {
  width: min(100%, 520px);
  height: auto;
  transform: none;
}

.morii-hero-showcase {
  display: block;
  width: 100%;
  height: auto;
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
}

@media (min-width: 960px) {
  .VPHero:has(.morii-hero-showcase) .container {
    align-items: center;
    gap: clamp(24px, 4vw, 56px);
  }

  .VPHero:has(.morii-hero-showcase) .main {
    flex: 0 1 50%;
  }

  .VPHero:has(.morii-hero-showcase) .image {
    flex: 1 1 0;
    margin: 0;
  }
}
</style>
