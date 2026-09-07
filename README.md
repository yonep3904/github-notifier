# GitHub Notifier

GitHub の Webhook イベントや任意のメッセージを、Discord または Slack へ転送するセルフホスト型の通知アプリケーションです。
Cloudflare Workers と Cloudflare Queues 上で動作します。

## デプロイ

### 必要なもの

- Node.js 24
- pnpm 11.9.0
- Cloudflare アカウント
- Discord Webhook URL または Slack Incoming Webhook URL

リポジトリを fork または clone し、依存パッケージをインストールします。

```bash
git clone https://github.com/yonep3904/github-notifier.git
cd github-notifier
pnpm install
```

Wrangler で Cloudflare へログインし、通知を処理する Queue を作成します。

```bash
pnpm exec wrangler login
pnpm exec wrangler queues create notification-queue
```

通知先の Webhook URL を Secret として登録します。
Discord と Slack は併用でき、それぞれ最大5件まで登録できます。
少なくとも1件は登録が必要です。

```bash
# Discordを使う場合
pnpm exec wrangler secret put DISCORD_WEBHOOK_URL_1

# Slackを使う場合
pnpm exec wrangler secret put SLACK_WEBHOOK_URL_1
```

受信エンドポイントを保護する Secret も登録します。
設定は任意ですが、公開環境では両方の設定を推奨します。

```bash
pnpm exec wrangler secret put GITHUB_WEBHOOK_SECRET
pnpm exec wrangler secret put MANUAL_NOTIFICATION_PASSWORD
```

設定を事前確認してデプロイします。
`config-check` は Cloudflare に登録された Secret の名前だけを確認し、値を取得・表示しません。

```bash
pnpm run config-check
pnpm run deploy
```

デプロイ後、表示された Worker の URL で `/status` を開きます。
設定が `valid` なら通知を受信できます。
エラーがある場合は、画面に表示される修正案と `/docs/ja` を確認し、Secret などを変更して再デプロイしてください。

### GitHub Webhookを接続する

GitHub リポジトリの `Settings` → `Webhooks` → `Add webhook` で、次の値を設定します。

| 項目 | 値 |
| --- | --- |
| Payload URL | `https://<your-worker>/notify/github` |
| Content type | `application/json` |
| Secret | `GITHUB_WEBHOOK_SECRET` に登録した値 |

通知したいイベントを選択して保存してください。

## デプロイ後のページ

- `/status`: 設定状態、通知先、エラーと警告を確認
- `/docs/ja`: 設定方法や通知 API の日本語ガイド
- `/docs/en`: 英語版ガイド

## 開発

実装を変更する場合は [開発者向けドキュメント](./docs/README.md) を参照してください。

```bash
pnpm dev
pnpm check
pnpm typecheck
pnpm test
pnpm build
```

## License

このリポジトリは MIT ライセンスの下で公開されています。
詳細は [LICENSE](./LICENSE) を参照してください。
