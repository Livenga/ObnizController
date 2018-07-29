let ObnizElems = (function(w, d) {
  return {
    servomotor: null
  };
}(window, document));


let events = (function(w, d) {
  //
  function _onclick_obniz_connect(e) {
    let f = d.forms['f_obniz'];

    if(f === undefined) {
      return;
    }

    if(f.id.value.length === 0) {
      console.log('Obniz ID 未入力');
      return;
    }

    try {
      w.obniz = new Obniz(f.id.value);

      // 自動接続
      w.obniz.options.auto_connect = d.forms.f_obniz.cbx_auto_connect.checked;
    } catch(except) {
      console.log(except);
    }
  }

  //
  function _onchange_auto_connect(e) {
    if(w.obniz === undefined || w.obniz === null) {
      return;
    }

    w.obniz.options.auto_connect = this.checked;
  }

  //
  // ディスプレイ
  //

  function _onclick_display_update(e) {
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
  }

  function _oninput_display_realtime(e) {
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
      console.log('* onInputDisplayRealTime: ' + except);
    }
  }

  // line
  function _onclick_display_line_update(e) {
    let f = d.forms.obniz_line;

    if(f.is_clear.checked === true) {
      obniz.display.clear();
    }

    obniz.display.line(
      f.x0.value - 0, f.y0.value - 0,
      f.x1.value - 0, f.y1.value - 0
    );
  }

  //
  // サーボモータ
  //

  //
  function _onclick_servo_apply(e) {
    let _f = d.forms.obniz_servo;
    let pins = [
      _f.pvcc.value    - 0,
      _f.psignal.value - 0,
      _f.pgnd.value    - 0
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
  }

  //
  function _oninput_servo_range(e) {
    let num = this.value - 0;

    if(num >= 0 && num <= 180) {
      d.forms.obniz_servo.angle_number.value = num;
    }
  }

  function _oninput_servo_number(e) {
    let num = this.value - 0;

    if(num >= 0 && num <= 180) {
      d.forms.obniz_servo.angle_range.value = num;
    }
  }

  function _onchange_image_file(e) {
    let f = e.target.files[0];
    let fr = new FileReader();

    fr.onloadend = function(e_loaded) {
      //console.log(e_loaded);

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

  }

  return {
    onClickObnizConnect:      _onclick_obniz_connect,
    onChangeAutoConnect:      _onchange_auto_connect,
    onClickDisplayUpdate:     _onclick_display_update,
    onInputDisplayRealTime:   _oninput_display_realtime,
    onClickDisplayLineUpdate: _onclick_display_line_update,
    onClickServoApply:        _onclick_servo_apply,
    onInputServoRange:        _oninput_servo_range,
    onInputServoNumber:       _oninput_servo_number,
    onChangeImageFile:        _onchange_image_file
  };
}(window, document));



function init(w, d) {
  d.getElementById('btn_connect')
    .addEventListener('click', events.onClickObnizConnect);

  d.getElementById('cbx_auto_connect')
    .addEventListener('change', events.onChangeAutoConnect);


  // ディスプレイ
  d.getElementById('btn_draw_text')
    .addEventListener('click', events.onClickDisplayUpdate);
  d.forms.obniz_display.realtime_text
    .addEventListener('input', events.onInputDisplayRealTime);

  // ディスプレイ line
  d.forms.obniz_line.run
    .addEventListener('click', events.onClickDisplayLineUpdate);


  // サーボモータ
  d.getElementById('btn_servo_apply')
    .addEventListener('click', events.onClickServoApply);

  d.forms.obniz_servo.angle_range
    .addEventListener('input', events.onInputServoRange);

  d.forms.obniz_servo.angle_number
    .addEventListener('input', events.onInputServoNumber);

  //
  d.forms.canvas.file
    .addEventListener('change', events.onChangeImageFile);
  d.forms.canvas.update
    .addEventListener('click', function(e) {
      if(w.hasOwnProperty('obniz') && w.obniz != null) {
        obniz.display.draw(d.getElementById('canvas').getContext('2d'));
      }
    });
}
