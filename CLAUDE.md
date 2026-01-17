# Project Instructions

## 概要

「Bye Bye For You - X」は、X.com（旧Twitter）で「フォロー中」タブをデフォルトにし、「最新」順で表示するChrome拡張機能。

## プロジェクト構成

```
content.js     - メインのコンテンツスクリプト
content.css    - ドロップダウン非表示用CSS
manifest.json  - 拡張機能マニフェスト（v3）
package.json   - npmパッケージ設定
scripts/       - ビルドスクリプト
  set-name.js  - dev/prod名前切り替え
icons/         - 拡張機能アイコン
store/         - Chrome Web Store用アセット
```

## 開発ワークフロー

### 開発モード/本番モード切り替え

```bash
npm run dev:name   # [Dev] Bye Bye For You - X
npm run prod:name  # Bye Bye For You - X
```

### バージョン更新

以下の2ファイルを更新する：
- `manifest.json`
- `package.json`

## Chrome Web Store 公開フロー

- `main`ブランチにpushすると、GitHub Actions（`.github/workflows/publish.yml`）が自動的にChrome Web Storeに審査提出する
- 手動での審査提出は不要

## 対応言語

content.js内の`LANG_MAP`で定義：
- 日本語 (ja)
- English (en)
- Español (es)
- Français (fr)
- Português (pt)

## 主要な処理フロー

1. `waitForTabs()` - タブの読み込みを待機
2. `removeForYouAndSelectFollowing()` - 「おすすめ」タブを削除し「フォロー中」を選択
3. `clickSortDropdown()` → `selectLatestSort()` - 「最新」ソートを選択
4. `setupFollowingTab()` - ドロップダウンを無効化、タップでリフレッシュ機能を追加
5. `MutationObserver` - DOM変更を監視して継続的に処理
6. `popstate` イベント - SPAナビゲーション時の再処理
