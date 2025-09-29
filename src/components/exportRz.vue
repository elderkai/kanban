<template>
    <div>
        <el-button @click="exportMyJob()">导出工作日志</el-button>
    </div>
</template>
<script lang="ts" setup>
import * as XLSX from "xlsx-js-style";
import dayjs from "dayjs";
function exportMyJob(){
    const date = new Date()
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate()
    console.log(`${year}-${month}-${day}`,dayjs(new Date()).format("YY-MM-DD"));
    
}
function downTest(){
   const wb = XLSX.utils.book_new();
   let columns = [
    {label:"累计姓名",prop:"dealPerson"},
    {label:"累计合计",prop:"summary"},
    {label:"累计已完成",prop:"cumuCompleted"},
    {label:"累计待完成",prop:"cumuToBeCompleted"},
    {label:"本月新分配",prop:"monthNewlyAssigned"},
    {label:"本月完成",prop:"monthCompleted"},
    {label:"上周新分配",prop:"weekNewlyAssigned"},
    {label:"上周完成开发",prop:"weekCompleted"},
    {label:"上周完成明细",prop:"weekCompletedDetail"},
   ]
   let data:any = [];
   state.tableData.forEach((it:any)=>{
    let obj = {} as any;
    columns.forEach((el:any)=>{
      if(it[el.prop]===0){
        obj[el.label]=0
      }else{
        obj[el.label] = it[el.prop]?it[el.prop]:'';
      }
      if(el.prop=='dealPerson'){
        obj[el.label] =``
      }
      // 
    });
    data.push(obj);
   })
      const ws = XLSX.utils.json_to_sheet(data);
       let arr = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",] //总共多少列
    arr.forEach((item) => {
                        for (let i = 1; i < 7 + data.length; i++) {
                            let str = (item + i).toString();
                            if (ws[str]) {
                                if (i >= 3) {
                                    if (item == "B") {
                                        Object.assign(ws[str], { t: "n" })
                                    } else {
                                        Object.assign(ws[str], { t: "s" })
                                    }
                                }
                                ws[str].s = {
                                    font: {
                                        name: "宋体",
                                        sz: i==1?14:12,
                                        bold: false,
                                        color: { rgb: "000000" }
                                    },
                                     alignment: {
                                          horizontal: "center",
                                          vertical: "center"
                                        },
                                    border: {
                                        top: {
                                            style: 'thin',
                                            color: {
                                                auto: 1
                                            }
                                        },
                                        left: {
                                            style: 'thin',
                                            color: {
                                                auto: 1
                                            }
                                        },

                                        right: {
                                            style: 'thin',
                                            color: {
                                                auto: 1
                                            }
                                        },
                                        bottom: {
                                            style: 'thin',
                                            color: {
                                                auto: 1
                                            }
                                        }
                                    },
                                }
                            }
                        }
                    })


        let clos:any = []
        for (let i = 0; i <= 34; i++) { //设置单元格宽度
            clos.push({
                wpx: 120
            })
        }
        ws["!cols"] = clos
      // 将工作表添加到工作簿
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      // 生成Excel文件并触发下载
      XLSX.writeFile(wb, '审批清单-合计.xlsx');
}
</script>