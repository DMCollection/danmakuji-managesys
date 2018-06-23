import axios from "axios";

import Vue from "vue";
// import qs from 'qs'; //此模块用于转成Form Data 格式

// http request 拦截器
axios.interceptors.request.use(
  config => {
    if (localStorage.JWT_TOKEN) {
      // 判断是否存在token，如果存在的话，则每个http header都加上token
      config.headers.Authorization = `${localStorage.JWT_TOKEN}`;
    }
    return config;
  },
  err => {
    return Promise.reject(err);
  }
);


// http响应拦截器
axios.interceptors.response.use(
  data => {
    // 响应成功关闭loading
    return data;
  },
  err => {
    // 这里是返回状态码不为200时候的错误处理
    if (err && err.response) {
      switch (err.response.status) {
        case 403:
          err.message = err.response.data.msg;
          break;

        case 404:
          err.message = `请求地址出错: ${err.response.config.url}`;
          break;

        case 408:
          err.message = "请求超时";
          break;

        case 500:
          err.message = "服务器内部错误";
          break;
        default:
          err.message = err.response.data.msg;
          break;
      }
      Vue.prototype.$message({
        message: err.message,
        type: "error"
      });
    }

    return Promise.reject(err);
  }
);

//本地开发请设置为"/api"
const baseURL = "http://10.0.46.28:8080";
// const baseURL = "/api";

//  登录相关
const login = data => {
  return axios.post(`${baseURL}/auth/login`, data);
};
const logout = () => {
  return axios.get(`${baseURL}/auth/logout`);
};

const getUserInfoById = userId => {
    return axios.get(`${baseURL}/users/${userId}`);
};

const checkToken = token => {
  return axios.get(`${baseURL}/tokens`, token);
};

const getVideosInfo = (fileSize, vMd5) => {
  return axios.get(`${baseURL}/videos/${fileSize}/${vMd5}`);
};
const getDanmakujiIdByBangumisIdAndepIndex = (bangumiId, epIndex) => {
  return axios.get(`${baseURL}/episodes`, {
    params: {
      bangumiId: bangumiId,
      epIndex: epIndex
    }
  });
};
const getsearchBangumisIdResult = query => {
  return axios.get(`${baseURL}/bangumis`, {
    params: {
      bangumiName: query
    }
  });
};

//评论------------------------
const getRepliesByEpId = epId => {
  return axios.get(`${baseURL}/replies`,{
    params:{
      epId:epId
    }
  });
};

const getRepliesByEpIdAndPageNum = (epId,pn) => {
  return axios.get(`${baseURL}/replies`,{
    params:{
      epId:epId,
      pn:pn
    }
  });
};

const getSubReplies = (prid,pn) => {
  return axios.get(`${baseURL}/replies/son`,{
    params:{
      prid: prid,
      pn: pn
    }
  });
};

const addReply = data => {
  return axios.post(`${baseURL}/replies`,data);
};
//------------------------评论


//用户管理API---------------------------
const getUsers = () => {
    return axios.get(`${baseURL}/admin/users`);
};

const getUsersByPageNumber = (pageNum) =>{
    return axios.get(`${baseURL}/admin/users`,{
        params:{
          pn: pageNum
        }
      });
};

const getUsersByPageNumberAndPageSize = (pageNum,pageSize) =>{
  return axios.get(`${baseURL}/admin/users`,{
    params:{
      pn: pageNum,
      ps: pageSize
    }
  });
}

const findUsersByNick = nick =>{
  return axios.get(`${baseURL}/admin/users/nick`,{
    params:{
      nick: nick
    }
  });
};

const findUsersByNickPn = (nick,pn) =>{
  return axios.get(`${baseURL}/admin/users/nick`,{
    params:{
      nick: nick,
      pn: pn
    }
  });
};

const findUsersByNickPnPs = (nick,pn,ps) =>{
  return axios.get(`${baseURL}/admin/users/nick`,{
    params:{
      nick: nick,
      pn: pn,
      ps: ps
    }
  });
}

const deleteUserById = uid =>{
  return axios.delete(`${baseURL}/admin/users/${uid}`);
};

const addUser = userInfo =>{
  return axios.post(`${baseURL}/admin/users`,userInfo);
};

const editUser = (uid,userInfo) =>{
  return axios.put(`${baseURL}/admin/users/${uid}`,userInfo);
};

const lockUser = (uid,action,time) =>{
  return axios.put(`${baseURL}/admin/users/${uid}/lock/${action}/${time}`);
};

const unlockUser = (uid,action) =>{
  return axios.put(`${baseURL}/admin/users/${uid}/lock/${action}`);
};

const changeRole = (uid,action,pwd) =>{
  return axios.put(`${baseURL}/admin/users/${uid}/role/${action}`,{
    pwd: pwd
  });
};
//---------------------------用户管理API


//番剧管理API---------------------------
const getBangumis = () =>{
  return axios.get(`${baseURL}/admin/bangumis`);
};

const getBangumisByPageNum = (pageNum) =>{
  return axios.get(`${baseURL}/admin/bangumis`,{
    params:{
      pageNum: pageNum
    }
  });
};

const getBangumisByPageNumAndPageSize = (pageNum,pageSize) =>{
  return axios.get(`${baseURL}/admin/bangumis`,{
    params:{
      pageNum: pageNum,
      pageSize: pageSize
    }   
  });
};

const findBangumisByName = (bangumiName) =>{
  return axios.get(`${baseURL}/admin/bangumis`,{
    params:{
      bangumiName: bangumiName
    }
  });
};

const findBangumisByNamePn = (bangumiName, pageNum) =>{
  return axios.get(`${baseURL}/admin/bangumis`,{
    params:{
      bangumiName: bangumiName,
      pageNum: pageNum
    }
  });
};

const findBangumisByNamePnPs = (bangumiName, pageNum, pageSize) =>{
  return axios.get(`${baseURL}/admin/bangumis`,{
    params:{
      bangumiName: bangumiName,
      pageNum: pageNum,
      pageSize: pageSize
    }
  });
};

const getBangumiById = (id) =>{
  return axios.get(`${baseURL}/admin/bangumis/${id}`);
};

const addBangumi = (bangumi) =>{
  return axios.post(`${baseURL}/admin/bangumis`,bangumi);
};

const editBangumi = (id, bangumi) =>{
  return axios.put(`${baseURL}/admin/bangumis/${id}`,bangumi);
};

const deleteBangumi = (id) =>{
  return axios.delete(`${baseURL}/admin/bangumis/${id}`);
};

const deleteBangumis = (bangumis) =>{
  return axios.delete(`${baseURL}/admin/bangumis`,{
    data:{
      bangumis:bangumis
    }
  });
}
//---------------------------番剧管理API

//剧集管理API----------------------------------
const getEpisodes = () =>{
  return axios.get(`${baseURL}/admin/episodes`);
};

const getEpisodesByPn = (pageNum) =>{
  return axios.get(`${baseURL}/admin/episodes`,{
    params:{
      pageNum:pageNum
    }
  });
};

const getEpisodesByPnPs = (pageNum, pageSize) =>{
  return axios.get(`${baseURL}/admin/episodes`,{
    params:{
      pageNum:pageNum,
      pageSize:pageSize
    }
  });
};

const getEpisodeById = (epId) =>{
  return axios.get(`${baseURL}/admin/episodes/${epId}`);
};

const getEpisodesByBangumiId = (bangumiId) =>{
  return axios.get(`${baseURL}/admin/episodes/bid/${bangumiId}`);
};

const getEpisodesByBangumiIdPn = (bangumiId, pageNum) =>{
  return axios.get(`${baseURL}/admin/episodes/bid/${bangumiId}`,{
    params:{
      pageNum:pageNum
    }
  });
};

const getEpisodesByBangumiIdPnPs = (bangumiId, pageNum, pageSize) =>{
  return axios.get(`${baseURL}/admin/episodes/bid/${bangumiId}`,{
    params:{
      pageNum:pageNum,
      pageSize:pageSize
    }
  });
};

const addEpisode = (episode) =>{
  return axios.post(`${baseURL}/admin/episodes`,episode);
};

const editEpisode = (epId,episode) =>{
  return axios.put(`${baseURL}/admin/episodes/${epId}`,episode);
};

const deleteEpisode = (epId) =>{
  return axios.delete(`${baseURL}/admin/episodes/${epId}`);
};

const deleteEpisodes = (episodes) =>{
  return axios.delete(`${baseURL}/admin/episodes`,{
    data:{
      episodes:episodes
    }
  });
};
//----------------------------------剧集管理API


//视频管理API----------------------------------
const getVideos = () =>{
  return axios.get(`${baseURL}/admin/videos`);
};

const getVideosByPn = (pageNum) =>{
  return axios.get(`${baseURL}/admin/videos`,{
    params:{
      pageNum:pageNum
    }
  });
};

const getVideosByPnPs = (pageNum,pageSize) =>{
  return axios.get(`${baseURL}/admin/videos`,{
    params:{
      pageNum:pageNum,
      pageSize:pageSize
    }
  });
};

const getVideosByEpId = (epId) =>{
  return axios.get(`${baseURL}/admin/videos/eid/${epId}`);
};

const getVideosByEpIdPn = (epId,pageNum) =>{
  return axios.get(`${baseURL}/admin/videos/eid/${epId}`,{
    params:{
      pageNum:pageNum
    }
  });
};

const getVideosByEpIdPnPs = (epId,pageNum,pageSize) =>{
  return axios.get(`${baseURL}/admin/videos/eid/${epId}`,{
    params:{
      pageNum:pageNum,
      pageSize:pageSize
    }
  });
};

const getVideoByVideoId = (videoId) =>{
  return axios.get(`${baseURL}/admin/videos/${videoId}`);
};

const addVideo = (video) =>{
  return axios.post(`${baseURL}/admin/videos`,video);
};

const editVideo = (videoId, video) =>{
  return axios.put(`${baseURL}/admin/videos/${videoId}`,video);
};

const deleteVideo = (videoId) =>{
  return axios.delete(`${baseURL}/admin/videos/${videoId}`);
};

const deleteVideos = (videos) =>{
  return axios.delete(`${baseURL}/admin/videos`,{
    data:{
      videos:videos
    }
  });
};
//----------------------------------视频管理API

//系统信息
const getSysMainInfo = () =>{
  return axios.get(`${baseURL}/admin/mainInfo`);
};

//注册用户
const register = data => {
    return axios.post(`${baseURL}/users`,data)
};

export default {
  login,
  logout,
  checkToken,
  getVideosInfo,
  getDanmakujiIdByBangumisIdAndepIndex,
  getsearchBangumisIdResult,
  getRepliesByEpId,
  getRepliesByEpIdAndPageNum,
  addReply,
  getSubReplies,
  register,
  getUserInfoById,
  getUsers,
  getUsersByPageNumber,
  getUsersByPageNumberAndPageSize,
  deleteUserById,
  findUsersByNick,
  findUsersByNickPn,
  findUsersByNickPnPs,
  addUser,
  editUser,
  lockUser,
  unlockUser,
  changeRole,
  getBangumis,
  getBangumisByPageNum,
  getBangumisByPageNumAndPageSize,
  findBangumisByName,
  findBangumisByNamePn,
  findBangumisByNamePnPs,
  getBangumiById,
  addBangumi,
  editBangumi,
  deleteBangumi,
  deleteBangumis,
  getSysMainInfo,
  getEpisodes,
  getEpisodesByPn,
  getEpisodesByPnPs,
  getEpisodeById,
  getEpisodesByBangumiId,
  getEpisodesByBangumiIdPn,
  getEpisodesByBangumiIdPnPs,
  addEpisode,
  editEpisode,
  deleteEpisode,
  deleteEpisodes,
  getVideos,
  getVideosByPn,
  getVideosByPnPs,
  getVideosByEpId,
  getVideosByEpIdPn,
  getVideosByEpIdPnPs,
  getVideoByVideoId,
  addVideo,
  editVideo,
  deleteVideo,
  deleteVideos
};
