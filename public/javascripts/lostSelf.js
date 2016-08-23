$('.found').on('click', function(e) {
  e.preventDefault();
  var lId = $(this).attr('data-lId');
  var info = {
    lId: lId,
    type: "found"
  }
  var that = this;
  $.showPreloader();
  var url = "http://" + location.host + "/lost/action";
  $.ajax({
    type: "POST",
    url: url,
    dataType: "json",
		contentType: "application/json",
    data: JSON.stringify(info),
    processData: false,
    success: function (data) {
      if (data.success) {
        $.hidePreloader();
        $(that).parent().parent().parent().parent().remove();
        $.toast('操作成功', 2000, "toast-success");

        //  隐藏加载
        $.hidePreloader();
      }
    },
    error: function (data) {
        // showMessageFail("上传出错, 请重试");
        console.log("上传失败");
    }

  });

})
