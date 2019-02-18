function showSuccessMsg() {
    $('.popup_con').fadeIn('fast', function() {
        setTimeout(function(){
            $('.popup_con').fadeOut('fast',function(){}); 
        },1000) 
    });
}

function getCookie(name) {
    var r = document.cookie.match("\\b" + name + "=([^;]*)\\b");
    return r ? r[1] : undefined;
}

$(document).ready(function(){
//    渲染头像和用户名
    $.get('/user/user_info/', function(data){
        $('#user-avatar').attr('src', '/static/media/'+ data.data.avatar)
        $('#user-name').val(data.data.name)
    })
//    修改头像
    $('#form-avatar').submit(function(e){
        e.preventDefault();
        avatar = $('#u-avatar').val();
        $(this).ajaxSubmit({
           url:'/user/update_avatar/',
           type:'PATCH',
           success:function(data){
              if (data.code == 200){
                  showSuccessMsg()
                  $('#user-avatar').attr('src', data.data)
              }
           },
           error:function(data){
           }
        })
    })
//   修改用户名
    $('#form-name').submit(function(e){
       e.preventDefault();
       name = $('#user-name').val();
       $(this).ajaxSubmit({
          url:'/user/update_name/',
          type:'PATCH',
          success:function(data){
             if (data.code == 200){
                showSuccessMsg()
             }
             if (data.code == 1007){
                $('.error-msg span').html(data.msg);
                $('.error-msg').show()
             }
          },
          error:function(data){
          }
       })
    })

})

