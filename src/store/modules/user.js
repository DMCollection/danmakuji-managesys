// import { loginByEmail, logout, getInfo } from 'api/login';
import Cookies from 'js-cookie';

import {global} from 'src/global/global';
import {api} from 'src/global/api';
// import store from '../../store';
import { Message } from 'element-ui';
import adminApi from 'src/global/adminApi';

const user = {
  state: {
    uid: localStorage.getItem("USER_ID"),
    token: localStorage.getItem("JWT_TOKEN"),
    userInfo:null,
  },

  mutations: {
    SET_UID: (state, uid) => {
      state.uid = uid;
    },
    SET_TOKEN: (state, token) => {
      state.token = token;
    },
    SET_USERINFO: (state, userInfo) => {
      state.userInfo = userInfo;
    },

   
    LOGIN_SUCCESS: () => {
      console.log('login success')
    },
    // LOGOUT_USER: state => {
    //   state.user = '';
    // }
  },

  actions: {
    // 邮箱登录
    async LoginByEmail({ commit }, userInfo) {
      //const email = userInfo.email.trim();
      let res = await adminApi.login(userInfo);
      let rd = res.data;

      let token = "";

      if (rd.code === 2002 || rd.data == null) {
        Message({
          message: "账号不存在或密码错误",
          type: "error"
        });
        return false;
      };
      console.log("login result: ",rd);
      if (rd.code === 0 || rd.msg === "OK") {
        token = rd.data.token;
        let loginUserName = userInfo.principal;
        console.log("login return data:",rd.data);
        let uid = rd.data.user.uid;
        console.log("set uid:"+uid);
        localStorage.setItem("USER_ID", uid);
        localStorage.setItem("JWT_TOKEN", token);
        localStorage.setItem("loginUserName", loginUserName);

        commit('SET_TOKEN', rd.data.token);
        commit("SET_UID",uid);
        if (!token) {
          Message({
            showClose: true,
            message: rd.msg,
            type: 'error'
          });
        };
      };
    },

    // 获取用户信息
    async GetInfo({ dispatch,commit, state }) {
      console.log(state);
      console.log("state.uid:"+state.uid);
      if(!state.uid){
        console.log("uid 为空,登陆已过期，请重新登陆");
        localStorage.setItem("USER_ID", "");
        localStorage.setItem("JWT_TOKEN", "");
        localStorage.setItem("loginUserName", "");
        Message({
          message: "登陆已过期，请重新登陆",
          type: "error"
        });
        setTimeout(() => {
          window.location.href('/login');
      }, 1500);
      }
        let res = await adminApi.getUserInfoById(state.uid);
        let rd = res.data;
        if(rd.code === 5001 || rd.data == null){
          Message({
            message: "用户id不存在",
            type: "error"
          });
        }
        if(rd.code === 0){
                             //设置userInfo
          commit('SET_USERINFO', rd.data);

          //获取到信息时同时设置用户菜单权限
           // store.dispatch('GenerateRoutes', res.permissions); 等同于
           let permission = {
            "/index/readme":true,
            "/index/personalInfo":true,
            "/example/tableList":true,
            "/movie/newMovie":true,
            "/movie/movieSearch":true,
            "/errorpage/401":false,
            "/errorpage/404":false,
            "/example/form":true,
            "/example/tinymce":true,
            "/example/mixin":true,
            "/example/31":false,
            "/systemSet/permissionsManage":true,
            "/systemSet/loginLog":true,
            "/listusers":true,
            "/uploadtest":true,
            "/bangumilist":true,
          };
           dispatch('GenerateRoutes', permission);
        }
        return res;
    },

    

    // 第三方验证登录
    LoginByThirdparty({ commit, state }, code) {
      return new Promise((resolve, reject) => {
        commit('SET_CODE', code);
        loginByThirdparty(state.status, state.email, state.code, state.auth_type).then(response => {
          commit('SET_TOKEN', response.data.token);
          Cookies.set('userToken', response.data.token);
          resolve();
        }).catch(error => {
          reject(error);
        });
      });
    },


    // 登出 （头部登出）
    LogOut({ commit, state }) {
      return new Promise((resolve, reject) => {
        //换成请求登出接口
        // logout(state.token).then(() => {  
          commit('SET_TOKEN', '');
          // commit('SET_ROLES', []);
          localStorage.setItem("USER_ID", "");
          localStorage.setItem("JWT_TOKEN", "");
          localStorage.setItem("loginUserName", "");
          resolve();
        // }).catch(error => {
        //   reject(error);
        // });
      });
    },


    // 动态修改权限
    ChangeRole({ commit }, role) {
      return new Promise(resolve => {
        // commit('SET_ROLES', [role]);
       //store.dispatch('GenerateRoutes', res.permissions);
        dispatch('GenerateRoutes', res.permissions);
        resolve();
      })
    }
  }
};

export default user;
