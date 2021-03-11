# Availability_Outer_Majors

学校选课系统中外专业课辅助选择的工具。通过油猴脚本进行加载，对于页面上的课程容量、课程时间等信息进行分析，筛掉时间冲突、没有容量的课程。本脚本不会帮你进行选课，更不会帮你进行抢课

使用方法：[打开这里](https://tools.zsh2517.com/availability_outer_majors/main.user.js)，tamperMonkey 会提示添加脚本。添加后，修改 `const refuse` 字段，按照说明添加不希望选择的课程分类。（默认情况下不添加问题也不大，只是不会过滤你自己所在的学院）

之后打开个人课表查询（定位到总课表）进行课表导入，打开后会自动导入（此时提示导入成功）。导入后再次打开外专业课程即可。

---

托管地址

```
https://tools.zsh2517.com/availability_outer_majors/main.user.js
```