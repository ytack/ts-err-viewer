<template>
  <v-dialog
    v-model="isShowDialog"
    persistent
    max-width="640"
  >
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        icon
        v-bind="attrs"
        v-on="on"
      >
        <v-icon>mdi-cog</v-icon>
      </v-btn>
    </template>
    <v-card>
      <v-card-title class="headline">
        設定
      </v-card-title>
      <v-card-text>
        <v-form ref="settinsgForm">
          <v-combobox
            v-model="excludePIDsFromCountStr"
            append-icon=""
            hint="0xFFFF または FFFF。PID filtered drop / scramble で指定した PID が除外されます"
            persistent-hint
            label="フィルタ対象の PID"
            :rules="pidRules"
            multiple
            chips
            deletable-chips
          />
          <v-combobox
            v-model="excludePIDNamesFromCount"
            append-icon=""
            hint="EIT など。PID filtered drop / scramble で指定した PID が除外されます"
            persistent-hint
            label="フィルタ対象の PID 名"
            multiple
            chips
            deletable-chips
          />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="green darken-1"
          text
          @click="onOkButtonClicked"
        >
          OK
        </v-btn>
        <v-btn
          color="green darken-1"
          text
          @click="onCancelButtonClicked"
        >
          キャンセル
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import store from '@/store';
import TsErrViewerConfig from '@/models/ts-err-viewer-config';

const PID_REGEXES = [/^0x([\dA-Fa-f]{4})$/, /^([\dA-Fa-f]{4})$/];

@Component
export default class SettingsDialog extends Vue {
  isShowDialogData = false;

  get isShowDialog(): boolean {
    return this.isShowDialogData;
  }

  set isShowDialog(val: boolean) {
    this.isShowDialogData = val;
    if (val) {
      this.loadConfig();
    }
  }

  pidRules = [
    (inputValue: string[]): boolean | string => (
      inputValue.every((v) => PID_REGEXES.some((r) => r.test(v))) ? true : '不正な値が含まれています'
    ),
  ];

  excludePIDNamesFromCount = [] as string[];

  excludePIDsFromCountStr = [] as string[];

  loadConfig(): void {
    const config = store.getters.config as TsErrViewerConfig;
    this.excludePIDNamesFromCount = config.excludePIDNamesFromCount;
    this.excludePIDsFromCountStr = config.excludePIDsFromCount
      .map((pid) => `0x${(`0000${pid.toString(16)}`).substr(-4).toUpperCase()}`);
  }

  saveConfig(): void {
    const config = JSON.parse(JSON.stringify(store.getters.config)) as TsErrViewerConfig;
    const pids = this.excludePIDsFromCountStr
      .map((v): number => {
        const regex = PID_REGEXES.find((r) => r.test(v));
        const matches = regex ? v.match(regex) : null;

        if (!matches) {
          // Vuetifyのバリデーションが正常に動作していればあり得ない
          throw new Error('Invalid format!');
        }
        return parseInt(matches[1], 16);
      });

    config.excludePIDNamesFromCount = this.excludePIDNamesFromCount.slice();
    config.excludePIDsFromCount = [...new Set(pids)];

    store.dispatch('setConfig', config);
  }

  onOkButtonClicked(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(this.$refs.settinsgForm as any).validate()) {
      return;
    }
    this.saveConfig();
    this.isShowDialog = false;
  }

  onCancelButtonClicked(): void {
    this.isShowDialog = false;
  }
}
</script>
