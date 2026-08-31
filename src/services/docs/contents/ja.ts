import type { DocsLocale, DocsPageModel, DocsSectionModel } from "../types";
import {
  cloneCommands,
  deployCommands,
  githubSettings,
  manualCurl,
  queueCommands,
  secretCommands,
} from "./common";

export function japaneseDocs(baseUrl: string, locale: DocsLocale): DocsPageModel {
  return {
    locale,
    title: "Documentation",
    introduction:
      "GitHub Notifier をデプロイし、通知先と GitHub Webhook を設定して、動作を確認するためのガイドです。",
    baseUrlLabel: "このデプロイの Base URL",
    baseUrl,
    contentsLabel: "目次",
    statusLinkLabel: "Status を開く",
    sections: japaneseSections(baseUrl),
  };
}

function japaneseSections(baseUrl: string): DocsSectionModel[] {
  return [
    {
      id: "overview",
      title: "概要",
      description: "このアプリケーションが公開する画面とエンドポイントです。",
      blocks: [
        {
          type: "table",
          label: "エンドポイント一覧",
          columns: ["パス", "用途"],
          rows: [
            ["GET /docs", "デプロイ・設定・利用方法を確認するドキュメント"],
            ["GET /status", "Config の状態、エラー、警告を確認する画面"],
            ["POST /notify/github", "GitHub Webhook の受信先"],
            ["POST /notify/manual", "JSON から手動通知を送信するAPI"],
            ["POST /notify/", "JSON から手動通知を送信するAPI（/notify/manual のエイリアス）"],
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
                "リポジトリを clone します。独自の設定や通知処理を管理したい場合は、先に fork してください。",
              ],
              codeSamples: [{ title: "Clone and install", language: "bash", code: cloneCommands }],
            },
            {
              title: "通知キューを作成する",
              paragraphs: ["wrangler.jsonc が参照する Cloudflare Queue を作成します。"],
              codeSamples: [{ title: "Create queue", language: "bash", code: queueCommands }],
            },
            {
              title: "Secrets を登録する",
              paragraphs: [
                "Discord の通知先を登録します。GitHub・手動通知ハンドラーの認証情報は任意ですが、設定を推奨します。コマンド実行後に各値を入力してください。",
              ],
              codeSamples: [{ title: "Configure secrets", language: "bash", code: secretCommands }],
            },
            {
              title: "デプロイする",
              paragraphs: ["Worker をデプロイし、表示された URL を控えます。"],
              codeSamples: [{ title: "Deploy", language: "bash", code: deployCommands }],
            },
            {
              title: "設定を確認する",
              paragraphs: [
                `デプロイ後に ${baseUrl}/status を開きます。エラーがある間も docs と status は利用できますが、notify は利用できません。`,
              ],
            },
          ],
        },
      ],
    },
    {
      id: "configuration",
      title: "設定",
      description:
        "通常は環境変数だけで開始でき、高度な設定は src/config/config.ts で変更できます。",
      blocks: [
        {
          type: "table",
          label: "環境変数",
          columns: ["変数", "説明"],
          rows: [
            ["DISCORD_WEBHOOK_URL_1 … 5", "Discord の通知先。未設定の番号は無効になります。"],
            ["SLACK_WEBHOOK_URL_1 … 5", "Slack の通知先。未設定の番号は無効になります。"],
            [
              "GITHUB_WEBHOOK_SECRET",
              "任意。設定すると、GitHub Webhook に正しい署名が必要になります。",
            ],
            [
              "MANUAL_NOTIFICATION_PASSWORD",
              "任意。設定すると、手動通知に一致する Bearer token が必要になります。",
            ],
          ],
        },
        {
          type: "cards",
          columns: 2,
          items: [
            {
              title: "通知先と許可ソース",
              paragraphs: [
                "dispatch.channels で通知先の有効・無効、Webhook URL、github・manual・system の許可を設定します。allowedSources を省略した場合はすべて許可されます。",
              ],
            },
            {
              title: "ハンドラーと通知内容",
              paragraphs: [
                "handlers で GitHub・手動通知の有効化と認証情報を設定します。contents ではコミットや Workflow Job の表示行数を調整できます。",
              ],
            },
          ],
        },
        {
          type: "note",
          tone: "info",
          title: "Config の検証",
          body: "Config は起動時に解決・検証されます。問題の詳細と修正方法は /status に表示されます。",
        },
      ],
    },
    {
      id: "github-webhook",
      title: "GitHub Webhook",
      description: "GitHub repository から Worker へイベントを送信します。",
      blocks: [
        {
          type: "cards",
          items: [
            {
              title: "Webhook を追加する",
              paragraphs: [
                "GitHub の Repository settings → Webhooks → Add webhook を開きます。Worker に GITHUB_WEBHOOK_SECRET を設定した場合は、GitHub 側の Secret にも同じ値を入力します。未設定の場合は署名を検証せず、Warning が表示されます。",
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
                "GitHub 側で送信するイベントを選び、handlers.github.handleEventTypes にも処理対象を設定します。サポート外のイベントは通知せずに無視されます。",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "manual-notification",
      title: "手動通知",
      description: "CI や運用スクリプトから任意のメッセージを通知できます。",
      blocks: [
        {
          type: "cards",
          items: [
            {
              title: "通知を送信する",
              paragraphs: [
                "MANUAL_NOTIFICATION_PASSWORD を設定した場合は Bearer token として指定し、未設定の場合は Authorization header を省略します。message は必須です。title は省略できます。レスポンスの queued が false の場合、manual を許可する有効な通知先がありません。",
              ],
              codeSamples: [
                { title: "Send a test notification", language: "bash", code: manualCurl(baseUrl) },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "diagnostics",
      title: "確認とトラブルシューティング",
      description: "通知を送る前に、Config と各サービスの状態を確認します。",
      blocks: [
        {
          type: "cards",
          columns: 2,
          items: [
            {
              title: "/status を確認する",
              paragraphs: [
                "Error は notify を停止します。Warning は推奨事項であり、Config 自体は valid のままです。Secret、password、Webhook URL の実値は画面上で公開されません。",
              ],
            },
            {
              title: "通知が届かない場合",
              paragraphs: [
                "channel が enabled か、Webhook URL が正しいか、通知元が allowedSources に含まれるかを確認します。GitHub 通知では event type の設定も確認してください。",
              ],
            },
          ],
        },
      ],
    },
  ];
}
