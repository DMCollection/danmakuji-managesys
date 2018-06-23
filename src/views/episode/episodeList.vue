<template>
    <div class="app-container">
      <el-input  style="width: 200px;" class="filter-item" @keyup.enter.native="handleSearch" placeholder="番剧名称" v-model="query.bangumiName">
      </el-input>
      <el-button class="filter-item" style="margin-left:10px" circle type="primary" icon="el-icon-search" @click="handleSearch"></el-button>
      <el-button class="filter-item" type="primary" icon="el-icon-edit" @click="showAddBangumiDialog = true">添加</el-button>

      <el-button class="filter-item" type="primary" icon="el-icon-delete" @click="handleDeleteInBatch">批量删除</el-button>
      <el-button class="filter-item" type="primary">导出</el-button>   
      <el-button class="filter-item" type="primary" @click="getDefaultBangumis">显示所有剧集</el-button>
    </div>
</template>
