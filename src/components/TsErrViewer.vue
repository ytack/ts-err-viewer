<template>
  <div>
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
          @click="removeItem(item)"
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
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import store from '@/store';
import { TsErrInfo, TsErrPIDInfo } from '@/models/ts-err-info';
import TsErrViewerConfig from '@/models/ts-err-viewer-config';

interface TsErrViewerTableItem {
  fileName: string;
  rawText: string;
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

    calcDrop(pids: TsErrPIDInfo[]): number {
      return pids.reduce((acc, val) => acc + val.drop, 0);
    }

    calcScramble(pids: TsErrPIDInfo[]): number {
      return pids.reduce((acc, val) => acc + val.scramble, 0);
    }

    filterPID(pids: TsErrPIDInfo[]): TsErrPIDInfo[] {
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
          drop: this.calcDrop(tsErr.pids),
          scramble: this.calcScramble(tsErr.pids),
          filteredDrop: this.calcDrop(filteredPIDs),
          filteredScramble: this.calcScramble(filteredPIDs),
        } as TsErrViewerTableItem;
      });
    }

    get dialogTexts(): string[] {
      const NEW_LINE_CODE = '\r\n';
      return this.dialogTargetItem ? this.dialogTargetItem.rawText.split(NEW_LINE_CODE) : [];
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
