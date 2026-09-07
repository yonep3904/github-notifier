# 開発ガイド

## 環境構築

Node.js 24 と、`package.json` の `packageManager` に指定された pnpm 11.9.0 を使用します。

```bash
pnpm install
pnpm dev
```

ローカルで Secret を使う場合は、Git 管理対象外の `.dev.vars` または `.env` を利用してください。
Webhook URL や認証情報をコード、ログ、test fixture へ記録しないでください。

## コマンド

| コマンド | 用途 |
| --- | --- |
| `pnpm dev` | Vite 開発サーバーを起動 |
| `pnpm build` | production build |
| `pnpm preview` | build 後の preview |
| `pnpm check` | Biome による lint と format の確認 |
| `pnpm typecheck` | TypeScript の型チェック |
| `pnpm test` | Vitest の全 test を実行 |
| `pnpm test:coverage` | coverage を取得 |
| `pnpm cf-typegen` | Wrangler 設定から binding 型を再生成 |
| `pnpm config-check` | Cloudflare に登録された Secret 名で Config を検証 |

`wrangler.jsonc` の binding を変更した場合は、`pnpm cf-typegen` を実行して `worker-configuration.d.ts` を同期します。

Pull Requestと `main`・`develop` への push では、Node.js 24 上で typecheck、Biome、test、build を実行します。

## 主な変更箇所

| 目的 | 主な場所 |
| --- | --- |
| 標準 Config や環境変数との対応を変える | `src/config/config.ts`, `src/types/env.ts` |
| Config の型・検証・Issue を変える | `src/config/types.ts`, `src/config/resolve-config.ts` |
| 対応する GitHub イベントを変える | `src/constants/github-events.ts`, `src/services/producers/github/parser/` |
| Manual API の入力を変える | `src/schemas/notify.ts`, `src/middleware/manual-notification-validator.ts` |
| 認証や body 制限を変える | `src/middleware/` |
| Discord の表示・送信を変える | `src/services/dispatchers/discord/` |
| Slack の表示・送信を変える | `src/services/dispatchers/slack/` |
| Queue 投入・retry を変える | `src/services/pipeline/`, `src/handlers/queue/` |
| route や HTTP response を変える | `src/routes/`, `src/controllers/`, `src/app/error-handler.ts` |
| status・wiki の内容を変える | `src/services/status/`, `src/services/docs/` |
| Web UI を変える | `src/views/`, `src/app/style.css` |
| 依存関係の組み立てを変える | `src/app/container.ts` |

## 変更時の原則

- 通知処理へ渡すのは `resolveConfig` を通過した `RuntimeConfig` に限定する
- Config の検証規則を route、service、UI へ重複させない
- channel ID は Queue job の配送先識別子なので、Config 内で一意かつ運用中に安定させる
- Issue の channel index を保つため、status 表示には filter 前の `NormalizedConfig` を使う
- request 固有の認証・検証は middleware、HTTP 変換は controller に置く
- 外部入力と内部 Notification、通知先固有 payload を境界ごとに分ける
- Queue 自体の retry と application による遅延再投入を区別する
- UI component は Config や service の判断を持たず、表示用 model を描画する

## 現行実装で注意する点

### GitHub payload の runtime 検証は限定的

GitHub Webhook では署名、body の JSON 変換、`X-GitHub-Event` を確認しますが、イベントごとの payload shape 全体は検証していません。
parser は GitHub の payload を前提にするため、関連変更では欠損値や想定外の値に対する test も追加してください。

### Config invalid 時の Queue job は破棄する

Config が invalid な状態で Queue batch を受け取ると、Issue を log へ出して batch 全体を `ackAll()` します。
設定修正後の再配送は行われません。
この方針を変える場合は、無限 retry と古い Config で作られた job の扱いを合わせて設計してください。

## Testとドキュメント

変更箇所に最も近い unit test に加え、境界の契約が変わる場合は次を更新します。

- Config: `test/config/`
- route、middleware、response: `test/routes/`, `test/controllers/`
- Queue と dispatcher: 対応する `test/services/`, `test/handlers/`
- UI の公開内容: README、docs、wiki の該当箇所
