var cur_page = 1; // 当前页
var next_page = 1; // 下一页
var total_page = 1;  // 总页数
var house_data_querying = true;   // 是否正在向后台获取数据

// 解析url中的查询字符串
function decodeQuery(){
    var search = decodeURI(document.location.search);
    return search.replace(/(^\?)/, '').split('&').reduce(function(result, item){
        values = item.split('=');
        result[values[0]] = values[1];
        return result;
    }, {});
}

// 更新用户点选的时间筛选条件
function updateFilterDateDisplay() {
    var startDate = $("#start-date").val();
    var endDate = $("#end-date").val();
    var $filterDateTitle = $(".filter-title-bar>.filter-title").eq(0).children("span").eq(0);
    if (startDate) {
        var text = startDate.split('-')[1] + '-'+ startDate.split('-')[2]+ "/";
        text+= (endDate.split('-')[1] ? endDate.split('-')[1]: '-') + '-'+ endDate.split('-')[2];
        $filterDateTitle.html(text);
    } else {
        $filterDateTitle.html("入住日期");
    }
}

//  解析路由，根据路由更新复选框（时间和区域）
function update_date_area(){
    var url = location.search
    var u_list = []
    var list = url.split('&')
    for (i in list){
       a = list[i].split('=')
       u_list.push(a[1])
    }
    if (!u_list[0]){
        $('#area').html('位置区域')
    }else{
        $('#area').html(decodeURI(u_list[1]))
        $('#area').attr('area-id', u_list[0])
    }
    start_date_list = u_list[2].split('-')
    end_date_list = u_list[3].split('-')
    if ( u_list[2] && u_list[3]){
        $('#stay_date').html(start_date_list[1]+ '-'+ start_date_list[2]+ '/'+ end_date_list[1]+ '-'+ end_date_list[2])
        $('#start-date').val(u_list[2])
        $('#end-date').val(u_list[3])
    }
    if ( u_list[2] && !u_list[3]){
        $('#stay_date').html(start_date_list[1]+ '-'+ start_date_list[2]+ '/--')
        $('#start-date').val(u_list[2])
        $('#end-date').val('--')
    }
}

// 更新房源列表信息
// action表示从后端请求的数据在前端的展示方式
// 默认采用追加方式
// action=renew 代表页面数据清空从新展示
function updateHouseData(action) {
    var areaId = $("#area").attr("area-id");
    if (undefined == areaId) areaId = "";
    var startDate = $("#start-date").val();
    var endDate = $("#end-date").val();
    var sortKey = $(".filter-sort>li.active").attr("sort-key");
    var params = '?area_id='+ areaId+ '&start_date='+ startDate;
    params += '&end_date='+ endDate+ '&sort_key='+ sortKey;
//    var params = {
//        'area_id':areaId,
//        'start_date':startDate,
//        'end_date':endDate,
//        'sort_key':sortKey,
//       p:next_page
//    };
//    发起ajax请求，获取数据，并显示在模板中
    $.ajax({
       url:'/house/area_house_info/' + params,
       type:'GET',
       dataType:'json',
       success:function(data){
           //  加载数据之前删除之前的数据
           $('.house-item').remove();
           $('#error-message').remove();
           //  没有与搜索条件先匹配的房源
           if (data.data[0] == undefined){
               var div = $('<div>');
               div.attr('id', 'error-message');
               div.css({'color': 'red', 'font-size': '13px', 'text-align': 'center', 'margin-top': '60px', 'margin-bottom': '40px'});
               div.html('根据您的搜索条件，本网站目前没有匹配的房源！');
               $('.house-list').append(div);
               return;
           };
           //  加载房源数据
           for (i in data.data){
               var li = $('<li>');
               li.attr('class', 'house-item');
               $('.house-list').append(li);
               var a = $('<a>');
               a.attr('href', '/house/detail/'+ data.data[i].id+ '/');
               li.append(a);
               var img = $('<img>');
               img.attr('src', '/static/media/'+ data.data[i].image);
               a.append(img)
               var div = $('<div>')
               div.attr('class', 'house-desc')
               li.append(div)
               var div1 = $('<div>')
               div1.attr('class', 'landlord-pic')
               div.append(div1)
               var img1 = $('<img>')
               img1.attr('src', '/static/media/'+ data.data[i].user_avatar)
               div1.append(img1)
               var div2 = $('<div>')
               div2.attr('class', 'house-price')
               div2.html('$<span>'+data.data[i].price+'</span>/晚')
               div.append(div2)
               var div3 = $('<div>')
               div3.attr('class', 'house-intro')
               div.append(div3)
               var span = $('<span>')
               span.attr('class', 'house-title')
               span.html(data.data[i].title)
               div3.append(span)
               var em = $('<em>')
               em.html('出租'+ data.data[i].room +'间 - '+ (data.data[i].order_count ? data.data[i].order_count : 0) +'次下单 - '+ data.data[i].address)
               div3.append(em)
           }
       }
    })
}

$(document).ready(function(){
    var queryData = decodeQuery();
    var startDate = queryData["sd"];
    var endDate = queryData["ed"];
    $("#start-date").val(startDate);
    $("#end-date").val(endDate);
    updateFilterDateDisplay();
    var areaName = queryData["aname"];
    if (!areaName) areaName = "位置区域";
    $(".filter-title-bar>.filter-title").eq(1).children("span").eq(0).html(areaName);
    update_date_area();
//    更新区域信息
    $.ajax({
       url:'/house/area_facility_info/',
       dataType:'json',
       type:'GET',
       success:function(data){
          var num = 1
          for (i in data.data[0]){
              var li = $('<li>');
              li.html(data.data[0][i]);
              li.attr('area-id', num);
              num++;
              if ( data.data[0][i] == $('#area').html() ){
                  li.attr('class', 'active')
              };
              $('.filter-area').append(li);
          }
       }
    });

    updateHouseData("renew");
    $(".input-daterange").datepicker({
        format: "yyyy-mm-dd",
        startDate: "today",
        language: "zh-CN",
        autoclose: true
    });
    var $filterItem = $(".filter-item-bar>.filter-item");
    $(".filter-title-bar").on("click", ".filter-title", function(e){
        var index = $(this).index();
        if (!$filterItem.eq(index).hasClass("active")) {
            $(this).children("span").children("i").removeClass("fa-angle-down").addClass("fa-angle-up");
            $(this).siblings(".filter-title").children("span").children("i").removeClass("fa-angle-up").addClass("fa-angle-down");
            $filterItem.eq(index).addClass("active").siblings(".filter-item").removeClass("active");
            $(".display-mask").show();
        } else {
            $(this).children("span").children("i").removeClass("fa-angle-up").addClass("fa-angle-down");
            $filterItem.eq(index).removeClass('active');
            $(".display-mask").hide();
            updateFilterDateDisplay();
        }
    });
    $(".display-mask").on("click", function(e) {
        $(this).hide();
        $filterItem.removeClass('active');
        updateFilterDateDisplay();
        cur_page = 1;
        next_page = 1;
        total_page = 1;
        updateHouseData("renew");
    });
    $(".filter-item-bar>.filter-area").on("click", "li", function(e) {
        if (!$(this).hasClass("active")) {
            $(this).addClass("active");
            $(this).siblings("li").removeClass("active");
            $(".filter-title-bar>.filter-title").eq(1).children("span").eq(0).html($(this).html());
            $("#area").attr('area-id', $(this).attr('area-id'));
        } else {
            $(this).removeClass("active");
            $(".filter-title-bar>.filter-title").eq(1).children("span").eq(0).html("位置区域");
        }
    });
    $(".filter-item-bar>.filter-sort").on("click", "li", function(e) {
        if (!$(this).hasClass("active")) {
            $(this).addClass("active");
            $(this).siblings("li").removeClass("active");
            $(".filter-title-bar>.filter-title").eq(2).children("span").eq(0).html($(this).html());
        }
    })
})