<template>
  <v-app-bar
    app
    color="primary"
    dark
  >
    <v-toolbar-title>ts-err-viewer</v-toolbar-title>

    <v-spacer />

    <v-checkbox
      v-model="isClearOnDrop"
      class="mr-2"
      hide-details
      label="ファイル追加時にクリア"
    />

    <v-btn
      icon
      @click="removeAll"
    >
      <v-icon>mdi-delete</v-icon>
    </v-btn>

    <SettingsDialog />
  </v-app-bar>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import store from '@/store';
import SettingsDialog from '@/components/SettingsDialog.vue';
import TsErrViewerConfig from '@/models/TsErrViewerConfig';

@Component({
  components: {
    SettingsDialog,
  },
})
export default class AppBar extends Vue {
  removeAll(): void {
    store.dispatch('removeAllTsErr');
  }

  get isClearOnDrop(): boolean {
    return (store.getters.config as TsErrViewerConfig).isClearOnDrop;
  }

  set isClearOnDrop(val: boolean) {
    const config = store.getters.config as TsErrViewerConfig;
    config.isClearOnDrop = val;
    store.dispatch('setConfig', config);
  }
}
</script>
