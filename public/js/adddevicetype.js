$().ready(function(){
  $("#add").validate({
    rule: {
      "devicetype[name]": {
        required: true
      },
      "devicetype[isController]": {
        required: true
      },
      "devicetype[devkey]": {
        required: true
      }
    }
  })
})
