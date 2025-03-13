v3

- 将对 navi portfolio 的检查合并到 getHolding 内，后续考虑将账户扫描直接独立成一个插件，免得出现后置插件反而成为前置插件的引用的情况
- 每次扫链之后自动将 USDC/NAVX/SUI 进行存款，暂时只做 NAVI 策略
-
