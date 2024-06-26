import TsErrInfo from '@/ts_err_parser/TsErrInfo';
import TsErrViewerConfig from '@/models/TsErrViewerConfig';
import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';
import fileToTsErr from '@/ts_err_parser';
import TsErrParserUnsupportedFileError from '@/ts_err_parser/TsErrParserUnsupportedFileError';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    tsErrConfig: new TsErrViewerConfig(),
    tsErrs: [] as TsErrInfo[],
  },
  getters: {
    config(state) {
      return state.tsErrConfig;
    },
    tsErrs(state) {
      return state.tsErrs;
    },
  },
  mutations: {
    setConfig(state, config) {
      state.tsErrConfig = JSON.parse(JSON.stringify(config));
    },
    addTsErrs(state, tsErrs: TsErrInfo[]) {
      const validTsErrs = tsErrs
        // ファイル名が重複しているものは除去する
        // ローカルでのフルパスが取得出来ないため、追加したところでユーザが判別できない
        .filter((file) => (
          state.tsErrs.every((tsErr) => tsErr.fileName !== file.fileName)
        ));

      state.tsErrs = state.tsErrs.concat(validTsErrs);
    },
    removeTsErr(state, fileName) {
      state.tsErrs = state.tsErrs.filter((tsErr) => tsErr.fileName !== fileName);
    },
    removeAllTsErr(state) {
      state.tsErrs = [];
    },
  },
  actions: {
    setConfig({ commit }, config) {
      commit('setConfig', config);
    },
    async addFiles({ commit }, srcFiles: File[]) {
      const parsePromisses = srcFiles.map((file) => fileToTsErr(file).catch((e) => {
        if (!(e instanceof TsErrParserUnsupportedFileError)) {
          throw e;
        }
      }));
      const tsErrs = await Promise.all(parsePromisses);
      commit('addTsErrs', tsErrs.filter((tsErr) => tsErr) as TsErrInfo[]);
    },
    removeTsErr({ commit }, index) {
      commit('removeTsErr', index);
    },
    removeAllTsErr({ commit }) {
      commit('removeAllTsErr');
    },
  },
  plugins: [createPersistedState({
    paths: ['tsErrConfig'],
  })],
});
