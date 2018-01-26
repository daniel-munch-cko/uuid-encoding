/**
 * @version 1.0.6600.28423
 * @copyright ${AuthorCopyright}
 * @compiler Bridge.NET 16.7.0
 */
Bridge.assembly("uuid-encoding.AMD", function ($asm, globals) {
    "use strict";

    Bridge.define("Base32Guid", {
        statics: {
            methods: {
                Create: function () {
                    return uuid_encoding.Base32.Encode(System.Guid.newGuid().toByteArray());
                },
                Decode: function (base32Guid) {
                    var guid = new System.Guid.$ctor1(uuid_encoding.Base32.Decode(base32Guid));
                    return guid.toString();
                }
            }
        }
    });

    Bridge.define("uuid_encoding.Base32", {
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
                    uuid_encoding.Base32.DIGITS = ($t = ("ABCDEFGHIJKLMNOPQRSTUVWXYZ234567").toLowerCase(), System.String.toCharArray($t, 0, $t.length));
                    uuid_encoding.Base32.MASK = (uuid_encoding.Base32.DIGITS.length - 1) | 0;
                    uuid_encoding.Base32.SHIFT = uuid_encoding.Base32.numberOfTrailingZeros(uuid_encoding.Base32.DIGITS.length);
                    for (var i = 0; i < uuid_encoding.Base32.DIGITS.length; i = (i + 1) | 0) {
                        uuid_encoding.Base32.CHAR_MAP.set(uuid_encoding.Base32.DIGITS[System.Array.index(i, uuid_encoding.Base32.DIGITS)], i);
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
                    encoded = System.String.replaceAll(encoded.trim(), uuid_encoding.Base32.SEPARATOR, "");

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
                    var outLength = (Bridge.Int.div(Bridge.Int.mul(encodedLength, uuid_encoding.Base32.SHIFT), 8)) | 0;
                    var result = System.Array.init(outLength, 0, System.Byte);
                    var buffer = 0;
                    var next = 0;
                    var bitsLeft = 0;
                    $t = Bridge.getEnumerator(System.String.toCharArray(encoded, 0, encoded.length));
                    try {
                        while ($t.moveNext()) {
                            var c = $t.Current;
                            if (!uuid_encoding.Base32.CHAR_MAP.containsKey(c)) {
                                throw new uuid_encoding.Base32.DecodingException("Illegal character: " + String.fromCharCode(c));
                            }
                            buffer = buffer << uuid_encoding.Base32.SHIFT;
                            buffer = buffer | (uuid_encoding.Base32.CHAR_MAP.get(c) & uuid_encoding.Base32.MASK);
                            bitsLeft = (bitsLeft + uuid_encoding.Base32.SHIFT) | 0;
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

                    var outputLength = (Bridge.Int.div((((((Bridge.Int.mul(data.length, 8) + uuid_encoding.Base32.SHIFT) | 0) - 1) | 0)), uuid_encoding.Base32.SHIFT)) | 0;
                    var result = new System.Text.StringBuilder("", outputLength);

                    var buffer = data[System.Array.index(0, data)];
                    var next = 1;
                    var bitsLeft = 8;
                    while (bitsLeft > 0 || next < data.length) {
                        if (bitsLeft < uuid_encoding.Base32.SHIFT) {
                            if (next < data.length) {
                                buffer = buffer << 8;
                                buffer = buffer | (data[System.Array.index(Bridge.identity(next, (next = (next + 1) | 0)), data)] & 255);
                                bitsLeft = (bitsLeft + 8) | 0;
                            } else {
                                var pad = (uuid_encoding.Base32.SHIFT - bitsLeft) | 0;
                                buffer = buffer << pad;
                                bitsLeft = (bitsLeft + pad) | 0;
                            }
                        }
                        var index = uuid_encoding.Base32.MASK & (buffer >> (((bitsLeft - uuid_encoding.Base32.SHIFT) | 0)));
                        bitsLeft = (bitsLeft - uuid_encoding.Base32.SHIFT) | 0;
                        result.append(String.fromCharCode(uuid_encoding.Base32.DIGITS[System.Array.index(index, uuid_encoding.Base32.DIGITS)]));
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
        ctors: {
            ctor: function (message) {
                this.$initialize();
                System.Exception.ctor.call(this, message);
            }
        }
    });
});

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICJ1dWlkLWVuY29kaW5nLkFNRC5qcyIsCiAgInNvdXJjZVJvb3QiOiAiIiwKICAic291cmNlcyI6IFsiLi4vdXVpZC1lbmNvZGluZy5qcy9CYXNlMzJHdWlkLmNzIiwiLi4vdXVpZC1lbmNvZGluZy9CYXNlMzIuY3MiXSwKICAibmFtZXMiOiBbIiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7OztvQkFRUUEsT0FBT0EsNEJBQWNBOztrQ0FHR0E7b0JBRXhCQSxXQUFXQSxJQUFJQSxtQkFBS0EsNEJBQWNBO29CQUNsQ0EsT0FBT0E7Ozs7Ozs7Ozs7Ozs7Ozs7O29DQ2dCeUNBLEtBQUlBOzs7OztvQkFJaERBLDhCQUFTQTtvQkFDVEEsNEJBQU9BO29CQUNQQSw2QkFBUUEsMkNBQXNCQTtvQkFDOUJBLEtBQUtBLFdBQVdBLElBQUlBLG9DQUFlQTt3QkFBS0Esa0NBQVNBLCtDQUFPQSxHQUFQQSwrQkFBYUE7Ozs7O2lEQUd6QkE7O29CQUVyQ0E7b0JBQ0FBLElBQUlBO3dCQUFRQTs7b0JBQ1pBO29CQUNBQSxJQUFJQTtvQkFBU0EsSUFBSUE7d0JBQVVBLElBQUlBO3dCQUFRQSxJQUFJQTs7b0JBQzNDQSxJQUFJQTtvQkFBUUEsSUFBSUE7d0JBQVVBLElBQUlBO3dCQUFPQSxJQUFJQTs7b0JBQ3pDQSxJQUFJQTtvQkFBUUEsSUFBSUE7d0JBQVVBLElBQUlBO3dCQUFPQSxJQUFJQTs7b0JBQ3pDQSxJQUFJQTtvQkFBUUEsSUFBSUE7d0JBQVVBLElBQUlBO3dCQUFPQSxJQUFJQTs7b0JBQ3pDQSxPQUFPQSxNQUFJQSxFQUFLQSxDQUFDQSxFQUFNQSxDQUFDQTs7a0NBR0FBOzs7b0JBRXhCQSxVQUFVQSx5Q0FBdUJBOzs7OztvQkFLakNBLFVBQVVBLDZDQUFjQTs7O29CQUd4QkEsVUFBVUE7b0JBQ1ZBLElBQUlBO3dCQUNBQSxPQUFPQTs7b0JBRVhBLG9CQUFvQkE7b0JBQ3BCQSxnQkFBZ0JBLDhDQUFnQkE7b0JBQ2hDQSxhQUFnQkEsa0JBQVNBO29CQUN6QkE7b0JBQ0FBO29CQUNBQTtvQkFDQUEsMEJBQW1CQTs7Ozs0QkFDZkEsSUFBSUEsQ0FBQ0EsMENBQXFCQTtnQ0FDdEJBLE1BQU1BLElBQUlBLHVDQUFrQkEsNENBQXdCQTs7NEJBRXhEQSxtQkFBV0E7NEJBQ1hBLGtCQUFVQSxtQ0FBU0EsS0FBS0E7NEJBQ3hCQSx1QkFBWUE7NEJBQ1pBLElBQUlBO2dDQUNBQSwwQ0FBT0EsZ0NBQVBBLFdBQWlCQSxDQUFNQSxBQUFDQSxVQUFVQSxDQUFDQTtnQ0FDbkNBOzs7Ozs7Ozs7Ozs7b0JBUVJBLE9BQU9BOztrQ0FJaUJBLE1BQWFBOztvQkFDckNBLElBQUlBO3dCQUNBQTs7Ozs7b0JBS0pBLElBQUlBLGVBQWVBLENBQUNBOzt3QkFFaEJBLE1BQU1BLElBQUlBOzs7b0JBR2RBLG1CQUFtQkEsaUJBQUNBLHFDQUFrQkEsNkNBQWFBO29CQUNuREEsYUFBdUJBLGtDQUFrQkE7O29CQUV6Q0EsYUFBYUE7b0JBQ2JBO29CQUNBQTtvQkFDQUEsT0FBT0EsZ0JBQWdCQSxPQUFPQTt3QkFDMUJBLElBQUlBLFdBQVdBOzRCQUNYQSxJQUFJQSxPQUFPQTtnQ0FDUEE7Z0NBQ0FBLGtCQUFVQSxDQUFDQSx3Q0FBS0EsZ0NBQUxBO2dDQUNYQTs7Z0NBRUFBLFVBQVVBLDhCQUFRQTtnQ0FDbEJBLG1CQUFXQTtnQ0FDWEEsdUJBQVlBOzs7d0JBR3BCQSxZQUFZQSw0QkFBT0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsYUFBV0E7d0JBQzFDQSx1QkFBWUE7d0JBQ1pBLGtDQUFjQSwrQ0FBT0EsT0FBUEE7O29CQUVsQkEsSUFBSUE7d0JBQ0FBLGNBQWNBLEtBQUlBLENBQUNBO3dCQUNuQkEsSUFBSUE7NEJBQWFBLGNBQWNBLGdDQUFnQkEsb0JBQW1CQTs7O29CQUV0RUEsT0FBT0E7Ozs7Ozs7Ozs0QkFJa0JBOztpREFBdUJBIiwKICAic291cmNlc0NvbnRlbnQiOiBbInVzaW5nIFN5c3RlbTtcbnVzaW5nIEJyaWRnZTtcbnVzaW5nIHV1aWRfZW5jb2Rpbmc7XG5cbnB1YmxpYyBjbGFzcyBCYXNlMzJHdWlkXG57XG4gICAgcHVibGljIHN0YXRpYyBzdHJpbmcgQ3JlYXRlKClcbiAgICB7XG4gICAgICAgIHJldHVybiBCYXNlMzIuRW5jb2RlKEd1aWQuTmV3R3VpZCgpLlRvQnl0ZUFycmF5KCkpO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgc3RyaW5nIERlY29kZShzdHJpbmcgYmFzZTMyR3VpZClcbiAgICB7XG4gICAgICAgIHZhciBndWlkID0gbmV3IEd1aWQoQmFzZTMyLkRlY29kZShiYXNlMzJHdWlkKSk7XG4gICAgICAgIHJldHVybiBndWlkLlRvU3RyaW5nKCk7XG4gICAgfVxufSIsIi8qXG4gKiBEZXJpdmVkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL2dvb2dsZS9nb29nbGUtYXV0aGVudGljYXRvci1hbmRyb2lkL2Jsb2IvbWFzdGVyL0F1dGhlbnRpY2F0b3JBcHAvc3JjL21haW4vamF2YS9jb20vZ29vZ2xlL2FuZHJvaWQvYXBwcy9hdXRoZW50aWNhdG9yL0Jhc2UzMlN0cmluZy5qYXZhXG4gKiBcbiAqIENvcHlyaWdodCAoQykgMjAxNiBCcmF2b1RhbmdvODZcbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbnVzaW5nIFN5c3RlbTtcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xudXNpbmcgU3lzdGVtLlRleHQ7XG51c2luZyBTeXN0ZW0uVGV4dC5SZWd1bGFyRXhwcmVzc2lvbnM7XG5uYW1lc3BhY2UgdXVpZF9lbmNvZGluZ1xue1xuXG4gICAgcHVibGljIHN0YXRpYyBjbGFzcyBCYXNlMzIge1xuXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IGNoYXJbXSBESUdJVFM7XG4gICAgICAgIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IGludCBNQVNLO1xuICAgICAgICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBpbnQgU0hJRlQ7XG4gICAgICAgIHByaXZhdGUgc3RhdGljIERpY3Rpb25hcnk8Y2hhciwgaW50PiBDSEFSX01BUCA9IG5ldyBEaWN0aW9uYXJ5PGNoYXIsIGludD4oKTtcbiAgICAgICAgcHJpdmF0ZSBjb25zdCBzdHJpbmcgU0VQQVJBVE9SID0gXCItXCI7XG5cbiAgICAgICAgc3RhdGljIEJhc2UzMigpIHtcbiAgICAgICAgICAgIERJR0lUUyA9IFwiQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVoyMzQ1NjdcIi5Ub0xvd2VyKCkuVG9DaGFyQXJyYXkoKTtcbiAgICAgICAgICAgIE1BU0sgPSBESUdJVFMuTGVuZ3RoIC0gMTtcbiAgICAgICAgICAgIFNISUZUID0gbnVtYmVyT2ZUcmFpbGluZ1plcm9zKERJR0lUUy5MZW5ndGgpO1xuICAgICAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCBESUdJVFMuTGVuZ3RoOyBpKyspIENIQVJfTUFQW0RJR0lUU1tpXV0gPSBpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgaW50IG51bWJlck9mVHJhaWxpbmdaZXJvcyhpbnQgaSkge1xuICAgICAgICAgICAgLy8gSEQsIEZpZ3VyZSA1LTE0XG4gICAgICAgICAgICBpbnQgeTtcbiAgICAgICAgICAgIGlmIChpID09IDApIHJldHVybiAzMjtcbiAgICAgICAgICAgIGludCBuID0gMzE7XG4gICAgICAgICAgICB5ID0gaSA8PCAxNjsgaWYgKHkgIT0gMCkgeyBuID0gbiAtIDE2OyBpID0geTsgfVxuICAgICAgICAgICAgeSA9IGkgPDwgODsgaWYgKHkgIT0gMCkgeyBuID0gbiAtIDg7IGkgPSB5OyB9XG4gICAgICAgICAgICB5ID0gaSA8PCA0OyBpZiAoeSAhPSAwKSB7IG4gPSBuIC0gNDsgaSA9IHk7IH1cbiAgICAgICAgICAgIHkgPSBpIDw8IDI7IGlmICh5ICE9IDApIHsgbiA9IG4gLSAyOyBpID0geTsgfVxuICAgICAgICAgICAgcmV0dXJuIG4gLSAoaW50KSgodWludCkoaSA8PCAxKSA+PiAzMSk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgc3RhdGljIGJ5dGVbXSBEZWNvZGUoc3RyaW5nIGVuY29kZWQpIHtcbiAgICAgICAgICAgIC8vIFJlbW92ZSB3aGl0ZXNwYWNlIGFuZCBzZXBhcmF0b3JzXG4gICAgICAgICAgICBlbmNvZGVkID0gZW5jb2RlZC5UcmltKCkuUmVwbGFjZShTRVBBUkFUT1IsIFwiXCIpO1xuXG4gICAgICAgICAgICAvLyBSZW1vdmUgcGFkZGluZy4gTm90ZTogdGhlIHBhZGRpbmcgaXMgdXNlZCBhcyBoaW50IHRvIGRldGVybWluZSBob3cgbWFueVxuICAgICAgICAgICAgLy8gYml0cyB0byBkZWNvZGUgZnJvbSB0aGUgbGFzdCBpbmNvbXBsZXRlIGNodW5rICh3aGljaCBpcyBjb21tZW50ZWQgb3V0XG4gICAgICAgICAgICAvLyBiZWxvdywgc28gdGhpcyBtYXkgaGF2ZSBiZWVuIHdyb25nIHRvIHN0YXJ0IHdpdGgpLlxuICAgICAgICAgICAgZW5jb2RlZCA9IFJlZ2V4LlJlcGxhY2UoZW5jb2RlZCwgXCJbPV0qJFwiLCBcIlwiKTtcblxuICAgICAgICAgICAgLy8gQ2Fub25pY2FsaXplIHRvIGFsbCB1cHBlciBjYXNlXG4gICAgICAgICAgICBlbmNvZGVkID0gZW5jb2RlZC5Ub0xvd2VyKCk7XG4gICAgICAgICAgICBpZiAoZW5jb2RlZC5MZW5ndGggPT0gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgYnl0ZVswXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGludCBlbmNvZGVkTGVuZ3RoID0gZW5jb2RlZC5MZW5ndGg7XG4gICAgICAgICAgICBpbnQgb3V0TGVuZ3RoID0gZW5jb2RlZExlbmd0aCAqIFNISUZUIC8gODtcbiAgICAgICAgICAgIGJ5dGVbXSByZXN1bHQgPSBuZXcgYnl0ZVtvdXRMZW5ndGhdO1xuICAgICAgICAgICAgaW50IGJ1ZmZlciA9IDA7XG4gICAgICAgICAgICBpbnQgbmV4dCA9IDA7XG4gICAgICAgICAgICBpbnQgYml0c0xlZnQgPSAwO1xuICAgICAgICAgICAgZm9yZWFjaCAoY2hhciBjIGluIGVuY29kZWQuVG9DaGFyQXJyYXkoKSkge1xuICAgICAgICAgICAgICAgIGlmICghQ0hBUl9NQVAuQ29udGFpbnNLZXkoYykpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IERlY29kaW5nRXhjZXB0aW9uKFwiSWxsZWdhbCBjaGFyYWN0ZXI6IFwiICsgYyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJ1ZmZlciA8PD0gU0hJRlQ7XG4gICAgICAgICAgICAgICAgYnVmZmVyIHw9IENIQVJfTUFQW2NdICYgTUFTSztcbiAgICAgICAgICAgICAgICBiaXRzTGVmdCArPSBTSElGVDtcbiAgICAgICAgICAgICAgICBpZiAoYml0c0xlZnQgPj0gOCkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRbbmV4dCsrXSA9IChieXRlKShidWZmZXIgPj4gKGJpdHNMZWZ0IC0gOCkpO1xuICAgICAgICAgICAgICAgICAgICBiaXRzTGVmdCAtPSA4O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFdlJ2xsIGlnbm9yZSBsZWZ0b3ZlciBiaXRzIGZvciBub3cuXG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gaWYgKG5leHQgIT0gb3V0TGVuZ3RoIHx8IGJpdHNMZWZ0ID49IFNISUZUKSB7XG4gICAgICAgICAgICAvLyAgdGhyb3cgbmV3IERlY29kaW5nRXhjZXB0aW9uKFwiQml0cyBsZWZ0OiBcIiArIGJpdHNMZWZ0KTtcbiAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cblxuXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgc3RyaW5nIEVuY29kZShieXRlW10gZGF0YSwgYm9vbCBwYWRPdXRwdXQgPSBmYWxzZSkge1xuICAgICAgICAgICAgaWYgKGRhdGEuTGVuZ3RoID09IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJcIjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gU0hJRlQgaXMgdGhlIG51bWJlciBvZiBiaXRzIHBlciBvdXRwdXQgY2hhcmFjdGVyLCBzbyB0aGUgbGVuZ3RoIG9mIHRoZVxuICAgICAgICAgICAgLy8gb3V0cHV0IGlzIHRoZSBsZW5ndGggb2YgdGhlIGlucHV0IG11bHRpcGxpZWQgYnkgOC9TSElGVCwgcm91bmRlZCB1cC5cbiAgICAgICAgICAgIGlmIChkYXRhLkxlbmd0aCA+PSAoMSA8PCAyOCkpIHtcbiAgICAgICAgICAgICAgICAvLyBUaGUgY29tcHV0YXRpb24gYmVsb3cgd2lsbCBmYWlsLCBzbyBkb24ndCBkbyBpdC5cbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgQXJndW1lbnRPdXRPZlJhbmdlRXhjZXB0aW9uKFwiZGF0YVwiKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaW50IG91dHB1dExlbmd0aCA9IChkYXRhLkxlbmd0aCAqIDggKyBTSElGVCAtIDEpIC8gU0hJRlQ7XG4gICAgICAgICAgICBTdHJpbmdCdWlsZGVyIHJlc3VsdCA9IG5ldyBTdHJpbmdCdWlsZGVyKG91dHB1dExlbmd0aCk7XG5cbiAgICAgICAgICAgIGludCBidWZmZXIgPSBkYXRhWzBdO1xuICAgICAgICAgICAgaW50IG5leHQgPSAxO1xuICAgICAgICAgICAgaW50IGJpdHNMZWZ0ID0gODtcbiAgICAgICAgICAgIHdoaWxlIChiaXRzTGVmdCA+IDAgfHwgbmV4dCA8IGRhdGEuTGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgaWYgKGJpdHNMZWZ0IDwgU0hJRlQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5leHQgPCBkYXRhLkxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnVmZmVyIDw8PSA4O1xuICAgICAgICAgICAgICAgICAgICAgICAgYnVmZmVyIHw9IChkYXRhW25leHQrK10gJiAweGZmKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJpdHNMZWZ0ICs9IDg7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnQgcGFkID0gU0hJRlQgLSBiaXRzTGVmdDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZmZlciA8PD0gcGFkO1xuICAgICAgICAgICAgICAgICAgICAgICAgYml0c0xlZnQgKz0gcGFkO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGludCBpbmRleCA9IE1BU0sgJiAoYnVmZmVyID4+IChiaXRzTGVmdCAtIFNISUZUKSk7XG4gICAgICAgICAgICAgICAgYml0c0xlZnQgLT0gU0hJRlQ7XG4gICAgICAgICAgICAgICAgcmVzdWx0LkFwcGVuZChESUdJVFNbaW5kZXhdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChwYWRPdXRwdXQpIHtcbiAgICAgICAgICAgICAgICBpbnQgcGFkZGluZyA9IDggLSAocmVzdWx0Lkxlbmd0aCAlIDgpO1xuICAgICAgICAgICAgICAgIGlmIChwYWRkaW5nID4gMCkgcmVzdWx0LkFwcGVuZChuZXcgc3RyaW5nKCc9JywgcGFkZGluZyA9PSA4ID8gMCA6IHBhZGRpbmcpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQuVG9TdHJpbmcoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1YmxpYyBjbGFzcyBEZWNvZGluZ0V4Y2VwdGlvbiA6IEV4Y2VwdGlvbiB7XG4gICAgICAgICAgICBwdWJsaWMgRGVjb2RpbmdFeGNlcHRpb24oc3RyaW5nIG1lc3NhZ2UpIDogYmFzZShtZXNzYWdlKSB7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59Il0KfQo=
