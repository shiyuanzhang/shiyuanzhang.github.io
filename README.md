# Shiyuan Zhang 的个人学术主页

主页地址：https://shiyuanzhang.github.io （启用 GitHub Pages 并成功构建后可访问）

基于 [AcadHomepage](https://github.com/RayeRen/acad-homepage.github.io)，保留原模板的响应式学术主页布局。内容目前为占位，不包含虚构论文、学校或联系方式。

## 修改内容

- `_config.yml`：姓名、简介、头像路径、单位、所在地、邮箱及学术链接。留空的联系方式不会显示。
- `_pages/about.md`：个人简介、研究方向、动态、论文、教育、工作实习、荣誉。
- `_data/navigation.yml`：顶部栏目。
- `images/avatar.svg`：默认字母头像。上传照片后，修改配置中的 `author.avatar`。
- `assets/css/main.scss`：页面样式。

## 首次发布

仓库 Settings → Pages → Build and deployment：选择 Deploy from a branch，分支 `main`，目录 `/(root)`，保存。GitHub Pages 会自动构建 Jekyll；后续提交会自动更新。

## 本地运行

安装 Ruby 和 Bundler 后，在仓库目录执行：

```sh
bundle install
bundle exec jekyll serve
```

浏览器打开 http://127.0.0.1:4000 。

尚未配置 Google Scholar，引用统计请求与自动抓取均未启用。未配置访客统计。

## 致谢与许可

原模板 © 2022 Yi Ren，MIT License，详见 LICENSE。继承的主题与图标资源保留原有许可说明。

网页托管在 shiyuanzhang 账号下，页面中的 GitHub 链接仍指向日常使用的 fufu1013 账号；可在 `_config.yml` 的 `author.github` 修改。
