var net = require('net')
var server = net.createServer(function (socket) {
  // 新的连接
  socket.on('data', function (data) {
    console.log(data.toString())
    socket.write("你好")
  })
  socket.on('end', function () {
    console.log('连接断开')
  })
  socket.write("欢迎光临《深入浅出node.js》示例：\n")
})
server.listen(8124, function () {
  console.log('server bound')
})