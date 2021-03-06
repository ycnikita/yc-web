$(function() {

    var userInfo = {
        tel: "",
        qq: "",
        school: ""
    };

    $('.done').on('click', function(e) {

        //  阻止默认点击事件
        e.preventDefault();

        var tel = $('.tel  input').val();
        if (!tel) {
            $.toast("还没有填写电话哦~");
            return;
        }else if (!/^1[3|4|5|7|8]\d{9}$/.test(tel)) {
            $.toast("电话格式错误~");
            return;
        }

        var qq = $('.qq  input').val();
        if (!qq) {
            $.toast("还没有填写qq哦~");
            return;
        }else if (!/^\d{4,11}$/.test(qq)) {
            $.toast("qq格式错误~");
            return;
        }

        var school = $('.school div').html();
        if (!school) {
            $.toast("还没有填写学校哦~");
            return;
        }

        // var department = $('.department  input').val();
        // if (!department) {
        //   $.toast("还没有填写宿舍地址哦~");
        //   return;
        // }else if (!/^[\u4e00-\u9fa5|0-9]{0,10}$/.test(department) ) {
        //   $.toast("十个字以内就好啦~");
        //   return;
        // }
        //

        userInfo.tel  = tel;
        userInfo.qq  = qq;
        userInfo.school  = school;

        //  显示进度图标
        $.showPreloader();
        //  发送用户信息
        sendInfo(userInfo);

        function sendInfo(info) {
            var url = "http://" + location.host + "/self";
            $.ajax({
                type: 'POST',
                url: url,
                dataType: "json",
                data: JSON.stringify(info),
                contentType: "application/json",
                success: function () {
                    // showMessageSuccess("上传成功");
                    $.hidePreloader();
                    var nowUserInfo = window.utils.getFromLocal('userInfo');
                    nowUserInfo.qq = info.qq;
                    nowUserInfo.tel = info.tel;
                    nowUserInfo.school = info.school;
                    window.utils.saveToLocal('userInfo', nowUserInfo);
                    console.log("修改个人信息：",JSON.stringify(nowUserInfo));
                    location.href="http://" + location.host + "/";
                }
            });
        }


    });


    $('.school div').on('click', function(e) {
        //  清除
        $('#school_list').empty();
        $.showPreloader();
        $('#selectSchool').show();
        var url = "http://" + location.host + "/school";
        $.ajax({
            url: url,
            type: 'GET',
            dataType: 'json',
            success:function (json) {
                if(json.success){
                    $.hidePreloader();
                    var _strHtml='<ul id="school_list"></ul>';
                    $('#schoolListContainer').append(_strHtml);
                    $.each(json.data,function (index, item) {
                        var _liHtml='<li class="school_item">' +item.name+ '</li>';
                        $('#school_list').append(_liHtml);
                    });
                    $('.school_item').on('click',function () {
                        var schoolName = $(this).html();
                        $('.school div').html(schoolName)
                            .removeClass('c_gray');
                        $('#selectSchool').hide();
                    })

                }
            }
        });

    })
});
