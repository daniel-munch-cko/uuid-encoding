/**
 * @version 1.0.6600.26712
 * @copyright ${AuthorCopyright}
 * @compiler Bridge.NET 16.7.0
 */
Bridge.assembly("uuid-encoding.js", function ($asm, globals) {
    "use strict";

    (function () {
        var uuid_encoding = { };
        Bridge.define("Base32Guid", {
            $metadata : function () { return {"att":1048577,"a":2,"m":[{"a":2,"isSynthetic":true,"n":".ctor","t":1,"sn":"ctor"},{"a":2,"n":"Create","is":true,"t":8,"sn":"Create","rt":System.String}]}; },
            $scope: uuid_encoding,
            statics: {
                methods: {
                    Create: function () {
                        return uuid_encoding.uuid_encoding.Base32.Encode(System.Guid.newGuid().toByteArray());
                    }
                }
            }
        });

        Bridge.define("uuid_encoding.Base32", {
            $metadata : function () { return {"att":385,"a":2,"s":true,"m":[{"n":".cctor","t":1,"sn":"ctor","sm":true},{"a":2,"n":"Decode","is":true,"t":8,"pi":[{"n":"encoded","pt":System.String,"ps":0}],"sn":"Decode","rt":System.Array.type(System.Byte),"p":[System.String]},{"a":2,"n":"Encode","is":true,"t":8,"pi":[{"n":"data","pt":System.Array.type(System.Byte),"ps":0},{"n":"padOutput","dv":false,"o":true,"pt":System.Boolean,"ps":1}],"sn":"Encode","rt":System.String,"p":[System.Array.type(System.Byte),System.Boolean]},{"a":1,"n":"numberOfTrailingZeros","is":true,"t":8,"pi":[{"n":"i","pt":System.Int32,"ps":0}],"sn":"numberOfTrailingZeros","rt":System.Int32,"p":[System.Int32],"box":function ($v) { return Bridge.box($v, System.Int32);}},{"a":1,"n":"CHAR_MAP","is":true,"t":4,"rt":System.Collections.Generic.Dictionary$2(System.Char,System.Int32),"sn":"CHAR_MAP"},{"a":1,"n":"DIGITS","is":true,"t":4,"rt":System.Array.type(System.Char),"sn":"DIGITS","ro":true},{"a":1,"n":"MASK","is":true,"t":4,"rt":System.Int32,"sn":"MASK","ro":true,"box":function ($v) { return Bridge.box($v, System.Int32);}},{"a":1,"n":"SEPARATOR","is":true,"t":4,"rt":System.String,"sn":"SEPARATOR"},{"a":1,"n":"SHIFT","is":true,"t":4,"rt":System.Int32,"sn":"SHIFT","ro":true,"box":function ($v) { return Bridge.box($v, System.Int32);}}]}; },
            $scope: uuid_encoding,
            statics: {
                fields: {
                    DIGITS: null,
                    MASK: 0,
                    SHIFT: 0,
                    CHAR_MAP: null,
                    SEPARATOR: null
                },
                ctors: {
                    init: function () {
                        this.CHAR_MAP = new (System.Collections.Generic.Dictionary$2(System.Char,System.Int32))();
                        this.SEPARATOR = "-";
                    },
                    ctor: function () {
                        var $t;
                        uuid_encoding.uuid_encoding.Base32.DIGITS = ($t = ("ABCDEFGHIJKLMNOPQRSTUVWXYZ234567").toLowerCase(), System.String.toCharArray($t, 0, $t.length));
                        uuid_encoding.uuid_encoding.Base32.MASK = (uuid_encoding.uuid_encoding.Base32.DIGITS.length - 1) | 0;
                        uuid_encoding.uuid_encoding.Base32.SHIFT = uuid_encoding.uuid_encoding.Base32.numberOfTrailingZeros(uuid_encoding.uuid_encoding.Base32.DIGITS.length);
                        for (var i = 0; i < uuid_encoding.uuid_encoding.Base32.DIGITS.length; i = (i + 1) | 0) {
                            uuid_encoding.uuid_encoding.Base32.CHAR_MAP.set(uuid_encoding.uuid_encoding.Base32.DIGITS[System.Array.index(i, uuid_encoding.uuid_encoding.Base32.DIGITS)], i);
                        }
                    }
                },
                methods: {
                    numberOfTrailingZeros: function (i) {
                        // HD, Figure 5-14
                        var y;
                        if (i === 0) {
                            return 32;
                        }
                        var n = 31;
                        y = i << 16;
                        if (y !== 0) {
                            n = (n - 16) | 0;
                            i = y;
                        }
                        y = i << 8;
                        if (y !== 0) {
                            n = (n - 8) | 0;
                            i = y;
                        }
                        y = i << 4;
                        if (y !== 0) {
                            n = (n - 4) | 0;
                            i = y;
                        }
                        y = i << 2;
                        if (y !== 0) {
                            n = (n - 2) | 0;
                            i = y;
                        }
                        return ((n - ((((((i << 1)) >>> 0) >>> 31)) | 0)) | 0);
                    },
                    Decode: function (encoded) {
                        var $t;
                        // Remove whitespace and separators
                        encoded = System.String.replaceAll(encoded.trim(), uuid_encoding.uuid_encoding.Base32.SEPARATOR, "");

                        // Remove padding. Note: the padding is used as hint to determine how many
                        // bits to decode from the last incomplete chunk (which is commented out
                        // below, so this may have been wrong to start with).
                        encoded = System.Text.RegularExpressions.Regex.replace(encoded, "[=]*$", "");

                        // Canonicalize to all upper case
                        encoded = encoded.toLowerCase();
                        if (encoded.length === 0) {
                            return System.Array.init(0, 0, System.Byte);
                        }
                        var encodedLength = encoded.length;
                        var outLength = (Bridge.Int.div(Bridge.Int.mul(encodedLength, uuid_encoding.uuid_encoding.Base32.SHIFT), 8)) | 0;
                        var result = System.Array.init(outLength, 0, System.Byte);
                        var buffer = 0;
                        var next = 0;
                        var bitsLeft = 0;
                        $t = Bridge.getEnumerator(System.String.toCharArray(encoded, 0, encoded.length));
                        try {
                            while ($t.moveNext()) {
                                var c = $t.Current;
                                if (!uuid_encoding.uuid_encoding.Base32.CHAR_MAP.containsKey(c)) {
                                    throw new uuid_encoding.uuid_encoding.Base32.DecodingException("Illegal character: " + String.fromCharCode(c));
                                }
                                buffer = buffer << uuid_encoding.uuid_encoding.Base32.SHIFT;
                                buffer = buffer | (uuid_encoding.uuid_encoding.Base32.CHAR_MAP.get(c) & uuid_encoding.uuid_encoding.Base32.MASK);
                                bitsLeft = (bitsLeft + uuid_encoding.uuid_encoding.Base32.SHIFT) | 0;
                                if (bitsLeft >= 8) {
                                    result[System.Array.index(Bridge.identity(next, (next = (next + 1) | 0)), result)] = (buffer >> (((bitsLeft - 8) | 0))) & 255;
                                    bitsLeft = (bitsLeft - 8) | 0;
                                }
                            }
                        } finally {
                            if (Bridge.is($t, System.IDisposable)) {
                                $t.System$IDisposable$dispose();
                            }
                        }// We'll ignore leftover bits for now.
                        //
                        // if (next != outLength || bitsLeft >= SHIFT) {
                        //  throw new DecodingException("Bits left: " + bitsLeft);
                        // }
                        return result;
                    },
                    Encode: function (data, padOutput) {
                        if (padOutput === void 0) { padOutput = false; }
                        if (data.length === 0) {
                            return "";
                        }

                        // SHIFT is the number of bits per output character, so the length of the
                        // output is the length of the input multiplied by 8/SHIFT, rounded up.
                        if (data.length >= (268435456)) {
                            // The computation below will fail, so don't do it.
                            throw new System.ArgumentOutOfRangeException("data");
                        }

                        var outputLength = (Bridge.Int.div((((((Bridge.Int.mul(data.length, 8) + uuid_encoding.uuid_encoding.Base32.SHIFT) | 0) - 1) | 0)), uuid_encoding.uuid_encoding.Base32.SHIFT)) | 0;
                        var result = new System.Text.StringBuilder("", outputLength);

                        var buffer = data[System.Array.index(0, data)];
                        var next = 1;
                        var bitsLeft = 8;
                        while (bitsLeft > 0 || next < data.length) {
                            if (bitsLeft < uuid_encoding.uuid_encoding.Base32.SHIFT) {
                                if (next < data.length) {
                                    buffer = buffer << 8;
                                    buffer = buffer | (data[System.Array.index(Bridge.identity(next, (next = (next + 1) | 0)), data)] & 255);
                                    bitsLeft = (bitsLeft + 8) | 0;
                                } else {
                                    var pad = (uuid_encoding.uuid_encoding.Base32.SHIFT - bitsLeft) | 0;
                                    buffer = buffer << pad;
                                    bitsLeft = (bitsLeft + pad) | 0;
                                }
                            }
                            var index = uuid_encoding.uuid_encoding.Base32.MASK & (buffer >> (((bitsLeft - uuid_encoding.uuid_encoding.Base32.SHIFT) | 0)));
                            bitsLeft = (bitsLeft - uuid_encoding.uuid_encoding.Base32.SHIFT) | 0;
                            result.append(String.fromCharCode(uuid_encoding.uuid_encoding.Base32.DIGITS[System.Array.index(index, uuid_encoding.uuid_encoding.Base32.DIGITS)]));
                        }
                        if (padOutput) {
                            var padding = (8 - (result.getLength() % 8)) | 0;
                            if (padding > 0) {
                                result.append(System.String.fromCharCount(61, padding === 8 ? 0 : padding));
                            }
                        }
                        return result.toString();
                    }
                }
            }
        });

        Bridge.define("uuid_encoding.Base32.DecodingException", {
            inherits: [System.Exception],
            $metadata : function () { return {"td":uuid_encoding.uuid_encoding.Base32,"att":1048578,"a":2,"m":[{"a":2,"n":".ctor","t":1,"p":[System.String],"pi":[{"n":"message","pt":System.String,"ps":0}],"sn":"ctor"}]}; },
            $scope: uuid_encoding,
            ctors: {
                ctor: function (message) {
                    this.$initialize();
                    System.Exception.ctor.call(this, message);
                }
            }
        });
        module.exports.uuid_encoding = uuid_encoding;
    }) ();

});
