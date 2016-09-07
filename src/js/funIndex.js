$('.item-block').on('click', function(e) {
  var fId = $(this).attr("data-fId");
  var host = location.host;
  location.href = "http://" + host + "/fun/detail/" + fId;
})

var imgs = $('.img-wrapper img');
imgs.each(function(item, index) {
  console.log(item, index);
  var i = $(item);
  console.log(i);
  if (!i.attr('src')) {
    i.parent().children('.no-img').css('display', 'block');
  }
})
