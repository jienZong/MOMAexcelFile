import writeXlsxFile from 'write-excel-file';
import readXlsxFile from 'read-excel-file';
/** 导出模板 */
export async function exportFile(fileData: any, fileName: any = 'file.xlsx') {
    const { schema = [{
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
    }],
        data = [{
            amount: 0,
            aim_user_pk: 0,
            aim_describe: "官方赠送",
        }, {
            amount: 0,
            aim_user_pk: 0,
            aim_describe: "官方赠送",
        }]
    } = fileData;
    return await writeXlsxFile(data, {
        schema,
        fileName
    })
}

/** 导入模板 */
export async function ImportFile(fileData: File) {
    //title: 表头  XLSX: 数据
    const [title = [], ...XLSX] = await readXlsxFile(fileData);
    return {
        title: title || [],
        XLSX: XLSX || [],
    }
}

/** 积分发放导入模板，导出 */
export async function exportPointsDistribution(fileData: any, fileName: any = '积分发放模板.xlsx') {
    const { schema = [{
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
    }],
        data = [{
            amount: 0,
            aim_user_pk: 0,
            aim_describe: "官方赠送",
        }, {
            amount: 0,
            aim_user_pk: 0,
            aim_describe: "官方赠送",
        }]
    } = fileData;
    return await writeXlsxFile(data, {
        schema,
        fileName
    })
}

/** 积分发放导入 */
export async function ImportPointsDistribution(mdapi: any, tableData: any, callback: (title: any, XLSX: any, failData: any) => {}) {

    // title: 表头  XLSX: 表单数据  
    const { title, XLSX } = tableData
    //查找userID所在位置
    const aim_user_pk = title.findIndex((item: any) => item?.includes('用户ID'));
    //查找积分数量所在位置
    const amount = title.findIndex((item: any) => item?.includes('发放数量'));
    //查找描述所在位置
    const describe = title.findIndex((item: any) => item?.includes('发放描述'));
   
    //循环数据并重新遍历格式
    const data = XLSX.map((item: any) => {
        return {
            amount: item?.[amount] ?? null,
            aim_user_pk: item?.[aim_user_pk] ?? null,
            aim_describe: item?.[describe] ?? null,
        }
    })

    //调用接口上传数据
    // callback(title, XLSX, data);
    return await mdapi.callActionflow({
        "actionflow_dir": "/后台管理/个人中心管理/",
        "actionflow_name": "个人中心管理_批量发放积分",
        "payload": { data }
    }).then((res: any) => {
        const { fail } = res.data
        callback(title, XLSX, fail);
    }).catch((err: any) => {
        const { fail } = err.info.data
        callback(title, XLSX, fail);
    })
}