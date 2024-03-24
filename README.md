# easy-web-midi-sequencer-template

# Demo
- [Demo](https://cat2151.github.io/easy-web-midi-sequencer-template/)
- 音を鳴らすには、Usageを参照ください

# Features
- webpageを開くだけでMIDI楽器を鳴らせます
- バックグラウンドでスロットリングされない
- ソースコードをテンプレートとして利用しやすい、小規模、シンプル、easyな構成

# Requirement
- Windows + loopMIDI + ブラウザ
    - 物理`Midi Device`を鳴らせる場合は、loopMIDIなしでもOK
    - 他の環境でも、`Midi Device`さえあれば利用可能な想定です
    - Chromeで動作確認しています

# Usage
- [loopMIDI](https://www.tobias-erichsen.de/software/loopmidi.html)のinstallと、port設定
    - portは一つ `+` ボタンで登録すれば十分です。
    - うまくいかない場合はOS再起動もお試しください。
- `MIDI楽器`の接続
    - [Shared Piano](https://musiclab.chromeexperiments.com/Shared-Piano/) など、`Web MIDI` を受信できるアプリを開いておきます
- 演奏
    - あとは[当アプリ](https://cat2151.github.io/easy-web-midi-sequencer-template/)を開くだけで演奏されます

# Installation
- `clone`のちソースを開いて`Live Server`を立ち上げる等で、すぐ改造できます

# Note
## pageを開くだけでMIDI楽器を鳴らせます
- `Web MIDI` の先頭portに `Note On` を送信します
    - [Shared Piano](https://musiclab.chromeexperiments.com/Shared-Piano/) を開いておけばすぐ音が出て確認できます
        - （Shared Pianoは `Web MIDI` を受信できます）

## バックグラウンドでスロットリングされない
- [Web Audio / Web MIDI にまつわる時間管理の話（３） - メトロノームからMBT時刻の取得まで](https://qiita.com/toyoshim/items/dd80295c12e6d02314d3) のコードを参考にしました。toyosim氏に感謝します。
- ときどきスロットリングされます。そのときは表にしばらく表示していると解決するようです。再現性不明。Chromeの仕様変更かもしれません。

## ソースコードをテンプレートとして利用しやすい、小規模、シンプル、easyな構成
- テンプレートとしてのソースコード利用を楽にすることを優先しています。

## MIDI OUTするだけなので、発音部分は別アプリ
- 逆を言えば、
    - `Midi Device` からの入力を受け付けるアプリ（`MIDI IN` のあるアプリ）なら、なんでも鳴らせます
        - 代表は [Shared Piano](https://musiclab.chromeexperiments.com/Shared-Piano/)

## 複数 `Midi Device` があったときは先頭決め打ちでMIDI出力する
- 以下は今後の課題です
    - ドロップダウンリストで選択（[Shared Piano](https://musiclab.chromeexperiments.com/Shared-Piano/)の `Midi Device` 設定のように）
    - 自動設定
        - 例えば当アプリを `seq_out` という識別子で識別として、それを含むportをデフォルトで設定する

## Experimental
- [Demo Experimental 開発中](https://cat2151.github.io/easy-web-midi-sequencer-template/experimental/)
- Web MIDI API未実装の環境によっては、postmate実行がされない等の不具合が発生します。それの確認用など。

## Experimental2
- [Demo Experimental2 開発中](https://cat2151.github.io/easy-web-midi-sequencer-template/experimental2/)
- Postmate + Tone.js という組み合わせで鳴ることの確認用。シンプルにとどめます。もしこれ以上機能追加する場合は別dirに切り分けて実施します。

## Experimental3
- [Demo Experimental3 開発中](https://cat2151.github.io/easy-web-midi-sequencer-template/experimental3/)
- Postmate + Tone.js + 疑似midimessage で鳴ることの確認用。シンプルにとどめます。もしこれ以上機能追加する場合は別dirに切り分けて実施します。

## Experimental4
- [Demo Experimental4 開発中](https://cat2151.github.io/easy-web-midi-sequencer-template/experimental4/)
- Postmate + Tone.js + 疑似midimessage + 簡易Seq で鳴ることの確認用。シンプルにとどめます。もしこれ以上機能追加する場合は別dirに切り分けて実施します。
- Experimental5の土台用。seq部分のみの実装。

## Experimental5
- [Demo Experimental5 開発中](https://cat2151.github.io/easy-web-midi-sequencer-template/experimental5/)
- Postmate + Tone.js + 疑似midimessage + 簡易Seq で鳴ることの確認用。シンプルにとどめます。もしこれ以上機能追加する場合は別dirに切り分けて実施します。
- Experimental4を土台に、実際に擬似midimessage送受信を実装。

## Experimental6
- [Demo Experimental6 開発中](https://cat2151.github.io/easy-web-midi-sequencer-template/experimental6/)
- Postmate + Tone.js + 疑似midimessage + 簡易Seq で鳴ることの確認用。シンプルにとどめます。もしこれ以上機能追加する場合は別dirに切り分けて実施します。
- 和音を鳴らせるようにしました。

## Experimental7
- [Demo Experimental7 開発中](https://cat2151.github.io/easy-web-midi-sequencer-template/experimental7/)
- Postmate + Tone.js + 疑似midimessage + 簡易Seq で鳴ることの確認用。シンプルにとどめます。もしこれ以上機能追加する場合は別dirに切り分けて実施します。
- 簡易的な曲データをJSONで入力できるようにしました。

## Experimental8
- [Demo Experimental8 開発中](https://cat2151.github.io/easy-web-midi-sequencer-template/experimental8/)
- Postmate + Tone.js + 疑似midimessage + 簡易Seq で鳴ることの確認用。シンプルにとどめます。もしこれ以上機能追加する場合は別dirに切り分けて実施します。
- Experimental7の課題であった発音タイミングのヨレやズレを、シンプル優先の範囲内でできるだけ改善しました。

## Experimental9
- [Demo Experimental9 開発中](https://cat2151.github.io/easy-web-midi-sequencer-template/experimental9/)
- Postmate + Tone.js + 疑似midimessage + 簡易仮想MIDIキーボード で鳴ることの確認用。シンプルにとどめます。もしこれ以上機能追加する場合は別dirに切り分けて実施します。
- iPadだけはplayボタン必須。それ以外はplayボタンなしで、mouseやtouchで音が鳴ります。

## Experimental10
- [Demo Experimental10 開発中](https://cat2151.github.io/easy-web-midi-sequencer-template/experimental10/)
- Postmate + Tone.js + 疑似midimessage + 簡易Seq + 簡易仮想Cutoffツマミ で鳴ることの確認用。シンプルにとどめます。もしこれ以上機能追加する場合は別dirに切り分けて実施します。
- knobをmouseやtouchでカットオフ周波数が変化します。

## Experimental11
- [Demo Experimental11 開発中](https://cat2151.github.io/easy-web-midi-sequencer-template/experimental11/)
- Postmate + Tone.js + 疑似midimessage + 簡易Seq で鳴ることの確認用。シンプルにとどめます。もしこれ以上機能追加する場合は別dirに切り分けて実施します。
- 16chのマルチティンバーシンセです。ch1,2,3が別の音色です。テンプレートで同時発音数12まで確認できます、それ以上もその場でtextareaに書けば確認できるかもしれません。

## Experimental12
- [Demo Experimental12 開発中](https://cat2151.github.io/easy-web-midi-sequencer-template/experimental12/)
- Postmate + Tone.js + 疑似MIDImessage + 簡易Seq + 簡易MIDIfilter で鳴ることの確認用。シンプルにとどめます。もしこれ以上機能追加する場合は別dirに切り分けて実施します。
- 簡易MIDIfilterをseqとsynthの間に挟み込んで、単音を3和音に変換します。また、parent1つに対してchild2つを接続しています。

## Experimental13
- [Demo Experimental13 開発中](https://cat2151.github.io/easy-web-midi-sequencer-template/experimental13/)
- Postmate + Tone.js + 疑似MIDImessage + 簡易Seq で鳴ることの確認用。シンプルにとどめます。もしこれ以上機能追加する場合は別dirに切り分けて実施します。
- seq + synth。URL引数次第で、以下の4つそれぞれの動作をするサンプルです。「postMessageを使わないスタンドアロンpage」「parentが、自分と同一pageをchild synthとして呼び出すpage」「URL引数によってparent seqになるpage」「URL引数によってchild synthになるpage」

## Experimental14
- [Demo Experimental14 開発中](https://cat2151.github.io/easy-web-midi-sequencer-template/experimental14/)
- Postmate + Tone.js + 疑似MIDImessage + 簡易Seq で鳴ることの確認用。シンプルにとどめます。もしこれ以上機能追加する場合は別dirに切り分けて実施します。
- seq + synth。seqがchildで、synthもchildの場合のサンプルです。

## Experimental15
- [Demo Experimental15 開発中](https://cat2151.github.io/easy-web-midi-sequencer-template/experimental15/)
- Postmate + Tone.js + 疑似MIDImessage + 簡易Seq で鳴ることの確認用。シンプルにとどめます。もしこれ以上機能追加する場合は別dirに切り分けて実施します。
- seq1 + seq2 + synth。複数のseqを同時に鳴らすサンプルです。

## Experimental16
- [Demo Experimental16 開発中](https://cat2151.github.io/easy-web-midi-sequencer-template/experimental16/)
- Postmate + Tone.js + 疑似MIDImessage + 簡易Seq で鳴ることの確認用。シンプルにとどめます。もしこれ以上機能追加する場合は別dirに切り分けて実施します。
- seq1 + seq2 + sampler。URL指定でsamplerを鳴らすのと、audioをゼロからFloat32Arrayにレンダリングしてsamplerで鳴らすサンプルです。

## Experimental17
- [Demo Experimental17 開発中](https://cat2151.github.io/easy-web-midi-sequencer-template/experimental17/)
- Postmate + Tone.js + 疑似MIDImessage + 簡易Seq で鳴ることの確認用。シンプルにとどめます。もしこれ以上機能追加する場合は別dirに切り分けて実施します。
- seq + tone generator + sampler。audioをゼロからFloat32Arrayにレンダリングしたものを、別pageのsamplerに通信で転送して鳴らすサンプルです。

## Experimental18
- [Demo Experimental18 開発中](https://cat2151.github.io/easy-web-midi-sequencer-template/experimental18/)
- Postmate + Tone.js + 疑似MIDImessage + 簡易Seq で鳴ることの確認用。シンプルにとどめます。もしこれ以上機能追加する場合は別dirに切り分けて実施します。
- seq + tone generator + sampler。audioをゼロからFloat32Arrayにレンダリングしたものを、別pageのsamplerに通信で転送して鳴らすサンプルです。
- Tone.jsの演奏そのものをOfflineContextでプリレンダリングするサンプルです。
- Tone.jsのdefault contextをそのままにして、すべてのsynth等のコンストラクタに明示的にcontextを指定する場合のサンプルです。（default contextを変更するサンプルは、切り分けて別途やります）

## 当projectが目指すこと
- `MIDI OUT` する
- webpageを開くだけで演奏開始する
- 連続的に `Note On` を送信する
- シンプルで利用しやすいソースコードにする
- 演奏規模は最低限にする、例えばド、ミ、ソのランダムフレーズ
- 鳴らなくなったら、できるだけ鳴るように行動することを優先します

## 当projectが目指さないこと
- `Web MIDI` 未対応ブラウザや、`Midi Device`を検出しなかった場合に、`Web Audio`で代替の音を鳴らす方法の検討と実装と提供
- `Web MIDI` 未対応ブラウザの調査と対応
- webpageを開くだけで `Note On` 送信開始してよいものか？ユーザー操作を待つことを必須にするか？お作法は？などの調査と考察
- スロットリング問題の調査と解決
- `Note On` 以外の `MIDIメッセージ` の送信サンプル
- `和音`を鳴らす、ch.1だけでなくch.2～ch.16で鳴らす、複数MIDI portを利用して`32ch.演奏`する、その他
- `豊富なDemo Songs`、別のフレーズにする、フレーズを洗練する、その他
- 鳴らす楽曲データをtextarea等から`edit`可能にする
- `スタンダードMIDIファイル`を鳴らす
- `MML`を鳴らす
- `コード進行`を鳴らす（[chord2mml](https://github.com/cat2151/chord2mml)で生成 ）
- その他、各種音楽ファイルを鳴らす
