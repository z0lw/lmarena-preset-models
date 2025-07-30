# LMArena Default Model Selector

LMArenaのside-by-sideモードでデフォルトモデルを自動選択するFirefox拡張機能

## 概要

[LMArena](https://lmarena.ai/?mode=side-by-side)でモデルを比較する際に、毎回手動でモデルを選択する手間を省きます。お気に入りのモデルを事前に設定しておけば、ページを開くだけで自動的に選択されます。

## インストール方法

### Firefox Add-onsストアから（推奨）
近日公開予定

### 開発者モード
1. Firefoxで `about:debugging` を開く
2. 左側の「このFirefox」をクリック
3. 「一時的なアドオンを読み込む」をクリック
4. `lmarena-preset-models`フォルダ内の`manifest.json`を選択

## 使い方

1. ツールバーの拡張機能アイコンをクリック
2. 比較したいモデル名を入力
   - **Model 1**: 左側に表示するモデル
   - **Model 2**: 右側に表示するモデル
3. 「Save Preferences」をクリック
4. [LMArena Side-by-Side](https://lmarena.ai/?mode=side-by-side)にアクセス
5. 自動的に設定したモデルが選択されます

## 対応モデル例

モデル名の一部を入力するだけでOK：
- `gpt-4` → gpt-4o-2024-11-20
- `claude-3-5` → claude-3-5-sonnet-20241022
- `gemini` → gemini-2.5-pro
- `o3` → o3-2025-04-16

## 機能

- 🚀 自動モデル選択
- 💾 設定の永続保存
- 🔄 ページ遷移に対応
- ⌨️ デバッグ用ショートカット（Ctrl+Shift+M）

## トラブルシューティング

- モデルが選択されない場合は、F12でコンソールを確認
- 手動で再実行するには Ctrl+Shift+M を押す
- モデル名は部分一致で検索されます

## プライバシー

この拡張機能は：
- ✅ ローカルストレージのみ使用
- ✅ 外部サーバーへの通信なし
- ✅ 個人情報の収集なし