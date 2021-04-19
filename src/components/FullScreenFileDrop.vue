<template>
  <transition>
    <div
      v-if="isVisible"
      class="full-screen-file-drop"
    >
      <span class="message">ここにログファイルをドロップ!</span>
    </div>
  </transition>
</template>

<script lang="ts">
// 参考: vue-full-screen-file-drop
// https://github.com/crcatala/vue-full-screen-file-drop#readme

import { Component, Vue } from 'vue-property-decorator';

@Component
export default class FileDropDialog extends Vue {
  isVisible = false;

  lastTarget: EventTarget | null = null;

  onDragEnter(e: DragEvent): void {
    this.lastTarget = e.target;
    this.isVisible = true;
  }

  onDragLeave(e: DragEvent): void {
    if (e.target === this.lastTarget) {
      this.isVisible = false;
    }
  }

  onDragOver(e: DragEvent): void {
    e.preventDefault();
  }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    this.isVisible = false;

    const srcFileList = e.dataTransfer?.files;
    if (!srcFileList) {
      return;
    }

    const dstFileArray: File[] = [];
    for (let i = 0; i < srcFileList.length; i += 1) {
      dstFileArray.push(srcFileList[i]);
    }
    this.$emit('drop', dstFileArray);
  }

  mounted(): void {
    window.addEventListener('dragenter', this.onDragEnter);
    window.addEventListener('dragleave', this.onDragLeave);
    window.addEventListener('dragover', this.onDragOver);
    window.addEventListener('drop', this.onDrop);
  }

  beforeDestroy(): void {
    window.removeEventListener('dragenter', this.onDragEnter);
    window.removeEventListener('dragleave', this.onDragLeave);
    window.removeEventListener('dragover', this.onDragOver);
    window.removeEventListener('drop', this.onDrop);
  }
}
</script>

<style lang="scss" scoped>
.v-enter-active, .v-leave-active {
  transition: opacity .2s
}

.v-enter, .v-leave-to {
  opacity: 0
}

.full-screen-file-drop {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 10000;
  width: 100%;
  height: 100%;

  display: flex;
  justify-content: center;
  align-items: center;

  background: #0007;
  transition: visibility 200ms, opacity 200ms;

  &:before {
    border: 5px dashed #fff;
    border-radius: 20px;
    content: "";
    bottom: 60px;
    left: 60px;
    position: absolute;
    right: 60px;
    top: 60px;
  }

  .message {
    color: white;
    font-size: 2rem;
  }
}
</style>
