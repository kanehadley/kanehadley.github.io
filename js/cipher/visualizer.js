var cipher = (function (cipher) {
    'use strict';

    function CipherVisualizer (div, config) {
        var _lastAlphabet = 'abcdefghijklmnopqrstuvwxyz';
        var _container = d3.select(div);
        var _config = config;
        var _svg = _container.append('svg')
            .attr({
                width: _config.width,
                height: _config.height
            });

        _svg.append('rect').attr({
                x: 0,
                y: 0,
                width: _config.width,
                height: _config.height
            }).style({
                'fill': 'none',
                'stroke-width': 1,
                'stroke': 'black'
            });

        _svg.append('g').attr('id', 'ciphertracks');
        var _ciphers = [];


        this.addCipher = function (shift) {
            _ciphers.push(new cipher.Cipher(shift, _lastAlphabet));
            _lastAlphabet = this.encrypt(_lastAlphabet);
            this.render();
        };

        this.encrypt = function (message) {
            return _ciphers.reduce(function (message, cipher) {
                    return cipher.encrypt(message);
                }, message);
        };

        this.decrypt = function (message) {
            return _ciphers.reduce(function (message, cipher) {
                    return cipher.decrypt(message);
                }, message);
        };

        this.render = function () {
            var data = _ciphers.map(function (cipher) {
                return ['plaintext: ' + cipher.plaintext().join(''), 'ciphertext: ' + cipher.ciphertext().join('')];
            });

            var rects = _svg.select('g#ciphertracks').selectAll('rect').data(data);
            rects.exit().remove();
            rects.enter().append('rect');

            var trackHeight = 60;

            rects.attr({
                    x: 0,
                    y: function (d, i) {return i*trackHeight;},
                    width: _config.width,
                    height: trackHeight
                }).style({
                    'stroke': 'black',
                    'fill': 'none'
                });

            var texts = _svg.select('g#ciphertracks').selectAll('text').data(data);

            texts.exit().remove();
            texts.enter().append('text');
            //texts.html(function (d) {return d;});

            texts.attr({
                x: 0,
                y: function (d, i) {return i*trackHeight;},
                dy: trackHeight / 2
            });

            var tspans = texts.selectAll('tspan').data(function (d) {return d;});

            tspans.exit().remove();
            tspans.enter().append('tspan');


            tspans.attr({
                x: 0,
                dy: function (d, i) {return (trackHeight / 3);}
            }).text(function (d) {return d;});
        };
    }

    cipher.CipherVisualizer = CipherVisualizer;

    return cipher;
}) (cipher || {});
