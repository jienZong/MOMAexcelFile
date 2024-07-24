<template>
    <div class="momaexcelFile">
        <button type="button" class="el-button el-button--primary" @click="openDialog" :style="style">
            <span class="">{{ nameExcelFile }}</span>
        </button>
        <div class="el-overlay" style="z-index: 2014" v-if="dialog.isShowDialog">
            <div role="dialog" class="el-overlay-dialog">
                <div class="el-dialog" style="--el-dialog-width: 500px">
                    <header class="el-dialog__header show-close">
                        <span role="heading" aria-level="2" class="el-dialog__title">积分导入</span>
                        <button class="el-dialog__headerbtn" type="button" @click="closeDialog">
                            <i class="el-icon el-dialog__close">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
                                    <path fill="currentColor"
                                        d="M764.288 214.592 512 466.88 259.712 214.592a31.936 31.936 0 0 0-45.12 45.12L466.752 512 214.528 764.224a31.936 31.936 0 1 0 45.12 45.184L512 557.184l252.288 252.288a31.936 31.936 0 0 0 45.12-45.12L557.12 512.064l252.288-252.352a31.936 31.936 0 1 0-45.12-45.184z">
                                    </path>
                                </svg>
                            </i>
                        </button>
                    </header>
                    <div class="el-dialog__body">
                        <div class="upload-demo" data-v-1ab1ffd8="">
                            <div class="el-upload el-upload--text" tabindex="0">
                                <button type="button" class="el-button el-button--primary" @click="fileInput.click()">
                                    <span class="">点击上传</span>
                                </button>
                                <input class="el-upload__input" ref="fileInput" name="file" accept=".xlsx, .xls"
                                    type="file" @change="(event: any) => onchange(event.target.files[0])" />
                            </div>

                            <div class="el-upload__tip">
                                <button type="button" class="el-button el-button--primary is-link"
                                    @click="dialog.template">
                                    <span class="">模板下载</span>
                                </button>
                            </div>
                            <ul v-if="dialog.filesName" class="el-upload-list el-upload-list--text">
                                <li class="el-upload-list__item is-success">
                                    <div class="el-upload-list__item-info">
                                        <a class="el-upload-list__item-name">
                                            <i class="el-icon el-icon--document">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
                                                    <path fill="currentColor"
                                                        d="M832 384H576V128H192v768h640zm-26.496-64L640 154.496V320zM160 64h480l256 256v608a32 32 0 0 1-32 32H160a32 32 0 0 1-32-32V96a32 32 0 0 1 32-32m160 448h384v64H320zm0-192h160v64H320zm0 384h384v64H320z">
                                                    </path>
                                                </svg></i><span class="el-upload-list__item-file-name"
                                                title="element-plus-logo2.svg">{{ dialog.filesName }}</span></a>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <footer class="el-dialog__footer">
                        <div class="dialog-footer">
                            <button type="button" class="el-button" @click="closeDialog">
                                <span class=""> 取消 </span>
                            </button>
                            <button type="button" class="el-button el-button--primary" @click="onconfirm">
                                <span class=""> 导入 </span>
                            </button>
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts" name="momaexcelFile">
import { ref, reactive } from "vue";
import * as momaexcelFile from "./momaexcelFile";
import zionMdapi from "zion-mdapi";
const props = defineProps({
    nameExcelFile: {
        type: String,
        default: "",
    },
    callback_url: {
        type: String,
        default: "",
    },
    style:{
        type: String,
        default: "",
    }
});
// 定义子组件向父组件传值/事件
const emit = defineEmits(["refresh"]);
// 定义变量内容
const fileInput = ref();
const mdapi = zionMdapi.init({ callback_url: props.callback_url, env: "H5" });
const dialog = reactive({
    isShowDialog: false,
    template: <any>null,
    import: <any>null,
    failName: "",
    filesName: "",
});
const tableData = reactive({ title: <any>[], XLSX: <any>[] });
const uploadData = reactive({
    title: <any>[],
    XLSX: <any>[],
    failData: <any>[],
});
// 打开弹窗
const openDialog = () => {
    console.log("openDialog");
    dialog.isShowDialog = true;
    dialog.template = momaexcelFile.exportPointsDistribution;
    dialog.import = momaexcelFile.ImportPointsDistribution;
    dialog.failName = "积分发放失败数据.xlsx";
};
// 关闭弹窗
const closeDialog = () => {
    dialog.isShowDialog = false;
    tableData.title = [];
    tableData.XLSX = [];
    dialog.filesName = "";
};
/**文件状态改变时的钩子，添加文件、上传成功和上传失败时都会被调用 */
const onchange = (files: any) => {
    dialog.filesName = files.name;
    momaexcelFile
        .ImportFile(files!)
        .then((res: { title: any[]; XLSX: any[] }) => {
            tableData.title = res.title;
            tableData.XLSX = res.XLSX;
        });
};
/** 启动上传指令 */
const onconfirm = () => {
    if (!dialog.filesName) return alert("请先选择文件");
    let isConfirmed = confirm("是否确认上传?");
    // 根据用户的选择执行不同的操作  
    if (isConfirmed) {
        // 用户点击了"确定"，执行删除操作  
        dialog.import(mdapi, tableData, (title: any, XLSX: any, failData: any) => {
            uploadData.title = title;//表头
            if (XLSX) uploadData.XLSX.push(XLSX);//实际数据
            uploadData.failData = failData;//报错数据
            tableData.XLSX = failData;//报错数据
            if (failData.length > 0) {
                isConfirmed = confirm("上传失败，是否导出上传失败的数据?");
                if (isConfirmed) dialog.template({
                    schema: [{
                        column: '用户ID',
                        type: Number,
                        value: (student: any) => student.aim_user_pk
                    }, {
                        column: '发放数量',
                        type: Number,
                        value: (student: any) => student.amount
                    }, {
                        column: '发放描述',
                        type: String,
                        value: (student: any) => student.aim_describe
                    }, {
                        column: '错误原因',
                        type: String,
                        value: (student: any) => student.reason
                    }],
                    data: uploadData.failData
                }, dialog.failName)
            } else {
                alert("上传成功");
                emit("refresh");
            }
            closeDialog()
        })
    }
};
</script>
<style>
@import url("style.css");
</style>