<template>
    <div class="app-container">
    <!-- 搜索条件 -->
    <div class="filter-container">
      <el-input  style="width: 200px;" class="filter-item" @keyup.enter.native="handleSearch" placeholder="用户昵称" v-model="query.nick">
      </el-input>
      <el-button class="filter-item" style="margin-left:10px" circle type="primary" icon="el-icon-search" @click="handleSearch"></el-button>
      <el-button class="filter-item" type="primary" icon="el-icon-edit" @click="showAddUserDialog = true">添加</el-button>

      <el-button class="filter-item" type="primary" icon="el-icon-delete">批量删除</el-button>
      <el-button class="filter-item" type="primary">导出</el-button>   
      <el-button class="filter-item" type="primary" @click="getUsersList">显示有用户</el-button>
    </div>

    <div class="search-options">
      <el-checkbox-group v-model="checkList">
      <el-checkbox label="已封禁"></el-checkbox>
      <el-checkbox label="已锁定"></el-checkbox>
      <el-checkbox label="手机已验证"></el-checkbox>
      <el-checkbox label="邮箱已验证"></el-checkbox>
      <el-checkbox label="选中且禁用" disabled></el-checkbox>
      </el-checkbox-group>
    </div>

    
   
    <!-- 表格 -->
    <el-table height='600' ref="multipleTable" :data="list" element-loading-text="loading..." border style="width: 100%" highlight-current-row  >
         <el-table-column type="selection" width="35">
         </el-table-column>

          <el-table-column label='id' width="165">
            <template slot-scope="scope">
              {{scope.row.userId}}
            </template>
          </el-table-column>

          <el-table-column label="用户名" width="150">
            <template slot-scope="scope">
              {{scope.row.nick}}
            </template>
          </el-table-column>

          <el-table-column 
          prop="sex"
          :filters="[{text: '男', value: '男'}, {text: '女', value: '女'}, {text: '不明', value: '不明'}]"
          :filter-method="sexFilter"
          align="center" label="性别" width="80">
            <template slot-scope="scope">
              <span >{{scope.row.sex}}</span>
            </template>
          </el-table-column>

          <el-table-column label="年龄"  align="center" width="80">
            <template slot-scope="scope">
              {{scope.age}}
            </template>
          </el-table-column>

          <el-table-column 
          prop="role"
          :filters="roles"
          :filter-method="roleFilter"
          label="角色"  width="150">
            <template slot-scope="scope">
                {{scope.row.role}}
                <el-button type="success" @click="changeRole(scope.row,1)" v-if="scope.row.role === 'ROLE_USER'" size="small">提升为管理员</el-button>
                <el-button type="info" @click="changeRole(scope.row,2)" v-if="scope.row.role ==='ROLE_MANAGER'" size="small">提升为系统管理员</el-button>
                <el-button type="warning" @click="changeRole(scope.row,0)" v-if="scope.row.role === 'ROLE_ADMIN'" size="small">撤销管理员</el-button>
            </template>
          </el-table-column>

            <el-table-column align="center"  label="注册时间" width="180" >
                <template slot-scope="scope">
                  <!-- <i class="el-icon-time"></i> -->
                  <span>{{formateData(scope.row.createTime)}}</span>
                </template>
            </el-table-column>
            <el-table-column align="center"  label="修改时间" width="180">
                <template slot-scope="scope">
                  <!-- <i class="el-icon-time"></i> -->
                  <span>{{formateData(scope.row.modifyTime)}}</span>
                </template>
            </el-table-column>

            <el-table-column align="center"  label="邮箱" width="200">
                <template slot-scope="scope">
                  <!-- <i class="el-icon-time"></i> -->
                  <span>{{scope.row.email}}</span>
                </template>
            </el-table-column>
             <el-table-column align="center"  label="邮箱已验证" width="120" >
                <template slot-scope="scope">
                  <!-- <i class="el-icon-time"></i> -->
                  <span v-if="scope.row.emailVerified">是</span>
                  <span v-if="!scope.row.emailVerified">否</span>
                </template>
            </el-table-column>

            <el-table-column align="center"  label="手机号" width="200">
                <template slot-scope="scope">
                  <!-- <i class="el-icon-time"></i> -->
                  <span>{{scope.row.phone}}</span>
                </template>
            </el-table-column>
            <el-table-column align="center"  label="手机号已验证" width="120">
                <template slot-scope="scope">
                  <!-- <i class="el-icon-time"></i> -->
                  <span v-if="scope.row.phoneVerified">是</span>
                  <span v-if="!scope.row.phoneVerified">否</span>
                </template>
            </el-table-column>
            <el-table-column align="center"  label="锁定" width="80">
                <template slot-scope="scope">
                  <!-- <i class="el-icon-time"></i> -->
                  <span>{{scope.row.isLock===1?'是':'否'}}</span>
                  <el-button type="success" v-if="scope.row.isLock === 1" @click="unlockUser(scope.row)" size="small">解封</el-button>
                  <el-button type="warning" v-if="scope.row.isLock === 0" @click="lockUser(scope.row)" size="small">封禁</el-button>
                  
                </template>
            </el-table-column>
            <el-table-column align="center"  label="锁定时长(m)" width="150">
                <template slot-scope="scope">
                  <span>{{scope.row.lockTime}}</span>
                </template>
            </el-table-column>
            
            <el-table-column fixed="right" align="center"  label="操作" width="120">
                <template slot-scope="scope">        
                   <el-button type="primary" icon="el-icon-edit" circle @click="handleEdit(scope.row.userId, scope.row)"></el-button>
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
    <el-dialog title="添加用户" :visible.sync="showAddUserDialog">
          <el-form class="small-space" :model="temp" label-position="left" label-width="70px" style='width: 400px; margin-left:50px;'>

            <el-form-item label="昵称">
              <el-input v-model="temp.nick"></el-input>
            </el-form-item>

            <el-form-item label="邮箱">
              <el-input v-model="temp.email"></el-input>
            </el-form-item>

            <el-form-item label="电话">
              <el-input v-model="temp.phone"></el-input>
            </el-form-item>

            <el-form-item label="年龄">
              <el-input v-model="temp.age"></el-input>
            </el-form-item>

           
          </el-form>

          <div slot="footer" class="dialog-footer">
            <el-button @click="showAddUserDialog = false">取 消</el-button>
           
            <el-button type="primary" @click="handleAddUser">确 定</el-button>
          </div>
    </el-dialog>

  </div>
</template>

<script>
import { Message } from "element-ui";
import { global } from "src/global/global";
import { api } from "src/global/api";
import adminApi from "src/global/adminApi";
import user from "../../store/modules/user";

export default {
  data() {
    return {
      list: [],
      page: {},
      ruleForm: {
        studentName: "", //学生姓名
        sex: "man", //性别
        minzu: "",
        jiguan: "",
        mianmao: "",
        xueyuan: "",
        ruxiaodate: "",
        birthDate: "",
        address: "",
        quanrizhi: true, //全日制
        ins: [],
        beizhu: ""
      },
      query: {
        nick: "",
        lastQuery: ""
      },
      rules: {
        studentName: [
          { required: true, message: "请输入学生名称", trigger: "blur" },
          { min: 2, max: 8, message: "长度在 2 到 8 个字符", trigger: "blur" }
        ]
      },
      temp: {
        nick: "",
        email: "",
        phone: "",
        age: ""
      },
      showAddUserDialog: false,
      listLoading: true,
      roles: [
        { text: "普通用户", value: "ROLE_USER" },
        { text: "管理员", value: "ROLE_ADMIN" },
        { text: "系统管理员", value: "ROLE_MANAGER" }
      ],
      checkList: []
    };
  },
  mounted() {
    console.log("mounted! getUserList...");
    this.getUsersList();
  },
  methods: {
    //获取所有用户信息
    async getUsersList() {
      this.listLoading = true;
      var vm = this;
      var data = this.$route.query;
      console.log("获取到url参数：", data);
      //根据url中的参数，进行ajax获取表单数据
      let res = await adminApi.getUsers();
      console.log("getUsers result:");
      console.log(res);
      let rd = res.data;
      if (rd.code === 0) {
        this.list = rd.data.users;
        this.page = rd.data.page;
        this.query.lastQuery = "";
        console.log("获取所以用户:", rd.data.users);
        console.log("分页信息：", rd.data.page);
      } else {
        Message({
          showClose: true,
          message: rd.msg,
          type: "error"
        });
      }
      this.listLoading = false;
    },

    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    formateData(ts){
        let d = new Date(ts);
        return d.getFullYear()+"/"+this.fillZero(d.getMonth() + 1) +"/"+ 
        this.fillZero(d.getDate()) + " "+this.fillZero(d.getHours()) + ':' + 
        this.fillZero(d.getMinutes()) + ":"+this.fillZero(d.getSeconds());
    },
    fillZero(num){
      return num<10?'0'+num:num;
    },
    handleEdit(userId, user) {
      console.log("userId:" + userId);
      console.log(user);
      console.log("edit row invoked!");
    },
    async handleDelete(index, user) {
      console.log("userId to be deleted:" + user.userId);
      let del = false;
      this.$confirm("删除用户：" + user.nick, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        callback: async (action, instance) => {
          if (action === "confirm") {
            console.log("del:" + del);
            let res = await adminApi.deleteUserById(user.userId);
            if (res.data.code === 0) {
              console.log("删除成功，uid:" + user.userId);
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
    async handleSearch() {
      console.log("search nick:" + this.query.nick);
      if (this.query.nick === "") {
        Message({
          showClose: true,
          message: "请输入搜索内容",
          type: "info"
        });
        return;
      }
      let res = await adminApi.findUsersByNick(this.query.nick);
      let rd = res.data;
      if (rd.code === 0) {
        this.list = rd.data.users;
        this.page = rd.data.page;
        this.query.lastQuery = this.query.nick;
        if (rd.data.users.length === 0) {
          Message({
            showClose: true,
            message: "无搜索结果",
            type: "info"
          });
        }
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
    async handleSizeChange(val) {
      console.log("每页" + val + "条");
      let res;
      if(this.query.lastQuery!=""){
        res = await adminApi.findUsersByNickPnPs(this.query.lastQuery,1,val);
      }
      else{
        res = await adminApi.getUsersByPageNumberAndPageSize(1, val);
      }
      let rd = res.data;
      console.log(rd);
      if (rd.code === 0) {
        this.list = rd.data.users;
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
      if(this.query.lastQuery!=""){
        res = await adminApi.findUsersByNickPnPs(this.query.lastQuery,this.page.pageSize);
      }
      else{
        res = await adminApi.getUsersByPageNumberAndPageSize(val,this.page.pageSize);
      }
      let rd = res.data;
      console.log(rd);
      if (rd.code === 0) {
        this.list = rd.data.users;
        this.page = rd.data.page;
      } else {
        Message({
          showClose: true,
          message: rd.msg,
          type: "error"
        });
      }
    },
    handleAddUser() {},
    roleFilter(value, row) {
      console.log("value:" + value);
      console.log("row.role:" + row.role);
      console.log(row.role === value);
      return row.role === value;
    },
    sexFilter(value, row) {
      return row.sex === value;
    },
    lockUser(row) {
      console.log("lockUser!");
      console.log(row);
      this.$prompt("封禁时长：", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        callback: async (action, instance) => {
          if (action === "confirm") {
            console.log("封禁时间：" + instance.inputValue);
            let res = await adminApi.lockUser(
              row.userId,
              1,
              instance.inputValue
            );
            let rd = res.data;
            console.log(rd);
            if (rd.code === 0) {
              row.isLock = 1;
              Message({
                showClose: true,
                message: rd.msg,
                type: "success"
              });
            } else {
              Message({
                showClose: true,
                message: "封禁用户失败",
                type: "error"
              });
            }
          } else {
            Message({
              showClose: true,
              message: "已取消",
              type: "info"
            });
          }
        }
      });
    },
    async unlockUser(row) {
      console.log("unlockUser!");
      let res = await adminApi.unlockUser(row.userId, 0);
      let rd = res.data;
      if (rd.code === 0) {
        row.isLock = 0;
        Message({
          showClose: true,
          message: rd.msg,
          type: "success"
        });
      } else {
        Message({
          showClose: true,
          message: "解封用户失败",
          type: "error"
        });
      }
    },
    async changeRole(row, roleId) {
      console.log("changle role!");
      console.log(row);
      this.$prompt("请输入密码", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        callback: async (action, instance) => {
          if (action === "confirm") {
            console.log("密码：" + instance.inputValue);
            let res = await adminApi.changeRole(row.userId, roleId,instance.inputValue);
            let rd = res.data;
            console.log(rd);
            if (rd.code === 0) {
              if (roleId === 0) {
                row.role = "ROLE_USER";
              } else if (roleId === 1) {
                row.role = "ROLE_MANAGER";
              } else {
                row.role = "ROLE_ADMIN";
              }
              Message({
                showClose: true,
                message: rd.msg,
                type: "success"
              });
            } else {
              Message({
                showClose: true,
                message: rd.msg,
                type: "error"
              });
            }
            Message({
              showClose: true,
              message: rd.msg,
              type: "success"
            });
          } else {
            Message({
              showClose: true,
              message: "已取消",
              type: "info"
            });
          }
        }
      });
    }
  }
};
</script>

<style scoped>
/* [v-cloak] {
  display: none;
} */
.component-item {
  margin-top: 100px;
}
.code-part {
  margin-top: 20px;
}
.search-options {
  margin-bottom: 20px;
}
</style>

