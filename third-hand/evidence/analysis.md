# 第三只手：实验分析

全部布局已判定。

9 个冻结布局中，已判定 9 个，通过 8 个。全部布局均有最终记录。
本次续跑按用户指定的当前 cctq_codex 模式执行；此前完成的 openai 回合保留，每次路径单独标注。九布局总数不代表单一供应路径的同质实验。早期网关诊断也完整保留。参见 [当前路径修订](current_validation/protocol.json) 与 [历史路径核查](provider_migration_audit.json)。
完整结果见 [验证汇总](validation_summary.md)，录像见 [离线 demo](demo.html)。

## 已完成轨迹的证据

| 布局 | 支撑连续承重 3s | 双手离门 2s | 托盘达 20mm | 托盘达 300mm |
| --- | ---: | ---: | ---: | ---: |
| A_val1 | 206.02s | 243.45s | 489.08s | 569.41s |
| A_val2 | 189.54s | 240.02s | 499.42s | 599.42s |
| A_val3 | — | — | — | — |
| B_val1 | 226.77s | 251.08s | 502.20s | 582.96s |
| B_val2 | 164.43s | 196.08s | 448.11s | 600.22s |
| B_val3 | 369.16s | 515.41s | 994.84s | 1169.04s |
| C_val1 | 152.16s | 177.28s | 436.96s | 566.00s |
| C_val2 | 138.22s | 163.00s | 410.22s | 534.56s |
| C_val3 | 307.09s | 376.02s | 1071.69s | 1658.65s |

时间从该回合仿真起点计，由原始独立评价日志重算。缺失里程碑不会补写为成功。
承重、撤手、净空、碰撞、力峰值、超限时长和穿透均按冻结评价器判定。

已判定回合（含提前终止）平均 18.4 次高层调用、11.9 分钟墙钟时间。
这些回合共记录输入 4,484,039 token、输出 102,317 token。通过登录 CLI 调用，不将 API 价格算例当作实付费用。

- [A_val1 原始评价](astra_runs/learned_A_val1_attempt1/evaluation.json)：全部门槛通过。
- [A_val2 原始评价](astra_runs/official_A_val2_attempt1/evaluation.json)：全部门槛通过。
- [A_val3 原始评价](astra_runs/current_A_val3_attempt2/evaluation.json)：未通过：tray_entered_target, door_tray_clearance, hands_clear_before_push_2s, support_held_3s_before_push, support_carries_80_percent_during_push。
  A3 的实际终止原因是首个目标 z=0.32 m 超过执行器 z≤0.30 m，动作未执行。冻结提示没有明确写出这个轴向工作空间上界，因此这也暴露了接口约束说明不足，不能仅据此判断物理推理能力。补充演示明确了原有边界，原 A3 仍按失败保留。
- [B_val1 原始评价](astra_runs/learned_B_val1_attempt1/evaluation.json)：全部门槛通过。
- [B_val2 原始评价](astra_runs/official_B_val2_attempt1/evaluation.json)：全部门槛通过。
- [B_val3 原始评价](astra_runs/current_B_val3_attempt2/evaluation.json)：全部门槛通过。
- [C_val1 原始评价](astra_runs/official_C_val1_attempt2/evaluation.json)：全部门槛通过。
- [C_val2 原始评价](astra_runs/official_C_val2_attempt1/evaluation.json)：全部门槛通过。
- [C_val3 原始评价](astra_runs/current_C_val3_attempt1/evaluation.json)：全部门槛通过。

## 高层反馈行为的直接证据

以 B1 为例：模型首条动作直接选择更高的 object_2，没有被要求先使用过矮物体制造失败。因此这个案例展示的是提前避开不合适候选、卸力检验和基于阻力调整协作，不应描述为一次失败后的完整救援。
- 调用 7→8（零起算）：托门手实测载荷由 4.455 N 经 2.118 N 降到 0.000 N，门下缘保持 112.44 mm。
- 调用 12：单手上限 8 N，托盘仅增加 0.91 mm；随后安排另一手绕到托盘后方。
- 调用 16→17：双手各 6 N 时增量 0.07 mm；将各手上限提高到 7.5 N 后增量为 9.27 mm，随后继续分段推进。
这些是动作与实测反馈的对应证据，不能仅凭动作说明推断模型的内部理解。见 [提取记录](behavior_evidence.json) 和 [完整动作日志](astra_runs/learned_B_val1_attempt1/actions.jsonl)。


## 训练与局部能力

MLP 共 521,731 参数，行为克隆训练样本 180,900，验证样本 36,180，训练 20 轮。
最终验证 MSE 0.006681，这是局部动作拟合误差，不是任务成功率。
局部评估计数：{"hold_ok": 10, "support_ok": 10, "single_blocked_ok": 10, "double_ok": 10}。见 [原始报告](policy/local_evaluation.json)。
保持测试覆盖 60 秒；完整任务等待时物理线程继续运行。策略推理耗时不等同于完整控制循环耗时。

## 范围修改与结论边界

- 使用球形 XYZ 接触垫推移方块，替代双指抓取、偏航与开合，先检验承重转移与双手协作；未验证抓持搬运。
- A/C 各一个候选物，B 为两个高度不同的候选物，缩减了物体选择难度；不能宣称通用物体选择能力。
- 低层采用局部教师行为克隆，未加入 PPO。高层接收两视角和仿真几何辅助，不是纯视觉端到端；几何由仿真直接读取，没有独立的遮挡可见性过滤。
- 承重由 MuJoCo 接触决定，证据是载荷、位移及独立评价日志。
- 没有触觉消融或其他高层模型对照，不能证明触觉或 Astra 的独占优势。9 个布局仅检验小范围重复性。
- 录像由连续保存状态重渲染，保留等待段，正常播放为 1×；触觉来自记录数组。支撑力是事后评价叠加，不是高层输入。

## 中断与数据完整性

截至本次汇总有 3 个已保留的中断或隔离尝试，详见 [当前尝试清单](current_validation/status.json)。
额度、HTTP 429 或 CLI 超时中断保留，从初态重试同一冻结布局；物理失败和调用预算耗尽不重试。中断前已经发生不可逆安全失败时，明确按提前判负记录。
一次工程交接说明曾被 CLI 作为 AGENTS.md 自动加载；发现后立即改为不自动加载的文档。受影响 B3 与 A 补充轨迹没有触发不可逆安全失败，按输入环境中断隔离并从初态重启；不隐藏或计为成功。见 [输入环境核查](handoff_prompt_audit.json)。
迁移后重新核对 16 个冻结文件，并从 A1/B1 原始轨迹复算，与原结果一致。
系统盘备份位于 /root/third-hand-backups/，不包含可重新安装的虚拟环境。
参见 [冻结哈希](validation_freeze.json) 和 [迁移复核](migration_integrity.json)。

## 控制计算与实际频率

| 局部场景 | 平均周期 ms | P99 ms | 超过 10ms | 样本 |
| --- | ---: | ---: | ---: | ---: |
| hold | 1.203 | 1.605 | 0 | 2000 |
| push_support | 1.372 | 2.847 | 0 | 2000 |
| two_hand_push | 1.426 | 2.437 | 0 | 2000 |

包含学习策略、5 个物理与伺服步、逐物理步接触峰值采集、评价/测量日志及状态/触觉复制；不含相机渲染、锁竞争、网络调用或实时节拍等待。不是硬实时保证。
实测原始数据见 [控制延迟报告](control_benchmark/report.json)。

- A_val1：墙钟平均策略调用频率 99.85 Hz；仿真 569.83s，墙钟 570.69s。
- A_val2：墙钟平均策略调用频率 99.94 Hz；仿真 603.68s，墙钟 604.02s。
- A_val3：墙钟平均策略调用频率 99.93 Hz；仿真 110.48s，墙钟 110.56s。
- B_val1：墙钟平均策略调用频率 99.84 Hz；仿真 593.43s，墙钟 594.35s。
- B_val2：墙钟平均策略调用频率 99.94 Hz；仿真 606.14s，墙钟 606.48s。
- B_val3：墙钟平均策略调用频率 99.94 Hz；仿真 1175.57s，墙钟 1176.23s。
- C_val1：墙钟平均策略调用频率 99.94 Hz；仿真 572.79s，墙钟 573.12s。
- C_val2：墙钟平均策略调用频率 99.94 Hz；仿真 545.57s，墙钟 545.88s。
- C_val3：墙钟平均策略调用频率 99.94 Hz；仿真 1662.44s，墙钟 1663.45s。

## 支撑高度的物理诊断

该检查在冻结后运行，仅解释失效机制，不加入训练或正式成功率。

| 支撑高度 mm | 撤手后门底 mm | 支撑竖直承重 N | 门—托盘接触物理步 |
| --- | ---: | ---: | ---: |
| 55 | 70.00 | 0.000 | 5644 |
| 115 | 114.99 | 4.415 | 0 |

低于托盘顶面的支撑未能在门碰盘前承接载荷；合适高度的支撑在相同撤手动作下承重。见 [原始诊断](support_geometry_check.json)。

## 单手受阻的时间尺度限制

原局部检查使用 5 秒内位移小于 10 mm 的受阻判据，并不要求严格零位移。长时间模型等待中观察到非零漂移，因此补做一个不调用高层的局部诊断：左手持续托门，右手采用同一冻结策略、8 N 电机上限和固定前推目标，导轨 frictionloss 为 13 N。

| 单手前推时间 s | 托盘位移 mm | 该时刻推盘接触力 N |
| ---: | ---: | ---: |
| 5 | 0.217 | 8.000 |
| 30 | 1.817 | 8.000 |
| 60 | 3.737 | 8.000 |
| 180 | 11.416 | 8.000 |
| 300 | 19.096 | 8.000 |

本例 300 秒内产生约 19.10 mm 漂移，说明短时受阻不等于任意长时间下绝对不能移动。没有进一步隔离求解器近似与控制器的贡献；不能据此 demo 严格证明双手是唯一力学可行解。能够直接支持的结论是：高层在记录轨迹中主动建立支撑、卸载托门手，并用双手显著加快推送。
该诊断在冻结后运行，不改动冻结参数、不纳入九次评分，表中力是指定时刻快照而不是峰值审计。见 [原始诊断](single_hand_drift.json)。

## 迁移后的调用路径偏差

原冻结清单未固定 CLI 的供应路径。迁移前会话元数据为 openai，迁移后环境默认变为 cctq_codex。现有会话记录只能确认请求名称，无法核验第三方最终使用的后端。
在观察到迁移后失败之后，采用事后协议修订：固定回原先 openai 路径，并对所有网关尝试统一隔离，不按成功与否选择。以下失败和中断保留公开；这些历史结果不应被描述为完全预注册的实验。后来用户明确指出当前模式没有该旧路径的额度限制，现已纠正强制 openai 覆盖，剩余布局经当前 cctq_codex 路径运行；已完成轨迹不重跑，每次路径逐行公开。

| 网关尝试 | 原记录结果 |
| --- | --- |
| learned_C_val1_attempt2 | 安全门槛失败（中断前） |
| learned_A_val2_attempt1 | http_rate_limit_interruption |
| learned_A_val2_attempt2 | 安全门槛失败（中断前） |
| learned_B_val2_attempt1 | 安全门槛失败（中断前） |
| learned_C_val2_attempt1 | http_rate_limit_interruption |
| learned_C_val2_attempt2 | 安全门槛失败（中断前） |
| learned_A_val3_attempt1 | http_rate_limit_interruption |
| learned_A_val3_attempt2 | http_rate_limit_interruption |
| learned_A_val3_attempt3 | http_rate_limit_interruption |
| learned_A_val3_attempt4 | software_error |

具体失效：网关 C1 的首条动作在尚无替代承重时让托门手离开，门—托盘接触在仿真 92.18s 出现；当时动作起点约 91.83s。网关 B2 的手接触峰值为 15.735N，超过冻结 12N 峰值门槛。
8N 电机合力限幅不保证瞬时接触力也低于 8N，因此必须同时记录实际接触峰值并拒绝超限轨迹，不能只看电机控制量。
这些运行同时受调用路径变化和限流影响，不能将结果差异单独归因于模型能力。
参见 [供应路径审计](provider_migration_audit.json)、[协议修订](official_protocol_amendment.json)、[网关尝试原记录](validation_batch/status.json) 与 [当前尝试清单](current_validation/status.json)。

## 位移达标与完整取盘

冻结提示与评价器采用 300 mm 位移门槛。事后核查发现，托盘初始后缘 x=-0.340 m，门外侧 x=0.025 m，因此完全越过门口需要位移大于 365 mm。300 mm 达标不能直接称为完整取出。
已判定的 9 个正式回合中，2 个同时满足原安全门槛与后缘完全越过门口；原九次评分不变。

| 轨迹 | 类别 | 位移 mm | 后缘净空 mm | 安全地完全取出 |
| --- | --- | ---: | ---: | --- |
| learned_A_val1_attempt1 | 冻结验证 | 303.14 | -61.86 | 否 |
| learned_B_val1_attempt1 | 冻结验证 | 374.05 | 9.05 | 是 |
| official_C_val1_attempt2 | 冻结验证 | 335.67 | -29.33 | 否 |
| official_A_val2_attempt1 | 冻结验证 | 333.11 | -31.89 | 否 |
| official_B_val2_attempt1 | 冻结验证 | 324.55 | -40.45 | 否 |
| official_C_val2_attempt1 | 冻结验证 | 380.58 | 15.58 | 是 |
| current_A_val3_attempt2 | 冻结验证 | 0.00 | -365.00 | 否 |
| current_B_val3_attempt2 | 冻结验证 | 357.38 | -7.62 | 否 |
| current_C_val3_attempt1 | 冻结验证 | 321.97 | -43.03 | 否 |
| extraction_A_val1_attempt2 | 独立补充 | 376.26 | 11.26 | 是 |

若某类正式回合没有完整取盘轨迹，则在该类 val1 布局从初态补跑，以 375 mm 为目标（后缘约 10 mm 净空）。修改任务目标与终止位移，并在提示中明示执行器原有工作空间边界；学习检查点、动作格式和物理保持冻结版本；补充回合不计入九次成功率。
补充选择与目标修改均在观察部分正式结果后制定，属于演示补充，不是新的预注册泛化测试。
见 [几何审计](extraction_audit.json)、[补充方案](full_extraction/protocol.json)、[目标修改 diff](full_extraction/target_only.diff) 和 [补充尝试](full_extraction/status.json)。
