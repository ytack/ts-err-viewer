<template>
  <v-app>
    <AppBar />

    <v-main>
      <div class="pa-6">
        <TsErrViewer />
      </div>
    </v-main>

    <FullScreenFileDrop @drop="onDrop" />
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import store from '@/store';
import AppBar from '@/components/AppBar.vue';
import FullScreenFileDrop from '@/components/FullScreenFileDrop.vue';
import TsErrViewer from '@/components/TsErrViewer.vue';
import TsErrViewerConfig from './models/ts-err-viewer-config';

@Component({
  components: {
    AppBar,
    FullScreenFileDrop,
    TsErrViewer,
  },
})
export default class App extends Vue {
  onDrop(files: File[]):void {
    if ((store.getters.config as TsErrViewerConfig).isClearOnDrop) {
      store.dispatch('removeAllTsErr');
    }

    store.dispatch('addFiles', files);
  }
}
</script>
