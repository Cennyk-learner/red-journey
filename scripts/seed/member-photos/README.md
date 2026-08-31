# 成员头像导入

将每位成员的单人照放在此目录，文件名与 `src/data/team.ts` 中的 `id` 一致：

```
chen-yuxiao.jpg
liao-qi.png
...
```

运行：

```bash
python scripts/import-member-photos.py
```

也可通过环境变量 `RED_JOURNEY_MEMBER_PHOTOS` 指向其他目录。此目录默认不提交原始照片（见 `.gitignore`）。
