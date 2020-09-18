
module.exports = {
    devServer: {
        open: true,
        host: 'localhost',
        port: 8080,
        https: false,
        // 以上的ip與埠為本機，下面為需要跨域的
        proxy: {    //配置跨域
            '/api': {
                target: 'http://localhost:5000', // 連接的後端api
                ws: true,  // 如果要代理websockets
                changOrigin: true,//允许跨域
                pathRewrite: {
                    '^/api': '' // 請求的時候用這個api就可以
                }
            }
        }
    }
}