//模态框居中的控制
function centerModals(){
    $('.modal').each(function(i){   //遍历每一个模态框
        var $clone = $(this).clone().css('display', 'block').appendTo('body');    
        var top = Math.round(($clone.height() - $clone.find('.modal-content').height()) / 2);
        top = top > 0 ? top : 0;
        $clone.remove();
        $(this).find('.modal-content').css("margin-top", top-30);  //修正原先已经有的30个像素
    });
}

function setStartDate() {
    var startDate = $("#start-date-input").val();
    if (startDate) {
        $(".search-btn").attr("start-date", startDate);
        $("#start-date-btn").html(startDate);
        $("#end-date").datepicker("destroy");
        $("#end-date-btn").html("离开日期");
        $("#end-date-input").val("");
        $(".search-btn").attr("end-date", "");
        $("#end-date").datepicker({
            language: "zh-CN",
            keyboardNavigation: false,
            startDate: startDate,
            format: "yyyy-mm-dd"
        });
        $("#end-date").on("changeDate", function() {
            $("#end-date-input").val(
                $(this).datepicker("getFormattedDate")
            );
        });
        $(".end-date").show();
        $('.search-btn').html('搜索房源');
    }
    $("#start-date-modal").modal("hide");
}

function setEndDate() {
    var endDate = $("#end-date-input").val();
    if (endDate) {
        $(".search-btn").attr("end-date", endDate);
        $("#end-date-btn").html(endDate);
    }
    $("#end-date-modal").modal("hide");
}

function goToSearchPage(th) {
      var area_id = $(th).attr("area-id");
      var start_date = $(th).attr("start-date");
      var end_date = $(th).attr("end-date");
      var area_name = $(th).attr("area-name")
      var url = '/house/search/';
      url += '?area_id='+ area_id+ '&area_name='+ area_name+ '&start_date='+ start_date+ '&end_date='+ end_date;
      location.href = url;
}

$(document).ready(function(){
    //  登录状态则隐藏登录注册按钮，显示用户头像和电话
    $.get('/user/check_login/',function(data){
         if (data.code == 200){
              $(".top-bar>.user-info").show();
              $(".top-bar>.register-login").hide();
              $('.user-name').html(data.data)
         }
         if (data.code == 1010){
              $(".top-bar>.register-login").show();
              $(".top-bar>.user-info").hide();
         }
    })
    //  随机选取数据库中三个房源信息，渲染主页轮播图
    $.get('/house/index_house_image_random/',function(data){
         $('#index-image1').attr('href', '/house/detail/'+ data.data[0][0]+ '/')
         $('#index-image1 img').attr('src', '/static/media/'+ data.data[0][1])
         $('.index-image1').html(data.data[0][2])
         $('#index-image2').attr('href', '/house/detail/'+ data.data[1][0]+ '/')
         $('#index-image2 img').attr('src', '/static/media/'+ data.data[1][1])
         $('.index-image2').html(data.data[1][2])
         $('#index-image3').attr('href', '/house/detail/'+ data.data[2][0]+ '/')
         $('#index-image3 img').attr('src', '/static/media/'+ data.data[2][1])
         $('.index-image3').html(data.data[2][2])
    })
    var mySwiper = new Swiper ('.swiper-container', {
        loop: true,
        autoplay: 2000,
        autoplayDisableOnInteraction: false,
        pagination: '.swiper-pagination',
        paginationClickable: true
    });
    $('.modal').on('show.bs.modal', centerModals);      //当模态框出现的时候
    $(window).on('resize', centerModals);               //当窗口大小变化的时候
    $("#start-date").datepicker({
        language: "zh-CN",
        keyboardNavigation: false,
        startDate: "today",
        format: "yyyy-mm-dd"
    });
    $("#start-date").on("changeDate", function() {
        var date = $(this).datepicker("getFormattedDate");
        $("#start-date-input").val(date);
    });
    //  渲染区域框数据
    $.ajax({
        url:'/house/area_facility_info/',
        type:'GET',
        dataType:'json',
        success:function(data){
           // 循环生成城区a标签
           var num = 1
           for (i in data.data[0]){
              var a = $('<a>');
              a.html(data.data[0][i]);
              a.attr('area-id', num)
              num++
              $('.area-list').append(a);
           }
           // 每个城区的点击事件
           $(".area-list a").click(function(e){
               $("#area-btn").html($(this).html());
               $(".search-btn").attr("area-id", $(this).attr("area-id"));
               $(".search-btn").attr("area-name", $(this).html());
               $("#area-modal").modal("hide");
               $('.search-btn').html('搜索房源');
           });
        }
    })
})