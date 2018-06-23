<template>
    <div class="app-container">
      <div class="filter-container">
      <el-input  style="width: 200px;" class="filter-item" @keyup.enter.native="handleSearch" placeholder="番剧名称" v-model="query.bangumiName">
      </el-input>
      <el-button class="filter-item" style="margin-left:10px" circle type="primary" icon="el-icon-search" @click="handleSearch"></el-button>
      <el-button class="filter-item" type="primary" icon="el-icon-edit" @click="showAddBangumiDialog = true">添加</el-button>

      <el-button class="filter-item" type="primary" icon="el-icon-delete" @click="handleDeleteInBatch">批量删除</el-button>
      <el-button class="filter-item" type="primary">导出</el-button>   
      <el-button class="filter-item" type="primary" @click="getDefaultBangumis">显示所有番剧</el-button>
      </div>
      
      <el-table height='600' @selection-change="handleSelectionChange" ref="multipleTable" :data="list" element-loading-text="loading..." border highlight-current-row>
          <el-table-column type="selection" width="35">
          </el-table-column>
          <el-table-column label='id' width="100">
            <template slot-scope="scope">
              {{scope.row.bangumiId}}
            </template>
          </el-table-column>

          <el-table-column label="thumb"  align="center" width="120">
            <template slot-scope="scope">
              <!-- {{scope.row.thumb}} -->
              <img width="100px" height="100px" :src="scope.row.thumb"/>
            </template>
          </el-table-column>

          <el-table-column label="番剧名" width="150">
            <template slot-scope="scope">
              {{scope.row.bangumiName}}
            </template>
          </el-table-column>

          <el-table-column label="总集数" width="100">
            <template slot-scope="scope">
              <span >{{scope.row.episodeTotal}}</span>
            </template>
          </el-table-column>

          <el-table-column label="创建时间" width="200">
            <template slot-scope="scope">
              <span >{{formateDate(scope.row.createTime)}}</span>
            </template>
          </el-table-column>

          <el-table-column label="修改时间" width="200">
            <template slot-scope="scope">
              <span >{{formateDate(scope.row.modifyTime)}}</span>
            </template>
          </el-table-column>

          <el-table-column fixed="right" align="center" min-width="120" label="操作">
                <template slot-scope="scope">        
                   <el-button type="primary" icon="el-icon-edit" circle @click="handleEdit(scope.$index,scope.row.bangumiId, scope.row)"></el-button>
                   <el-button type="danger" icon="el-icon-delete" circle @click="handleDelete(scope.$index,scope.row)"></el-button>
                </template>
          </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div v-show="!listLoading" class="pagination-container">
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="page.pageNumber"
          :page-sizes="[10,20,30, 50]" :page-size="page.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="page.totalSize">
        </el-pagination>
      </div>

      <!-- 新增弹窗 -->
    <el-dialog title="添加番剧" :visible.sync="showAddBangumiDialog">
          <el-form class="small-space" :model="temp" label-position="left" label-width="70px" style='margin-left:50px;'>

            <el-form-item v-show="temp.bangumiId!=''" label="id">
              <el-input v-model="temp.bangumiId"></el-input>
            </el-form-item>

            <el-form-item label="番剧名称">
              <el-input v-model="temp.bangumiName"></el-input>
            </el-form-item>

            <el-form-item label="总集数">
              <el-input v-model="temp.episodeTotal"></el-input>
            </el-form-item>

            <el-form-item label="图片">
              <el-upload
              class="avatar-uploader"
              action="http://localhost:8080/upload"
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
              :before-upload="beforeAvatarUpload">
              <img v-if="imageUrl" :src="imageUrl" class="avatar">
              <i v-else class="el-icon-plus avatar-uploader-icon"></i>
              </el-upload>
            </el-form-item>
          </el-form>
          

          <div slot="footer" class="dialog-footer">
            <el-button @click="cancelAddBangumi">取 消</el-button>
           
            <el-button type="primary" @click="handleAddBangumi">确 定</el-button>
          </div>
    </el-dialog>
    </div>
</template>

<script>
import { Message } from "element-ui";
import adminApi from "src/global/adminApi";
import user from "../../store/modules/user";
export default {
  data() {
    return {
      list: [],
      page: {},
      query: {
        bangumiName: "",
        lastQuery: ""
      },
      showAddBangumiDialog: false,
      temp: {
        bangumiId: "",
        bangumiName: "",
        thumb: "",
        episodeTotal: ""
      },
      imageUrl: "",
      listLoading: true,
      multiSelection: [],
      headers: {
        "Content-Type": "multipart/form-data"
      }
    };
  },
  mounted() {
    console.log("getDefaultBangumis!!!");
    this.getDefaultBangumis();
  },
  methods: {
    async handleSearch() {
      console.log("search bangumiName:" + this.query.bangumiName);
      if (this.query.bangumiName === "") {
        Message({
          showClose: true,
          message: "请输入搜索内容",
          type: "info"
        });
        return;
      }
      const res = await adminApi.findBangumisByName(this.query.bangumiName);
      const rd = res.data;
      if (rd.code === 0) {
        this.list = rd.data.content;
        this.page = rd.data.page;
        if (rd.data.content.length === 0) {
          Message({
            showClose: true,
            message: "无搜索结果",
            type: "info"
          });
        }
        this.query.lastQuery = this.query.bangumiName;
      } else {
        this.list = [];
        this.page.totalSize = 0;
        Message({
          showClose: true,
          message: rd.msg,
          type: "info"
        });
      }
    },
    async getDefaultBangumis() {
      const res = await adminApi.getBangumis();
      const rd = res.data;
      console.log("getDFB: " + res);
      console.log(rd);
      if (rd.code === 0) {
        this.list = rd.data.content;
        this.page = rd.data.page;
        this.query.bangumiName = "";
        this.query.lastQuery = "";
        console.log(this.list);
        console.log(this.page);
      } else {
        Message({
          showClose: true,
          message: res.data.msg,
          type: "error"
        });
      }
      this.listLoading = false;
    },
    handleEdit(index, bangumiId, bangumi) {
      console.log("edit bangumi!");
      console.log("bangumi:", bangumi);
      this.temp.bangumiName = bangumi.bangumiName;
      this.temp.episodeTotal = bangumi.episodeTotal;
      this.temp.thumb = bangumi.thumb;
      this.temp.bangumiId = bangumi.bangumiId;
      this.imageUrl = bangumi.thumb;
      console.log("edit index:", index);
      this.showAddBangumiDialog = true;
    },
    handleDelete(index, bangumi) {
      console.log("delete bangumi");
      console.log("index:", index);
      console.log(bangumi);
      this.$confirm("删除番剧：" + bangumi.bangumiName, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        callback: async (action, instance) => {
          if (action === "confirm") {
            const res = await adminApi.deleteBangumi(bangumi.bangumiId);
            if (res.data.code === 0) {
              console.log("删除成功，id:" + bangumi.bangumiId);
              console.log("index:" + index);
              Message({
                showClose: true,
                message: res.data.msg,
                type: "success"
              });
              this.list.splice(index, 1);
            } else {
              Message({
                showClose: true,
                message: res.data.msg,
                type: "error"
              });
            }
          } else {
            Message({
              showClose: true,
              message: "已取消删除",
              type: "info"
            });
          }
        }
      });
    },
    handleDeleteInBatch() {
      console.log("delInBatch!");
      if (this.multiSelection.length === 0) {
        Message({
          showClose: true,
          message: "未选中番剧",
          type: "info"
        });
        return;
      }
      this.$confirm("确定要删除多部番剧？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        callback: async (action, instance) => {
          if (action === "confirm") {
            const res = await adminApi.deleteBangumis(this.multiSelection);
            if (res.data.code === 0) {
              console.log("批量删除成功");
              Message({
                showClose: true,
                message: res.data.msg,
                type: "success"
              });
              this.getDefaultBangumis();
              this.multiSelection = [];
            } else {
              Message({
                showClose: true,
                message: res.data.msg,
                type: "error"
              });
            }
          } else {
            this.temp.bangumiName = "";
            this.temp.episodeTotal = "";
            this.temp.thumb = "";
            this.temp.bangumiId = "";
            this.imageUrl = "";
            Message({
              showClose: true,
              message: "已取消删除",
              type: "info"
            });
          }
        }
      });
    },
    async handleAddBangumi() {
      console.log("handle add bangumi!");
      let res;
      console.log("temp:", this.temp);
      if (this.temp.bangumiId === "") {
        console.log("add bangumi...");
        res = await adminApi.addBangumi(this.temp);
      } else {
        console.log("edit bangumi...");
        res = await adminApi.editBangumi(this.temp.bangumiId, this.temp);
      }
      const rd = res.data;
      console.log("addBangumi res:", rd);
      if (rd.code === 0) {
        console.log("add succeeded!");
        Message({
          showClose: true,
          message: "操作成功",
          type: "success"
        });
        this.showAddBangumiDialog = false;
        this.temp.bangumiName = "";
        this.temp.episodeTotal = "";
        this.temp.thumb = "";
        this.temp.bangumiId = "";
        this.imageUrl = "";
        this.getDefaultBangumis();
      } else {
        Message({
          showClose: true,
          message: rd.msg,
          type: "error"
        });
      }
    },
    handleSelectionChange(val) {
      console.log("multi sel:", val);
      this.multiSelection = val;
    },
    getPrettyTime(modifyTime) {},
    formateDate(ts) {
      const d = new Date(ts);
      return (
        d.getFullYear() +
        "/" +
        this.fillZero(d.getMonth() + 1) +
        "/" +
        this.fillZero(d.getDate()) +
        " " +
        this.fillZero(d.getHours()) +
        ":" +
        this.fillZero(d.getMinutes()) +
        ":" +
        this.fillZero(d.getSeconds())
      );
    },
    fillZero(num) {
      return num < 10 ? "0" + num : num;
    },
    handleAvatarSuccess(res, file) {
      console.log("handleAvatarSucc invoked!");
      console.log(res);
      console.log(file);
      this.temp.thumb = res.data.middle;
      console.log(this.temp.thumb);
      this.imageUrl = URL.createObjectURL(file.raw);
    },
    beforeAvatarUpload(file) {
      console.log("file ", file);
      // const isJPG = file.type === 'image/jpeg';
      const isLt2M = file.size / 1024 / 1024 < 2;

      // if (!isJPG) {
      //   this.$message.error("上传头像图片只能是 JPG 格式!");
      // }
      if (!isLt2M) {
        this.$message.error("上传头像图片大小不能超过 2MB!");
      }
      return isLt2M;
    },
    cancelAddBangumi() {
      this.showAddBangumiDialog = false;
      this.temp.bangumiName = "";
      this.temp.thumb = "";
      this.temp.episodeTotal = "";
      this.temp.bangumiId = "";
      this.imageUrl = "";
    },

    async handleSizeChange(val) {
      console.log("每页" + val + "条");
      let res;
      if (this.query.lastQuery !== "") {
        console.log("last query:", this.query.lastQuery);
        res = await adminApi.findBangumisByNamePnPs(
          this.query.lastQuery,
          1,
          val
        );
      } else {
        console.log("no lastQuery");
        res = await adminApi.getBangumisByPageNumAndPageSize(1, val);
      }
      const rd = res.data;
      console.log(rd);
      if (rd.code === 0) {
        this.list = rd.data.content;
        this.page = rd.data.page;
      } else {
        Message({
          showClose: true,
          message: rd.msg,
          type: "error"
        });
      }
    },
    async handleCurrentChange(val) {
      console.log("curpage:" + val);
      let res;
      if (this.query.lastQuery !== "") {
        console.log("lastQuery:", this.query.lastQuery);
        res = await adminApi.findBangumisByNamePnPs(
          this.query.lastQuery,
          val,
          this.page.pageSize
        );
      } else {
        console.log("lastQuery is empty");
        res = await adminApi.getBangumisByPageNumAndPageSize(
          val,
          this.page.pageSize
        );
      }
      const rd = res.data;
      console.log(rd);
      if (rd.code === 0) {
        this.list = rd.data.content;
        this.page = rd.data.page;
      } else {
        Message({
          showClose: true,
          message: rd.msg,
          type: "error"
        });
      }
    }
  }
};
</script>

<style scoped>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>