function logout() {
    $.get("/user/logout", function(data){
        if (200 == data.code) {
            location.href = "/house/index/";
        }
    })
}

$(document).ready(function(){
// 页面加载完成之后，执行ajax
    $.ajax({
       url:'/user/user_info/',
       type:'GET',
       dataType:'json',
       success:function(data){
          $('#user-name').html(data.data.name)
          $('#user-mobile').html(data.data.phone)
          $('#user-avatar').attr('src','/static/media/'+ data.data.avatar)
       }
    })
})