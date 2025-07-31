# LMArena Default Model Selector

LMArenaでデフォルトモデルを自動選択するFirefox拡張機能

## 概要

[LMArena](https://lmarena.ai/)でモデルを使用する際に、毎回手動でモデルを選択する手間を省きます。お気に入りのモデルを事前に設定しておけば、ページを開くだけで自動的に選択されます。

### 対応モード
- **Side-by-Side**: 2つのモデルを比較
- **Direct Chat**: 1つのモデルと対話
- **Search Mode**: 検索特化モデルを自動検出して適用

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
2. 使用したいモデル名を入力
   - **通常モード**
     - **Model 1**: 左側/Direct Chatで使用するモデル
     - **Model 2**: 右側に表示するモデル（Side-by-Sideのみ）
   - **検索モード**（自動検出）
     - **Search Model 1**: 検索用モデル1
     - **Search Model 2**: 検索用モデル2
3. 「Save Preferences」をクリック
4. LMArenaにアクセスすると自動的に設定したモデルが選択されます

## 対応モデル例

### 通常モード
モデル名の一部を入力するだけでOK：
- `o3-2025` → o3-2025-04-16
- `gemini-2.5` → gemini-2.5-pro
- `claude-3-5` → claude-3-5-sonnet-20241022
- `gpt-4` → gpt-4o-2024-11-20

### 検索モード
- `o3-search`
- `gemini-2.5-pro-grounding`
- `claude-opus-4-search`
- `ppl-sonar-reasoning-pro-high`

## 機能

- 🚀 自動モデル選択
- 🎯 モード別の設定（通常/検索）
- 💾 設定の永続保存
- 🔄 ページ遷移に対応
- ⚡ 高速動作（待機時間を最適化）
- 🛡️ モード選択ドロップダウンの誤クリック防止
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