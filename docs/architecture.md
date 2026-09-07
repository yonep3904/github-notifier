# アーキテクチャ

## 全体像

GitHub Notifier は、HTTP で通知を受理する処理と外部 Webhook へ配送する処理を Cloudflare Queue で分離しています。

```text
GitHub Webhook / Manual API
            │
            ▼
 middleware → controller → producer
            │
            ▼
 NotificationReceiver
            │
            ▼
     Cloudflare Queue
            │
            ▼
 NotificationConsumer
            │
            ▼
 dispatcher → builder → sender
            │
            ▼
      Discord / Slack
```

HTTP レスポンスは Queue へ job を追加した時点で返します。
そのため、`queued: true` は Discord や Slack への到達を保証しません。

## 起動時の構成

リクエストまたは Queue batch ごとに `src/app/container.ts` の `createContainer` が環境変数から依存関係を構築します。

```text
Env
 └─ createConfig
     └─ resolveConfig
         ├─ valid
         │   ├─ UI controller
         │   ├─ notify controller
         │   └─ available queue handler
         └─ invalid
             ├─ UI controller
             └─ unavailable queue handler
```

Config が invalidでも `/`、`/docs`、`/status` は利用できます。
`/notify` 以下は `503` を返し、届いた Queue batch は再試行を続けないよう `ackAll()` で破棄します。

## 主な責務

| 場所 | 責務 |
| --- | --- |
| `src/app` | Hono アプリ、依存関係、共通エラー処理の組み立て |
| `src/config` | 環境変数からの Config 生成、正規化、検証、実行用 Config への変換 |
| `src/routes` | パス、HTTP method、middleware 順序の定義 |
| `src/middleware` | body サイズ制限、認証、JSON・header・request 形式の検証 |
| `src/controllers` | HTTP request と application service の接続 |
| `src/services/producers` | GitHub・manual 入力から内部 Notification への変換 |
| `src/services/pipeline` | channel ごとの Queue 投入、配送、再投入 |
| `src/services/dispatchers` | Discord・Slack payload の生成と Webhook 送信 |
| `src/services/status`, `src/services/docs` | UI 用 model の生成と render |
| `src/views` | Hono JSXによるページと component |
| `src/handlers/queue` | Config 状態に応じた Queue batch の入口 |

外部 payload、内部 Notification、通知先固有 payload を別の型として扱い、producer と dispatcherを境界にしています。
UI には Config を直接渡さず、model builder で表示用データへ変換します。

## Configを信頼境界にする

`src/config/config.ts` の `createConfig` は標準 Config を作りますが、環境変数は runtime の外部入力であり、fork した利用者は生成処理自体を変更できます。
このため、通知処理は未検証の `Config` ではなく `resolveConfig` が返す `RuntimeConfig` を使います。

- `Config`: `createConfig` が作った未検証の入力
- `NormalizedConfig`: Zod で構造を検証し、既定値を補完した診断・表示用の値
- `RuntimeConfig`: error がなく、Webhook URL を持つ channel だけに絞った実行用の値

`NormalizedConfig` は元の channel 順を維持します。
`/status` の Issue path に含まれる indexと表示する channel を一致させるため、status model は `RuntimeConfig` ではなくこちらを参照します。

検証結果は `error` と `warning` に分かれます。
error が 1 件でもあれば通知機能を構築しません。
warning だけなら通知機能は利用できます。
Secret は漏洩防止のため、値の内容や到達性ではなく存在だけを検証します。

## Queue と配送

`NotificationReceiver` は、通知元が channelの `allowedSources` に含まれるかを確認し、対象 channel ごとに独立した job を `sendBatch` で投入します。
job は channel ID、内部 Notification、application 側の再投入回数を持ちます。

`NotificationConsumer` は batch 内の job を逐次処理します。

- 成功: 処理を終了
- rate limit: `Retry-After` または既定の遅延時間で再投入
- network error、timeout、5xx: 1 秒後に再投入
- その他の error: log を残して drop
- `reenqueueLimit` 到達: log を残して drop

標準 Config の application 再投入上限は 3 回、`wrangler.jsonc` の Queue consumer 側の `max_retries` は 5 回です。
両者は別の仕組みです。
配送順序は保証せず、再投入された job が後続 job より後に届く場合があります。

channel ごとに job を分けるため、一部の通知先だけが失敗しても、成功済みの通知先へ application retry で重複配送しません。
一方、Queue 投入後に Config から channel ID を削除すると、対応する dispatcher を見つけられず、その job は drop されます。

## セキュリティ境界

- Manual API: 64 KiB の body 上限、任意の Bearer 認証、Zod による request 検証
- GitHub Webhook: 25 MiB の body 上限、任意の HMAC-SHA256 署名検証、`X-GitHub-Event` の検証
- Config: Zod による構造検証と項目間の検証
- 外部 Webhook response: retryable、rate limit、non-retryable への分類

GitHub payload は型が複雑で、イベントごとの runtime schema では検証していません。
正規の GitHub 以外から不正な shape を送られないよう、公開環境では `GITHUB_WEBHOOK_SECRET` を設定してください。
Manual API の password も未設定なら認証なしで公開されます。
