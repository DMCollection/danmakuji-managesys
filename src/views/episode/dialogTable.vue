<template>
    <div class="app-container"> 
      <el-table height='400' @selection-change="handleSelectionChange" ref="multipleTable" :data="list" element-loading-text="loading..." border highlight-current-row>
          <el-table-column type="selection" width="35">
          </el-table-column>
          <el-table-column label='视频id' width="200">
            <template slot-scope="scope">
              {{scope.row.videoId}}
            </template>
          </el-table-column>

          <el-table-column label='md5' width="200">
            <template slot-scope="scope">
              {{scope.row.vMd5}}
            </template>
          </el-table-column>

          <el-table-column label='文件尺寸' width="200">
            <template slot-scope="scope">
              {{scope.row.fileSize}}
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
                   <!-- <el-button type="primary" icon="el-icon-edit" circle @click="handleEdit(scope.$index,scope.row.bangumiId, scope.row)"></el-button> -->
                   <el-button type="danger" icon="el-icon-delete" circle @click="handleDelete(scope.$index, scope.row.videoId)"></el-button>
                </template>
          </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <!-- <div v-show="!listLoading" class="pagination-container">
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="page.pageNumber"
          :page-sizes="[10,20,30, 50]" :page-size="page.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="page.totalSize">
        </el-pagination>
      </div> -->

    </div>
</template>

<script>
import { Message } from "element-ui";
import adminApi from "src/global/adminApi";
import user from "../../store/modules/user";

export default {
  props: {
    eid: {
      type: Number,
      default: ''
    }
  },
  data() {
    return {
      list: [],
      page: {},
      query: {
        episodeId: "",
        lastQuery: ""
      },
      showAddBangumiDialog: false,
      temp: {
        bangumiId: "",
        episodeId: "",
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
  watch: {
    eid(newVal) {
      this.getVideos(newVal)
    } 
  },
  methods: {
    // 获取分集
    async getVideos (bid) {
      console.log(111)
      const res = await adminApi.getVideosByEpid(bid)
      const rd = res.data

      if (rd.code === 0) {
        this.list = rd.data.videos;
        console.log(this.list)
        this.page = rd.data.page;
      } else {
        Message({
          showClose: true,
          message: res.data.msg,
          type: "error"
        })
      }
      this.listLoading = false
    },
    handleEdit(index, bangumiId, bangumi) {
      this.temp.episodeId = bangumi.episodeId;
      this.temp.episodeTotal = bangumi.episodeTotal;
      this.temp.thumb = bangumi.thumb;
      this.temp.bangumiId = bangumi.bangumiId;
      this.imageUrl = bangumi.thumb;
      this.showAddBangumiDialog = true;
    },
    handleDelete(index, id) {
      this.$confirm("删除视频：" + id, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        callback: async (action, instance) => {
          if (action === "confirm") {
            const res = await adminApi.delEpByEpid(id);
            if (res.data.code === 0) {
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
            this.temp.episodeId = "";
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
      let res;

      if (this.temp.bangumiId === "") {
        res = await adminApi.addBangumi(this.temp);
      } else {

        res = await adminApi.editBangumi(this.temp.bangumiId, this.temp);
      }
      const rd = res.data;

      if (rd.code === 0) {

        Message({
          showClose: true,
          message: "操作成功",
          type: "success"
        });
        this.showAddBangumiDialog = false;
        this.temp.episodeId = "";
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
      this.temp.thumb = res.data.middle;
      this.imageUrl = URL.createObjectURL(file.raw);
    },
    cancelAddBangumi() {
      this.showAddBangumiDialog = false;
      this.temp.episodeId = "";
      this.temp.thumb = "";
      this.temp.episodeTotal = "";
      this.temp.bangumiId = "";
      this.imageUrl = "";
    },

    async handleSizeChange(val) {

      let res;
      if (this.query.lastQuery !== "") {

        res = await adminApi.findBangumisByNamePnPs(
          this.query.lastQuery,
          1,
          val
        );
      } else {

        res = await adminApi.getBangumisByPageNumAndPageSize(1, val);
      }
      const rd = res.data;

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

      let res;
      if (this.query.lastQuery !== "") {

        res = await adminApi.findBangumisByNamePnPs(
          this.query.lastQuery,
          val,
          this.page.pageSize
        );
      } else {

        res = await adminApi.getBangumisByPageNumAndPageSize(
          val,
          this.page.pageSize
        );
      }
      const rd = res.data;

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