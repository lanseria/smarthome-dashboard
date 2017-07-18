var config = {
  web: {
    title: "智能家庭控制平台",
    menu: [
      {
        fa: "lnr-home", 
        name: "概览", 
        url: 'index',
      }, 
      {
        fa: "lnr-chart-bars", 
        name: "传感器", 
        url: 'sensors',
      }, 
      {
        fa: "lnr-cog", 
        name: "控制器", 
        url: 'controllers'
      }, 
      {
        fa: "lnr-alarm", 
        name: "设备", 
        url: 'devices'
      },
    ],
  },
};

module.exports = config;