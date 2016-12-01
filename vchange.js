'use strict'

const JsAudio = require('jsaudio')
const fs = require('fs')
const jspack = require('./jspack')
const sprintf = require('sprintfjs')

const CHANNELS = 1
const RATE = 16000
const CHUNK = 1024

//this is to use python's range() function
function range(start, stop, step) {
    if (typeof stop == 'undefined') {
        // one param defined
        stop = start;
        start = 0;
    }

    if (typeof step == 'undefined') {
        step = 1;
    }

    if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) {
        return [];
    }

    var result = [];
    for (var i = start; step > 0 ? i < stop : i > stop; i += step) {
        result.push(i);
    }

    return result;
};

function record(raw_file, record_seconds){
    var wstream = fs.createWriteStream(raw_file);
    for (var _ of range(0, int(RATE / CHUNK * record_seconds)){
    	data = stream.read(CHUNK)
        //asterisk?? node.js??
        // wstream.write(struct.pack('s' * CHUNK * 2, *data))
        wstream.write(struct.pack('s' * CHUNK * 2, data))
    }
    wstream.end();
    stream.stop_stream()
    stream.close()
    //p undefined
    p.terminate()
}

function extract_pitch(raw_file, pitch_file){
    // """ピッチパラメータの抽出"""
    cmd = sprintf("x2x +sf %s | pitch -a 1 -s 16 -p 80 > %s" ,raw_file, pitch_file)
    var exec = require('child_process').exec,
        child;
    child = exec(cmd, function (error, stdout, stderr) {})
}

function extract_mcep(raw_file, mcep_file){
    // """メルケプストラムパラメータの抽出"""
    cmd = sprintf("x2x +sf %s | frame -p 80 | window | mcep -m 25 -a 0.42 > %s" , raw_file, mcep_file)
    var exec = require('child_process').exec,
        child;
    child = exec(cmd, function (error, stdout, stderr) {})
}

function modify_pitch(m, pitch_file, mcep_file, raw_file){
    // """ピッチを変形して再合成
    // mが1より大きい => 低い声
    // mが1より小さい => 高い声"""
    var cmd = sprintf("sopr -m %f %s | excite -p 80 | mlsadf -m 25 -a 0.42 -p 80 %s | clip -y -32000 32000 | x2x +fs > %s" , m, pitch_file, mcep_file, raw_file)
    var exec = require('child_process').exec,
        child;
    child = exec(cmd, function (error, stdout, stderr) {})
}

function modify_speed(frame_shift, pitch_file, mcep_file, raw_file){
    // """話速を変形して再合成
    // frame_shiftが小さい => 早口
    // frame_shiftが大きい => ゆっくり"""
    var cmd = sprintf("excite -p %f %s | mlsadf -m 25 -a 0.42 -p %f %s | clip -y -32000 32000 | x2x +fs > %s" , frame_shift, pitch_file, frame_shift, mcep_file, raw_file)
    var exec = require('child_process').exec,
        child;
    child = exec(cmd, function (error, stdout, stderr) {});
}

function hoarse_voice(pitch_file, mcep_file, raw_file){
    // """ささやき声"""
    modify_pitch(0, pitch_file, mcep_file, raw_file)
}

function robot_voice(frame_period, record_seconds, mcep_file, raw_file){
    // """ロボット声
    // frame_periodが小さい => 低い
    // frame_periodが大きい => 高い"""
    var sequence_length = record_seconds * RATE * frame_period
    var cmd = sprintf("train -p %d -l %d | mlsadf -m 25 -a 0.42 -p 80 %s | clip -y -32000 32000 | x2x +fs > %s" , frame_period, sequence_length, mcep_file, raw_file)
    var exec = require('child_process').exec,
        child;
    child = exec(cmd, function (error, stdout, stderr) {});
}

function child_voice(pitch_file, mcep_file, raw_file){
    // """子供声"""
    var cmd = sprintf("sopr -m 0.4 %s | excite -p 80 | mlsadf -m 25 -a 0.1 -p 80 %s | clip -y -32000 32000 | x2x +fs > %s" , pitch_file, mcep_file, raw_file)
    var exec = require('child_process').exec,
        child;
    child = exec(cmd, function (error, stdout, stderr) {});
}


function deep_voice(pitch_file, mcep_file, raw_file){
    // """太い声"""
    var cmd = sprintf("sopr -m 2.0 %s | excite -p 80 | mlsadf -m 25 -a 0.6 -p 80 %s | clip -y -32000 32000 | x2x +fs > %s" , pitch_file, mcep_file, raw_file)
    var exec = require('child_process').exec,
        child;
    child = exec(cmd, function (error, stdout, stderr) {});
}

function raw2wav(raw_file, wav_file){
    cmd = sprintf("sox -e signed-integer -c %d -b 16 -r %d %s %s", CHANNELS, RATE, raw_file, wav_file)
    var exec = require('child_process').exec,
        child;
    child = exec(cmd, function (error, stdout, stderr) {});
}

function play(raw_file){
    // """rawファイルを再生"""
    const jsAudio = new JsAudio({sampleRate: 48000, bufferSize: 8192})
    jsAudio.openStream()
    jsAudio.startStream()
    fs.open(raw_file, 'r', function(status, fd) {
    	if (status) {
    		console.log(status.message);
    		return;
    	}
    	var buffer = new Buffer(CHUNK);
    	fs.read(fd, buffer, 0, CHUNK, 0, function(err, num) {
    		//todo
    		jsAudio.writeStream('').......
    	});

    });
    //これがやりたい
    // data = f.read(CHUNK)
    // while data != '':
    //     stream.write(data)
    //     data = f.read(CHUNK)

    jsAudio.stopStream()
    jsAudio.closeStream()
    jsAudio.terminate()

}


// todo: porting

// if __name__ == "__main__":
//     # 録音時間（固定）
//     record_seconds = 10

//     p = pyaudio.PyAudio()
//     stream = p.open(format=pyaudio.paInt16,
//                     channels=CHANNELS,
//                     rate=RATE,
//                     input=True,
//                     frames_per_buffer=CHUNK)

//     pitch_file = "temp.pitch"
//     mcep_file = "temp.mcep"
//     raw_file = "temp.raw"
//     output_file = "output.raw"

//     # オリジナルの音声を録音してrawファイルとして書き出し
//     print "*** Now recording ... (%d sec)" % record_seconds
//     record(raw_file, record_seconds)

//     # パラメータ抽出
//     print "*** extract pitch ..."
//     extract_pitch(raw_file, pitch_file)

//     print "*** extract mel cepstrum"
//     extract_mcep(raw_file, mcep_file)

//     # パラメータ変形いろいろ
//     print "*** modify parameters ..."

//     # どれか一つしか有効にできない
// #    modify_pitch(0.3, pitch_file, mcep_file, output_file)
// #    modify_speed(300, pitch_file, mcep_file, output_file)
// #    hoarse_voice(pitch_file, mcep_file, output_file)
// #    robot_voice(100, record_seconds, mcep_file, output_file)
// #    child_voice(pitch_file, mcep_file, output_file)
//     deep_voice(pitch_file, mcep_file, output_file)

//     # 変換した音声を再生
//     print "*** play!"
//     play("output.raw")

