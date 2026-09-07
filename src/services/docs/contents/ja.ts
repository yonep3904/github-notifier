import type { DocsLocale, DocsPageModel, DocsSectionModel } from "../types";
import {
  authenticationSecretCommands,
  channelConfigSample,
  cloneCommands,
  cloudflareCommands,
  deployCommands,
  discordSecretCommand,
  githubSettings,
  handlerConfigSample,
  manualCurl,
  slackSecretCommand,
} from "./common";

export function japaneseDocs(baseUrl: string, locale: DocsLocale): DocsPageModel {
  return {
    locale,
    title: "Documentation",
    introduction:
      "GitHub Notifier のデプロイ、通知先とハンドラーの設定、GitHub Webhook・手動通知の利用方法を説明します。",
    baseUrlLabel: "Base URL",
    baseUrl,
    contentsLabel: "目次",
    sections: japaneseSections(baseUrl),
  };
}

function japaneseSections(baseUrl: string): DocsSectionModel[] {
  return [
    {
      id: "overview",
      title: "概要",
      description:
        "GitHubイベントや任意のメッセージを受け取り、Cloudflare Queueを経由してDiscord・Slackへ配送します。",
      blocks: [
        {
          type: "table",
          label: "エンドポイント一覧",
          columns: ["Method / Path", "用途"],
          rows: [
            ["GET /", "ルートページを表示"],
            ["GET /docs", "英語版ドキュメントを表示"],
            ["GET /docs/ja", "日本語版ドキュメントを表示"],
            ["GET /status", "設定や稼働状態、通知先、エラー、警告を確認"],
            ["POST /notify/github", "GitHub Webhookの受信先"],
            ["POST /notify/manual", "手動通知の受信先"],
            ["POST /notify", "手動通知（/notify/manual）のエイリアス"],
          ],
        },
      ],
    },
    {
      id: "deployment",
      title: "デプロイ",
      description: "Cloudflare Workers と Queues を利用する基本的なセットアップ手順です。",
      blocks: [
        {
          type: "steps",
          items: [
            {
              title: "リポジトリを用意する",
              paragraphs: [
                "Node.js 24とpnpm 11.9.0を用意します。独自の設定や通知処理を継続して管理する場合は、cloneする前にリポジトリをforkしてください。",
              ],
              codeSamples: [{ title: "Clone and install", language: "bash", code: cloneCommands }],
            },
            {
              title: "CloudflareとQueueを準備する",
              paragraphs: [
                "WranglerでCloudflareへログインし、wrangler.jsoncが参照するnotification-queueを作成します。すでに作成済みの場合、Queue作成は不要です。",
              ],
              codeSamples: [
                { title: "Login and create queue", language: "bash", code: cloudflareCommands },
              ],
            },
            {
              title: "通知先を登録する",
              paragraphs: [
                "DiscordまたはSlackのWebhook URLをCloudflare Secretへ登録します。両方を併用でき、それぞれ末尾1〜5の変数で最大5件まで登録できます。少なくとも1件は登録が必要です。",
              ],
              codeSamples: [
                { title: "Discord", language: "bash", code: discordSecretCommand },
                { title: "Slack", language: "bash", code: slackSecretCommand },
              ],
            },
            {
              title: "受信エンドポイントを保護する（任意）",
              paragraphs: [
                "GitHub Webhookの署名検証と手動通知のBearer認証に使うSecretを登録します。利用しないハンドラーの値は省略できますが、公開するハンドラーには設定を推奨します。",
              ],
              codeSamples: [
                {
                  title: "Configure authentication",
                  language: "bash",
                  code: authenticationSecretCommands,
                },
              ],
            },
            {
              title: "デプロイする",
              paragraphs: [
                "WorkerをCloudflareへデプロイします。初めてデプロイする場合は、workers.dev subdomain の設定などを求められます。指示に従って設定してください。",
              ],
              codeSamples: [{ title: "Deploy", language: "bash", code: deployCommands }],
            },
          ],
        },
        {
          type: "table",
          label: "環境変数のまとめ",
          columns: ["変数", "用途"],
          rows: [
            ["DISCORD_WEBHOOK_URL_1 … 5", "値がある番号のDiscord通知先を有効化"],
            ["SLACK_WEBHOOK_URL_1 … 5", "値がある番号のSlack通知先を有効化"],
            ["GITHUB_WEBHOOK_SECRET", "GitHub WebhookのHMAC-SHA256署名を検証"],
            ["MANUAL_NOTIFICATION_PASSWORD", "手動通知APIへBearer認証を要求"],
          ],
        },
      ],
    },
    {
      id: "github-webhook",
      title: "GitHub Webhook",
      description: "GitHub repositoryから選択したイベントをWorkerへ送信します。",
      blocks: [
        {
          type: "steps",
          items: [
            {
              title: "Webhookを追加する",
              paragraphs: [
                "GitHubのRepository settings → Webhooks → Add webhookを開きます。WorkerにGITHUB_WEBHOOK_SECRETを設定した場合は、GitHub側にも同じ値を入力します。Content typeにはapplication/jsonを選択してください。",
              ],
              codeSamples: [
                {
                  title: "GitHub webhook settings",
                  language: "text",
                  code: githubSettings(baseUrl),
                },
              ],
            },
            {
              title: "イベントを選択する",
              paragraphs: [
                "GitHub側で送信するイベントを選びます。後述するConfigにより、受信側でもイベントの有効化・無効化やGitHub通知自体の無効化を設定できます。",
              ],
            },
            {
              title: "配信結果を確認する",
              paragraphs: [
                "GitHubのWebhook画面でRecent Deliveriesを確認します。Workerがリクエストを受理しても通知はQueue経由で非同期配送されるため、最終到達はDiscord・SlackとCloudflareのログで確認してください。",
              ],
            },
          ],
        },
        {
          type: "note",
          tone: "info",
          title: "非同期配送",
          body: "通知APIの queued: true はQueueへの投入成功を表します。DiscordやSlackへの配送完了を保証するものではありません。",
        },
      ],
    },
    {
      id: "manual-notification",
      title: "手動通知",
      description: "CIや運用スクリプトから任意のメッセージを通知します。",
      blocks: [
        {
          type: "cards",
          items: [
            {
              title: "通知を送信する",
              paragraphs: [
                "Content-Typeにapplication/jsonを指定します。messageは空白以外を含む必須文字列、titleは省略可能です。MANUAL_NOTIFICATION_PASSWORDを設定した場合はBearer tokenとして送信し、未設定の場合だけAuthorization headerを省略します。POST /notifyも同じ操作を行います。",
              ],
              codeSamples: [
                {
                  title: "Send a test notification",
                  language: "bash",
                  code: manualCurl(
                    baseUrl,
                    "passwordを設定していない場合はAuthorization headerを削除します",
                  ),
                },
              ],
            },
          ],
        },
        {
          type: "table",
          label: "成功レスポンス",
          columns: ["レスポンス", "意味"],
          rows: [
            ['{ "ok": true, "queued": true }', "1件以上の配送jobをQueueへ投入"],
            [
              '{ "ok": true, "queued": false }',
              "manualを許可する有効なchannelがなく、jobを投入していない",
            ],
            [
              '{ "ok": false, "error": ..., "message": ... }',
              "認証エラー、JSONパースエラー、入力検証エラーなどによりjobを投入できなかった",
            ],
          ],
        },
      ],
    },
    {
      id: "configuration",
      title: "Config",
      description:
        "src/config/config.ts の設定を変更することでより柔軟に通知先、許可する通知元、ハンドラー、対象イベントなど構成できます。",
      blocks: [
        {
          type: "note",
          tone: "info",
          title: "環境変数による設定とConfigによる設定",
          body: "標準のsrc/config/config.tsは、利用者がコマンドだけで設定できるよう、あらかじめ決められた環境変数からConfigを生成します。アプリケーションが直接参照するのは生成後のConfigであり、この環境変数構成を必ず使う必要はありません。ただし、Webhook URLやpasswordなどの秘密値はコードへ直書きせず、Cloudflare Secretなど安全なbindingから受け取ることを推奨します。",
        },
        {
          type: "cards",
          columns: 2,
          items: [
            {
              title: "通知先を構成する",
              paragraphs: [
                "dispatch.channelsにDiscordまたはSlackのchannelを並べます。idはConfig内で一意にし、運用中は変更しないでください。enabledで有効・無効を切り替え、allowedSourcesでgithub・manual・systemのうち配送する通知元を選びます。allowedSourcesを省略するとすべて許可されます。",
              ],
              codeSamples: [
                { title: "Channel example", language: "typescript", code: channelConfigSample },
              ],
            },
            {
              title: "ハンドラーを構成する",
              paragraphs: [
                "handlers.github.allowedとhandlers.manual.allowedで受信を有効化します。GitHubはhandleEventTypesに処理するイベントを指定し、manualはpasswordでBearer認証を設定します。イベントタイプは70種類以上ありますが、events モジュールのテンプレートを使うと、よく使われるイベントの組み合わせを簡単に指定できます。",
              ],
              codeSamples: [
                { title: "Handler example", language: "typescript", code: handlerConfigSample },
              ],
            },
          ],
        },
        {
          type: "table",
          label: "その他のConfig項目",
          columns: ["項目", "説明", "標準値"],
          rows: [
            ["dispatch.timeout", "外部Webhook requestのtimeout（ミリ秒）", "5000"],
            [
              "dispatch.defaultRetryAfterMs",
              "rate limitの待機時間を取得できない場合の遅延（ミリ秒）",
              "60000",
            ],
            ["dispatch.reenqueueLimit", "applicationがjobをQueueへ再投入する上限", "3"],
            ["contents.maxCommitLines", "push通知に表示するcommit行数の上限", "15"],
            ["contents.maxWorkflowJobLines", "Workflow Job通知に表示する行数の上限", "10"],
          ],
        },
      ],
    },
    {
      id: "diagnostics",
      title: "確認とトラブルシューティング",
      description: "設定変更後はStatus、テスト通知、外部サービスの順に確認します。",
      blocks: [
        {
          type: "cards",
          columns: 2,
          items: [
            {
              title: "/statusを確認する",
              paragraphs: [
                "設定が不正でErrorがある場合、通知機能を停止します。Warningはセキュリティや無効なchannelに関する推奨事項で、動作に影響はありません。Secretとpasswordは設定の有無だけ、Webhook URLはマスクして表示されます。",
              ],
            },
            {
              title: "通知が届かない場合",
              paragraphs: [
                "handlerが有効か、channelがenabledか、allowedSourcesに通知元が含まれるか、Webhook URLが正しいかを確認します。GitHubではイベントがhandleEventTypesとGitHub側の選択の両方に含まれることも確認してください。",
              ],
            },
            {
              title: "HTTP errorを確認する",
              paragraphs: [
                "401はGitHub署名またはBearer token、400はheader・JSON・手動通知の入力、413はbodyサイズを確認します。Configがinvalidな場合、notifyエンドポイントは503を返します。",
              ],
            },
            {
              title: "Queueと配送を確認する",
              paragraphs: [
                "APIがqueued: trueを返した後の問題はCloudflareのWorker・Queueログを確認します。外部サービスのrate limit、一時障害、無効なWebhook URLでは再投入またはdropが記録されます。",
              ],
            },
          ],
        },
      ],
    },
  ];
}
