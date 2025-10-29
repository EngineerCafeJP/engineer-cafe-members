# エンジニアカフェ メンバー紹介・出勤カレンダー (MVP)

![Banner](https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6)

このリポジトリは、エンジニアカフェ（コワーキングスペース）のメンバー情報（プロフィール・役職・タグ・自己紹介）を多言語対応で表示し、出勤カレンダー（iCal入力想定）に対応した Vite + React のアプリです。翻訳は Gemini API を使ったスクリプトで自動化できます。

## 主要機能（現状の実装）

- メンバー一覧表示（`components/ProfileList.tsx` + `components/ProfileCard.tsx`）
  - 日本語/英語の自動切替（`react-i18next`）
  - 役職バッジ、プロフィール画像の表示（画像は `public/` 配下に配置して `/ファイル名` で参照）
  - 役職と自己紹介の間に「ハッシュタグ」列を表示（任意個数対応）

- メンバーデータ構造（`data/members.json`）
  - 多言語フィールド: `name.{ja,en}`, `role.{ja,en}`, `bio.{ja,en}`
  - タグの多言語対応: `tags.{ja,en}`（例: `ja: ["#AI駆動開発"], en: ["#AIDrivenDevelopment"]`）

- 翻訳スクリプト（`scripts/translate-members.ts`）
  - Gemini API を用いて `name/role/bio/tags` を日英相互翻訳
  - タグは「#」を維持し、英語は CamelCase に整形（末尾の `_`・空白を除去）。IoT/STEAM/StudyGroup などの簡易補正付き
  - 翻訳が不要でも、既存タグを後処理でクリーンアップ（整形）

- カレンダー表示（`components/CalendarView.tsx`）
  - ical.js で ICS をパースし、FullCalendar に表示
  - 月/週切替（`dayGridMonth` / `timeGridWeek`）をヘッダーで提供
  - ICS の `DTEND` を用いてイベントの終了時刻を反映（1時間固定ではない）
  - `VITE_ICAL_URL` 未設定時はモックデータで動作
  - 開発時は Vite プロキシで CORS を回避可能（`VITE_ICAL_UPSTREAM` + `VITE_ICAL_URL=/ical`）
  - スマホ縦画面の週ビューでヘッダーが重なる問題を CSS/表示短縮で解消

- クイックリンク（`components/QuickLinks.tsx`）
  - 相談予約ページ / イベントページへの外部リンクカードをトップに表示

## データモデル

`types.ts`

```ts
export interface Member {
   id: number;
   avatarUrl: string;           // 例: "/0f7a27e....webp"（public 配下）
   name: { ja: string; en: string };
   role: { ja: string; en: string };
   bio:  { ja: string; en: string };
   tags?: { ja: string[]; en: string[] }; // 任意
}
```

`data/members.json` の例（抜粋）

```json
{
   "id": 3,
   "avatarUrl": "/0f7a27edbeb950dbb7886d60a70fb456.webp",
   "name": { "ja": "寺田康佑", "en": "Kosuke Terada" },
   "role": { "ja": "コミュニティマネージャー", "en": "Community Manager" },
   "tags": {
      "ja": ["#AI駆動開発", "#未経験エンジニア", "#エンジニア起業"],
      "en": ["#AIDrivenDevelopment", "#BeginnerEngineer", "#EngineerStartup"]
   },
   "bio": {
      "ja": "...",
      "en": "..."
   }
}
```

## セットアップと起動

前提: Node.js（LTS 推奨）

1. 依存関係のインストール

```bash
npm install
```

1. 環境変数の設定（Gemini API）

- アプリ（ブラウザ側）からは `.env.local` の `GEMINI_API_KEY` を参照（`vite.config.ts` で `process.env.GEMINI_API_KEY` を埋め込み）
- 翻訳スクリプトは `API_KEY` を参照（`.env.local` に `API_KEY` を設定するか、実行時に環境変数で渡す）

`.env.local` の例:

```bash
GEMINI_API_KEY="YOUR_GEMINI_KEY"
API_KEY="YOUR_GEMINI_KEY"      # スクリプト実行を簡単にするため同じ値を設定しておくと便利
VITE_ICAL_URL="/sample.ics"    # 同一オリジンのICS。CORS問題を避けるには public/ 配下に置くのが安全

# 開発時に外部のICSを使いたい場合（CORS回避のためのViteプロキシ）
# 上流のICS URLを指定して、フロント側は VITE_ICAL_URL=/ical を使う
# VITE_ICAL_UPSTREAM="https://calendar.google.com/calendar/ical/.../basic.ics"
# VITE_ICAL_URL="/ical"
```

1. 開発サーバーの起動

```bash
npm run dev
```

## 翻訳スクリプトの使い方（多言語化 / タグ整形）

`data/members.json` の日本語側（`ja`）だけを編集して、英語側（`en`）が空・未設定のときに以下を実行すると、英語へ翻訳されます。タグも自動変換・整形されます。

```bash
# .env.local に API_KEY を設定してある場合
npx tsx scripts/translate-members.ts

# もしくは一時的に渡す
API_KEY="${GEMINI_API_KEY}" npx tsx scripts/translate-members.ts
```

注意:

- タグ整形は後処理でも適用されるため、既存の英語タグにも CamelCase 化や IoT/STEAM の補正がかかります。
- API 応答によっては稀に不自然な訳語が入る可能性があるため、レビューを推奨します。

## 画像の配置

プロフィール画像は `public/` 配下に置き、`avatarUrl` には `/ファイル名` で記述します。

```text
public/
   0f7a27edbeb950dbb7886d60a70fb456.webp
   8e885eebb2946dccad70c362375d08de.jpg
```

## 既知の注意事項（MVP）

- Tailwind CSS は PostCSS 経由でビルドに組み込み済み（CDN 不要）
- `CalendarView` は `VITE_ICAL_URL` 未設定時にモックデータで表示します。
- 外部 ICS を直接参照する場合は CORS を満たす必要があります。開発時は Vite のプロキシ（`/ical`）をご利用ください。
- 一部の ICS は `text/plain` を返す場合があります（パーサーは対応済み）。
- 役職色のマッピングは英語ラベル固定（`Community Manager` など）で行っています。

## 今後の課題（Backlog）

- Tailwind CSS をビルド時適用（PostCSS/CLI 導入）して本番最適化
- タグ辞書の拡張（既知の略語・固有名詞の補正ルールを整理し、設定ファイル化）
- タグクリックでの絞り込み（フィルタ UI）
- `members.json` のスキーマバリデーション（JSON Schema or Zod）
- 画像の最適化（サイズ/形式のガード、遅延読み込み）
- 翻訳スクリプトの差分検出強化（変更検知、部分翻訳、レート制御）
- 例外処理とログの強化（API エラー、タイムアウト時のリトライなど）
- E2E/ユニットテストの整備、CI での検証

---

何か不明点や追加したい要件があれば、Issue やタスクに起票してください。MVP としては現状で動作し、翻訳スクリプトも実運用可能なレベルまで整えてあります。
