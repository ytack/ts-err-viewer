<template>
  <div v-if="tableItems.length">
    <v-data-table
      dense
      :headers="headers"
      :items="tableItems"
      item-key="name"
      disable-pagination
      hide-default-footer
      class="elevation-1"
      :item-class="decideItemClass"
      @click:row="showDialog"
    >
      <template v-slot:[`item.removeButton`]="{ item }">
        <v-icon
          small
          class="mr-2"
          @click.stop="removeItem(item)"
        >
          mdi-close
        </v-icon>
      </template>
    </v-data-table>

    <v-dialog
      v-model="isShowRawTextDialog"
      max-width="800"
    >
      <v-card>
        <v-card-title class="headline">
          {{ dialogTargetItem ? dialogTargetItem.fileName: "" }}
        </v-card-title>

        <v-card-text class="raw-text-dialog-text">
          <span
            v-for="(text, index) in dialogTexts"
            :key="index"
          >
            {{ text.replace(/ /g, '&nbsp;') }}
            <br>
          </span>
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn
            color="green darken-1"
            text
            @click="isShowRawTextDialog = false"
          >
            閉じる
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
  <v-card v-else>
    <v-card-title>
      ログファイルがありません
    </v-card-title>
    <v-card-text>
      ログファイルをこのページ上にドロップして追加してください
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import store from '@/store';
import { TsErrPidInfoCountPropType, TsErrInfo, TsErrPidInfo } from '@/ts_err_parser/TsErrInfo';
import TsErrViewerConfig from '@/models/TsErrViewerConfig';

interface TsErrViewerTableItem {
  fileName: string;
  rawText: string;
  total: number;
  drop: number;
  scramble: number;
  filteredDrop: number;
  filteredScramble: number;
}

@Component
export default class TsErrLogViewer extends Vue {
    isShowRawTextDialog = false;

    dialogTargetItem: TsErrViewerTableItem | null = null;

    headers = [
      {
        text: 'File name',
        value: 'fileName',
      },
      { text: 'Total', value: 'total', width: 110 },
      { text: 'Drop', value: 'drop', width: 110 },
      { text: 'Scramble', value: 'scramble', width: 110 },
      { text: 'PID filtered drop', value: 'filteredDrop', width: 110 },
      { text: 'PID filtered scramble', value: 'filteredScramble', width: 110 },
      {
        text: '', value: 'removeButton', sortable: false, width: 56,
      },
    ];

    showDialog(tableItem: TsErrViewerTableItem): void {
      this.isShowRawTextDialog = true;
      this.dialogTargetItem = tableItem;
    }

    decideItemClass(tableItem: TsErrViewerTableItem): string {
      if (tableItem.filteredDrop) {
        return 'ts-err-viewer-red-row';
      } if (tableItem.scramble) {
        return 'ts-err-viewer-red-yellow';
      }

      return '';
    }

    removeItem(tableItem: TsErrViewerTableItem): void {
      store.dispatch('removeTsErr', tableItem.fileName);
    }

    calcPidInfoPropTotal(pids: TsErrPidInfo[], countPropName: TsErrPidInfoCountPropType): number {
      return pids.reduce((acc, val) => acc + val[countPropName], 0);
    }

    filterPID(pids: TsErrPidInfo[]): TsErrPidInfo[] {
      const config = store.getters.config as TsErrViewerConfig;
      return pids.filter((pid) => (
        !config.excludePIDsFromCount.includes(pid.pid)
        && !config.excludePIDNamesFromCount.includes(pid.name || '')
      ));
    }

    get tableItems(): TsErrViewerTableItem[] {
      const tsErrs = store.getters.tsErrs as TsErrInfo[];
      return tsErrs.map((tsErr) => {
        const filteredPIDs = this.filterPID(tsErr.pids);
        return {
          fileName: tsErr.fileName || '',
          rawText: tsErr.rawText,
          total: this.calcPidInfoPropTotal(tsErr.pids, 'total'),
          drop: this.calcPidInfoPropTotal(tsErr.pids, 'drop'),
          scramble: this.calcPidInfoPropTotal(tsErr.pids, 'scramble'),
          filteredDrop: this.calcPidInfoPropTotal(filteredPIDs, 'drop'),
          filteredScramble: this.calcPidInfoPropTotal(filteredPIDs, 'scramble'),
        } as TsErrViewerTableItem;
      });
    }

    get dialogTexts(): string[] {
      return this.dialogTargetItem ? this.dialogTargetItem.rawText.replace(/\r/g, '').split('\n') : [];
    }
}
</script>

<style lang="scss">
.ts-err-viewer-red-row {
  background: #ff000022;
}
.ts-err-viewer-red-yellow {
  background: #ffff0033;
}
</style>

<style lang="scss" scoped>
.raw-text-dialog-text {
  font-family: monospace;
  white-space: pre-wrap
}
</style>
