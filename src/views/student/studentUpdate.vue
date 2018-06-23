<template>
<div v-cloak>
  
</div>
</template>
<script>
    import { Message } from 'element-ui';
    import {global} from 'src/global/global';
    import {api} from 'src/global/api';

    export default {
        data() {
          return {
            ruleForm: {
              studentName: '',        //学生姓名
              sex:'man',              //性别
              minzu: '',
              jiguan: '',
              mianmao: '',
              xueyuan: '',
              ruxiaodate: '',
              birthDate: '',
              address: '',
              quanrizhi: true,      //全日制
              ins: [],
              beizhu: '',
              
            },
            rules: {
              studentName: [
                { required: true, message: '请输入学生名称', trigger: 'blur' },
                { min: 2, max: 8, message: '长度在 2 到 8 个字符', trigger: 'blur' }
              ],
              
            }
          };
        },
        mounted() {
            var vm = this;

            //修改时再调用
            vm.getFormData();

        },
        methods: {
            //根据id查询表单数据
            getFormData:function(){
                var vm = this;
                var data = this.$route.query;
                console.log('获取到url参数：',data);
                //根据url中的参数，进行ajax获取表单数据
                global.get( api.queryStudentsItem,{params:{'id':data.id}}, function(res){
                      console.log('-------根据id获取表单信息：',JSON.stringify(res) )
                      if(res.body.resultCode == 0){
                           var res = res.body.data;
                                console.log('=====',res);

                                vm.ruleForm = res
                                
                      }else{
                            //alert(res.body.resultMsg)
                            Message({
                                showClose: true,
                                message: res.body.resultMsg,
                                type: 'error'
                            });
                      }

                      
                },function(res){
                    //失败回调
                },true)
            },
            submitForm(formName) {
              let that = this;
              
              this.$refs[formName].validate((valid) => {
                if (valid) {
                      
                      console.log('提交入参：',this.ruleForm);

                      global.post('http://localhost:3000/api/modifyStudents',this.ruleForm,null,function(res){
                          //alert('插入数据成功，接口返回的数据为：',res)
                          
                          //正式编程以下代码请放到接口成功回调函数中
                          Message({
                              showClose: true,
                              message: '提交成功，正在跳转页面……',
                              type: 'success'
                          })
                          setTimeout(()=>{
                              //this.$router.push('/');
                              that.$router.push('/studentsManage/studentList')
                          },2000)
                      },function(res){
                          alert('插入数据失败，接口返回的数据为：',res)
                          
                      })
                      
                } else {
                  console.log('error submit!!');
                  return false;
                }
              });
            },
            resetForm(formName) {
              this.$refs[formName].resetFields();
              // 等同于
              // this.ruleForm = {
              //   name: '',
              //   region: '',
              //   date1: '',
              //   date2: '',
              //   delivery: false,
              //   type: [],
              //   resource: '',
              //   desc: ''
              // }
            }
        }
      }
</script>

<style scoped>
[v-cloak] {
  display: none;
}
.component-item{
  margin-top: 100px;
}
.code-part{
  margin-top: 20px;
}
</style>
