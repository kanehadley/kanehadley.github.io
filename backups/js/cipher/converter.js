var cipher = (function (cipher) {

    function Cipher (shift, alphabet) {
        var _shift;
        var _alphabet = (alphabet || 'abcdefghijklmnopqrstuvwxyz').split('');

        var _shiftedAlphabet = _alphabet.slice(shift).concat(_alphabet.slice(0, shift));

        var _encryptMapping = {};
        var _decryptMapping = {};

        _alphabet.forEach(function (letter, index) {
            _encryptMapping[letter] = _shiftedAlphabet[index];
            _decryptMapping[_shiftedAlphabet[index]] = letter;
        });

        function encrypt (message) {
            return message.split('').map(function (letter) {
                return _encryptMapping[letter] || letter;
            }).join('');
        }

        function decrypt (message) {
            return message.split('').map(function (letter) {
                return _decryptMapping[letter] || letter;
            }).join('');
        }

        function plaintext () { return _alphabet; }
        function ciphertext () { return _shiftedAlphabet; }

        this.encrypt = encrypt;
        this.decrypt = decrypt;
        this.plaintext = plaintext;
        this.ciphertext = ciphertext;
    }

    cipher.Cipher = Cipher;

    return cipher;
}) (cipher || {});
