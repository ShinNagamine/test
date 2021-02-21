//##############################################################################
//
// script.js
//
// スクリプトファイル
//
//##############################################################################

//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
//
// 定数
//
//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
// SkyWay APIキー
const API_KEY = "4bc300c2-d192-4bfa-aa15-45bfb80d6c1d";


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
//
// グローバルオブジェクト
//
//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
// ビデオオブジェクト
const _localVideo = $('#localVideo')[0];
const _remoteVideo = $('#remoteVideo')[0];


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
//
// グローバル変数
//
//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■

let _peer = null;
let _conn = null;


//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
//
// メソッド
//
//■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
$(function() {
	// イベントリスナー追加
	addEventListeners();

	// peerオブジェクト作成
	_peer = new Peer({key: API_KEY});

	//++++++++++++++++++++++
	// peerオープン時
	//++++++++++++++++++++++
	_peer.on('open', function(id) {
		// 自身ID表示
		$('#localIdLabel').html(id);
	});

	//++++++++++++++++++++++
	// peer接続時
	//++++++++++++++++++++++
	_peer.on('connection', function(conn) {
		// グローバル変数にセット
		_conn = conn;

		$('#status').html("Connected with " + conn.peer);

		// メッセージ受信イベントリスナー追加
		addReceiveMessageEventListener();
	});


	//++++++++++++++++++++++
	// ビデオ着信時
	//++++++++++++++++++++++
	_peer.on('call', function(call) {
alert("ビデオ着信");
		navigator.mediaDevices.getUserMedia(
			{
				video : true,
				audio : true
			})
			.then(function (stream) {
alert(stream);
				// カメラ映像、オーディオへのアクセスが成功した場合
				// カメラ映像を相手に送信
//				$('#localVideo').attr('src', stream);
				$('#localVideo')[0].srcObject = stream;

				call.answer(stream);
				call.on('stream', function(stream) {
					// ストリーミングデータ受信処理
//					$('#remoteVideo').attr('src', stream);
					$('#remoteVideo')[0].srcObject = stream;
				});
			}).catch(function (err) {
				console.log(err);
			});
		});
	});


/**
 * イベントリスナーを追加する。
 */
function addEventListeners() {
	// [接続]ボタンクリックイベント
	$('#connectBtn').click(function() {
		_conn = _peer.connect(getRemoteId());

		if (_conn && _conn.open) {
			$('#status').html("Connected with " + getRemoteId());
		}

		// メッセージ受信イベントリスナー追加
		addReceiveMessageEventListener();
	});

	// [ビデオ接続]ボタンクリックイベント
	$('#videoConnectBtn').click(function() {
alert("ビデオ接続開始");
		navigator.mediaDevices.getUserMedia(
			{
				video : true,
				audio : true
			})
			.then(function (stream) {
alert(stream);
				// カメラ映像、オーディオへのアクセスが成功した場合
				// カメラ映像を相手に送信
//				$('#localVideo').attr('src', stream);
				$('#localVideo')[0].srcObject = stream;

				let call = _peer.call(getRemoteId(), stream);
				if (call != null) {
					call.on('stream', function(stream) {
						// ストリーミングデータ受信処理
//						$('#remoteVideo').attr('src', stream);
						$('#remoteVideo')[0].srcObject = stream;
					});
				}
			}).catch(function(err) {
				console.log(err);
			});
	});




	// [送信]ボタンクリックイベント
	$('#sendBtn').click(function() {
		if (_conn && _conn.open) {
			// メッセージ送信
			_conn.send($('#sMsg').val());

			// ログ出力
			console.log("Sent message: " + $('#sMsg').val());
		}
	});
}

/**
 * メッセージ受信イベントリスナーを追加する。
 */
function addReceiveMessageEventListener() {
	//++++++++++++++++++++++++++
	// コネクションオープン時
	//++++++++++++++++++++++++++
	_conn.on('open', function() {
		// メッセージ受信時
		_conn.on('data', function(data) {
			// 受信メッセージ出力
			addMessage(data);

			// ログ出力
			console.log("Received message: " + data);
		});
	});
}

/**
 * メッセージを追加する。
 *
 * @param {String} msg: メッセージ
 */
function addMessage(msg) {
	const $p = $('<p>');
	const $timeLabel = $('<span>').addClass('msg-time').html(getCurrentTime()).appendTo($p);
	const $msgLabel = $('<span>').html(" - " + msg).appendTo($p);
	$('#rMsg').append($p);
};

/**
 * メッセージをクリアする。
 */
function clearMessages() {
	$('#rMsg').html("");
	addMessage("メッセージクリア");
};

/**
 * 現在時刻を "hh:mm:ss" として返す。
 *
 * @return {String}: 現在時刻
 */
function getCurrentTime() {
	const now = new Date();
	const h = ("0" + now.getHours()).slice(-2);
	const m = ("0" + now.getMinutes()).slice(-2);
	const s = ("0" + now.getSeconds()).slice(-2);
	return (h + ":" + m + ":" + s);
}

/**
 * 接続先ID(テキストボックス入力値)を取得する。
 *
 * @return {String}: 接続先ID
 */
function getRemoteId() {
	return $('#remoteIdTextbox').val();
}