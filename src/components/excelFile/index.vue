<template>
  <el-config-provider :locale="zhCn">
    <div class="excelFile">
      <el-button type="primary" @click="openDialog">{{
    nameExcelFile
  }}</el-button>
      <el-dialog class="popuExcelFile" :title="dialog.title" v-model="dialog.isShowDialog" width="60vw" append-to-body
        @close="closeDialog">
        <template #footer>
          <el-button v-if="tableData.XLSX.length" type="primary" size="default" @click="confirm">确认上传</el-button>
        </template>
        <el-upload class="upload-demo" ref="eluploadRef" drag multiple :limit="1" :auto-upload="false" accept=".xlsx"
          :on-change="onchange" :on-exceed="onexceed">
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">将文件拖到此处或<em>单击上传</em></div>
          <template #tip>
            <div class="el-upload__tip">
              <el-button type="primary" link @click="dialog.template">模板下载</el-button>
            </div>
          </template>
          <template #file="{ }">
            <el-table :data="dialog.tableData" style="width: 100%" height="40vh" stripe border>
              <el-table-column v-for="(item, index) in tableData.title" :key="index" :label="item" :prop="index + ''">
              </el-table-column>
            </el-table>
            <el-pagination v-if="!!tableData.XLSX.length" @size-change="onHandleSizeChange"
              @current-change="onHandleCurrentChange" :pager-count="5" :page-sizes="[10, 20, 30]"
              v-model:current-page="dialog.pageNum" background v-model:page-size="dialog.pageSize"
              layout="total, sizes, prev, pager, next, jumper" :total="tableData.XLSX.length">
            </el-pagination>
          </template>
        </el-upload>
        <el-dialog class="uploadProgress" v-model="dialog.isUploading" width="70vw" append-to-body center
          :close-on-click-modal="false" :close-on-press-escape="false" :show-close="false">
          <div style="width:100%; display: flex;justify-content: center">
            <el-progress :percentage="percentage.percentage" type="circle" :status="percentage.status"
              :duration="percentage.duration" striped :striped-flow="percentage.stripedFlow" />
          </div>
          <template #footer>
            <div v-if="percentage.percentage >= 100" style="display: flex;align-items: center;justify-content: end">
              <div v-if="uploadData.failData.length">
                <el-button type="primary" size="default" link @click="exportFailData">导出出现错误的数据</el-button>
                <el-text class="mx-1">，请检查数据是否正常后再次进行上传</el-text>
              </div>
              <el-button size="default" @click="closeUploading" style="margin-left: 20px;">关闭</el-button>
            </div>
          </template>
        </el-dialog>
      </el-dialog>
    </div>
  </el-config-provider>
</template>

<script setup lang="ts" name="excelFile">
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { ref, reactive, onMounted } from "vue";
import "element-plus/dist/index.css";
import {
  ElMessageBox,
  genFileId,
  ElButton,
  ElUpload,
  ElDialog,
  ElIcon,
  ElPagination,
  ElTable,
  ElTableColumn,
  ElText,
  ElProgress,
  ElConfigProvider,
} from "element-plus";
import type { UploadRawFile } from 'element-plus'
import zhCn from "element-plus/es/locale/lang/zh-cn";
import { UploadFilled } from "@element-plus/icons-vue";
import * as excelFile from "./excelFile";
import zionMdapi from "zion-mdapi";
// const mdapi = zionMdapi.init({ callback_url: `https://zion-app.functorz.com/zero/9G6nZlvBK7x/callback/f1ac35c3-a4cb-4827-87f6-e02b5d9ce601`, env: "H5" });
//定义接收参数

const props = defineProps({
  nameExcelFile: {
    type: String,
    default: "",
  },
  callback_url: {
    type: String,
    default: "",
  }
});

// 定义子组件向父组件传值/事件
const emit = defineEmits(["refresh"]);
// 定义变量内容
const eluploadRef = ref();
const mdapi = zionMdapi.init({ callback_url: props.callback_url, env: "H5" });
const dialog = reactive({
  isUploading: false,
  loading: false,
  isShowDialog: false,
  time: <any>null,
  type: "",
  title: "",
  submitTxt: "",
  failName: "",
  pageNum: 1,
  pageSize: 10,
  template: <any>null,
  import: <any>null,
  tableData: [],
  uploadData: [],
});
const tableData = reactive({ title: <any>[], XLSX: <any>[] });
const uploadData = reactive({
  title: <any>[],
  XLSX: <any>[],
  failData: <any>[],
});
const percentage = reactive({
  percentage: 0,
  status: <any>"",
  duration: 15,
  stripedFlow: true,
});
// 打开弹窗
const openDialog = () => {
  dialog.isShowDialog = true;
  dialog.template = excelFile.exportPointsDistribution;
  dialog.import = excelFile.ImportPointsDistribution;
  dialog.failName = "积分发放失败数据.xlsx";
};
// 关闭弹窗
const closeDialog = () => {
  dialog.isShowDialog = false;
  dialog.title = "";
  setTimeout(() => {
    tableData.title = [];
    tableData.XLSX = [];
    eluploadRef.value?.clearFiles();
  }, 200);
};
/**文件状态改变时的钩子，添加文件、上传成功和上传失败时都会被调用 */
const onchange = (files: any) => {
  if (!dialog.loading) {
    dialog.loading = true;
    excelFile
      .ImportFile(files.raw!)
      .then((res: { title: any[]; XLSX: any[] }) => {
        tableData.title = res.title;
        tableData.XLSX = res.XLSX;
        getTableData();
        dialog.loading = false;
        clearTimeout(dialog.time);
        dialog.time = null;
      });
  }
  dialog.time = setTimeout(() => {
    dialog.loading = false;
    clearTimeout(dialog.time);
    dialog.time = null;
  }, 30000);
};
/**当超出限制时，执行的钩子函数 */
const onexceed = (files: any) => {
  eluploadRef.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  eluploadRef.value!.handleStart(file);
};
const getTableData = () => {
  const limit = dialog.pageSize;
  const offset = (dialog.pageNum - 1) * limit;
  if (dialog.isUploading) {
    dialog.uploadData = uploadData.XLSX.slice(offset, offset + limit);
  } else {
    dialog.tableData = tableData.XLSX.slice(offset, offset + limit);
  }
};
const onHandleSizeChange = (val: number) => {
  dialog.pageSize = val;
  dialog.pageNum = 1;
  getTableData();
};
// 分页改变
const onHandleCurrentChange = (val: number) => {
  dialog.pageNum = val;
  getTableData();
};

/** 启动上传指令 */
const confirm = () => {
  ElMessageBox.confirm("请确保网络链接正常.", "是否确认上传?").then(() => {
    dialog.isUploading = true;
    dialog.pageSize = 10;
    dialog.pageNum = 1;
    uploadData.title = [];
    uploadData.XLSX = [];
    uploadData.failData = [];
    percentage.percentage = 0;
    percentage.status = "";
    percentage.stripedFlow = true;
    dialog.import(mdapi, tableData, (title: any, XLSX: any, failData: any) => {
      uploadData.title = title;//表头
      if (XLSX) uploadData.XLSX.push(XLSX);//实际数据
      uploadData.failData = failData;//报错数据
      tableData.XLSX = failData;//报错数据
    }, (percentageObj: any) => {
      //不同进度的回调
      const { current, count } = percentageObj;
      percentage.percentage = Math.floor((current / count) * 100);
      if (percentage.percentage >= 100 && uploadData.failData.length === 0) percentage.status = "success";
      else if (uploadData.failData.length !== 0) percentage.status = "exception";
      else percentage.status = "";
      percentage.stripedFlow = percentage.percentage >= 100 ? false : true;
    })
  });
};
/** 导出失败的数据 */
const exportFailData = () => {
  dialog.template({
    data: uploadData.failData
  }, dialog.failName)
}
// 关闭上传弹窗
const closeUploading = () => {
  dialog.isUploading = false;
  // dialog.pageSize = 10;
  // dialog.pageNum = 1;
  // getTableData()
};
onMounted(async () => {
});
</script>
<style lang="css" scoped>
.excelFile {
  display: inline-block;
}

.popuExcelFile .el-dialog__footer {
  padding: 0;
}

.uploadProgress .el-progress__text {
  min-width: auto;
}
</style>