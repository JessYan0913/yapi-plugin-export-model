# yapi-plugin-export-model

通过`yapi`的‘导出数据’中的`model`选项导出对应API的`Android`和`iOS`对应的Model文件。

## 安装插件

- 安装ykit（已经装过的请忽略）

  ```shell
  npm install -g ykit
  ```

- 安装yapi（已经装过的请忽略）

  ```shell
  npm install -g yapi-cli --registry https://registry.npm.taobao.org
  ```

- 安装插件

  ```shell
  git clone https://github.com/JessYan0913/yapi-plugin-export-model.git

  mv yapi-plugin-export-model ~/yapi/vendors/node_modules/yapi-plugin-export-model

  cd ~/yapi/vendors

  npm install
  ```

- 重启`Yapi`服务

  ```shell
  npm install

  ykit pack -m

  node server/app.js
  ```

##  配置插件

在`yapi`的根目录下找到`config.json`文件，在`plugins`配置项，加入`yapi-plugin-export-model`插件，

```shell
{
  "port": "3000",
  "adminAccount": "admin@admin.com",
  "timeout": 120000,
  ...
  "plugins": [
    {
      "name": "export-model",
      "options": {
        "baseRequest": {
          "java": "TKReq",
          "oc": "TKReq"
        },
        "baseResponse": {
          "java": "TKRes",
          "oc": "TKRes"
        }
      }
    }
  ]
}
```



> `baseRequest`和`baseResponse`是`RequestModel`和`ResponseModel`的基类配置，即所有的`RequestModel`和 `ResponseModel`对象都会继承该配置的类型。
>
> `baseRequest`和`baseResponse`是非必须配置。

## 导出Model

选择项目中的`数据管理`选项，在`数据导出`中选择`model`选项，点击`导出`即可完成项目API的`Android/iOS`的`Model`。

![3-1](./image/3-1.png)

![3-2](./image/3-2.png)

导出文件名为`model.zip`的压缩包，解压后目录结构如下：

```shell
|-model
  |-Android
  |  |-APITest
  |  |  |-APITestReq.java
  |  |  |-APITestRes.java
  |-iOS
  |  |-APITest
  |  |  |-APITestReq.h
  |  |  |-APITestReq.m
  |  |  |-APITestRes.h
  |  |  |-APITestRes.m
```

