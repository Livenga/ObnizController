let ObnizElems = (function(w, d) {
  return {
    servomotor: null
  };
}(window, document));


// コールバックイベント
let callbacks = (function(w, d) {
  /** ``` onClickObnizConnect
   * Obniz への接続
   * @param event
   */
  function onClickObnizConnect(event) {
    let f = d.forms['f_obniz'];

    if(f.id.value.length === 0) {
      console.log('Obniz ID 未入力');
      return;
    }

    if(w.obniz !== null) {
      throw 'Obniz は接続済み.';
    }

    try {
      w.obniz = new Obniz(f.id.value);
      // 自動接続
      w.obniz.options.auto_connect = d.forms.f_obniz.cbx_auto_connect.checked;
      this.disabled = true;
    } catch(except) {
      console.log(except);
    }
  } // '''

  //
  // ディスプレイ へのテキスト描画
  /** ``` onClickDisplayUpdate
   * @param event
   */
  function onClickDisplayUpdate(event) {
    if(w.obniz === null) {
      throw "Obniz に接続されていません."
    }

    let f = d.forms.obniz_display;

    try {
      w.obniz.display.clear();

      if(f.text.value.length === 0) {
        return;
      }

      w.obniz.display.print(f.text.value);
    } catch(except) {
      console.log('* onClickDisplayUpdate: ' + except);
    }
  } // '''

  /** ``` onInputRealTimeText
   * textarea@realtime_text に文字が入力されるたびに, 即時更新を行う.
   *
   * @param event
   */
  function onInputRealTimeText(e) {
    if(w.obniz === null) {
      throw "Obniz に接続されていません.";
    }

    try {
      let text = d.forms.obniz_display.realtime_text.value,
        lines = text.split('\n');

      w.obniz.display.clear();

      for(let i = 0; i < lines.length; ++i) {
        w.obniz.display.pos(0, i * 16);
        w.obniz.display.print(lines[i]);
      }
      //console.log(text.split('\n').length);
    } catch(except) {
      console.log('* onInputRealTimeText: ' + except);
    }
  } // '''

  /** ``` onClickLineUpdate
   * ディスプレイへのライン描画
   *
   * @param event
   */
  function onClickLineUpdate(event) {
    if(w.obniz === null) {
      throw "Obniz に接続されていません.";
    }

    let f = d.forms.obniz_line;

    if(f.is_clear.checked === true) {
      obniz.display.clear();
    }

    obniz.display.line(
      f.x0.value - 0, f.y0.value - 0,
      f.x1.value - 0, f.y1.value - 0
    );
  } // '''

  //
  // ディスプレイへの画像ファイルの描画
  /** ``` onChangeImageFile
   * @param event
   */
  function onChangeImageFile(event) {
    let f = event.target.files[0];
    let fr = new FileReader();

    fr.onloadend = function(e_loaded) {

      let cv  = d.getElementById('canvas');
      let ctx = cv.getContext('2d');
      let img = d.getElementById('loaded_image');

      img.onload = function(e_onload) {
        ctx.drawImage(img, 0, 0, this.width, this.height, 0, 0, 128, 64);
        let image_data = ctx.getImageData(0, 0, cv.width, cv.height);
        let pixs       = image_data.data;

        for(let i = 0; i < cv.height; ++i) {
          for(let j = 0; j < cv.width; ++j) {
            let o = i * cv.width + j;
            let r, g, b, gray;

            r = pixs[o * 4 + 0];
            g = pixs[o * 4 + 1];
            b = pixs[o * 4 + 2];

            gray = r * 0.3 + g * 0.59 + b * 0.11;
            gray = (gray > 0xFF) ? 0xFF : (gray < 0x00) ? 0 : gray;

            pixs[o * 4 + 0] = gray;
            pixs[o * 4 + 1] = gray;
            pixs[o * 4 + 2] = gray;
          }
        }

        ctx.clearRect(0, 0, cv.width, cv.height);
        ctx.putImageData(image_data, 0, 0);
      }
      img.src = e_loaded.target.result;
    }

    //fr.readAsText(f);
    fr.readAsDataURL(f);
  } // '''

  //
  // サーボモータ

  /** ``` onClickServoApply
   * @param event
   */
  function onClickServoApply(event) {
    let f = d.forms.obniz_servo;
    let pins = [
      f.pvcc.value    - 0,
      f.psignal.value - 0,
      f.pgnd.value    - 0
    ];

    pins.forEach(function(value, index, self) {
      if(index !== self.lastIndexOf(value)) {
        throw '重複した値(' + value + ')を検出.'
      }
    });

    try {
      ObnizElems.servomotor = w.obniz.wired(
        'ServoMotor',
        {
          vcc:    _f.pvcc.value    - 0,
          signal: _f.psignal.value - 0,
          gnd:    _f.pgnd.value    - 0
        }
      );
    } catch(except) {
      console.log('* onClickServoApply: ' + except);
      ObnizElems.servomotor = null;
    }
  } // '''

  /** ``` applyServoMotor
   * @param val 角度
   */
  function applyServoMotor(val) {
    if(ObnizElems.servomotor != null) {
      ObnizElems.servomotor.angle(val);
    }
  } // '''

  /** ``` onInputServoRange
   * @param event
   */
  function onInputServoRange(event) {
    let num = this.value - 0;

    if(num >= 0 && num <= 180) {
      d.forms.obniz_servo.angle_number.value = num;
    }
    applyServoMotor(num);
  } // '''

  /** ``` onInputServoNumber
   * @param event
   */
  function onInputServoNumber(event) {
    let num = this.value - 0;

    if(num >= 0 && num <= 180) {
      d.forms.obniz_servo.angle_range.value = num;
    }
    applyServoMotor(num);
  } // '''


  return {
    onClickObnizConnect:  onClickObnizConnect,
    onClickDisplayUpdate: onClickDisplayUpdate,
    onInputRealTimeText:  onInputRealTimeText,
    onClickLineUpdate:    onClickLineUpdate,
    onClickServoApply:    onClickServoApply,
    onInputServoRange:    onInputServoRange,
    onInputServoNumber:   onInputServoNumber,
    onChangeImageFile:    onChangeImageFile
  };
}(window, document));



function init(w, d) {
  d.getElementById('btn_connect')
    .addEventListener('click', callbacks.onClickObnizConnect);

  // ディスプレイ
  d.getElementById('btn_draw_text')
    .addEventListener('click', callbacks.onClickDisplayUpdate);
  d.forms.obniz_display.realtime_text
    .addEventListener('input', callbacks.onInputRealTimeText);

  // ディスプレイ line
  d.forms.obniz_line.run
    .addEventListener('click', callbacks.onClickLineUpdate);

  // サーボモータ
  d.getElementById('btn_servo_apply')
    .addEventListener('click', callbacks.onClickServoApply);

  d.forms.obniz_servo.angle_range
    .addEventListener('input', callbacks.onInputServoRange);

  d.forms.obniz_servo.angle_number
    .addEventListener('input', callbacks.onInputServoNumber);

  // 画像描画用 input[type = 'file']
  d.forms.canvas.file
    .addEventListener('change', callbacks.onChangeImageFile);
  d.forms.canvas.update
    .addEventListener('click', function(e) {
      if(w.hasOwnProperty('obniz') && w.obniz != null) {
        obniz.display.draw(d.getElementById('canvas').getContext('2d'));
      }
    });
}
