/**
 * @version 1.0.6963.26247
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
                    }
                    var remainingBuffer = buffer & ((((1 << bitsLeft) - 1) | 0));

                    // Remaining non-zero buffer as well as left bits amount being at least the shift size lead to 
                    // ambiguity, since different input strings lead to the same result when simply ignoring those.
                    if (remainingBuffer !== 0) {
                        throw new uuid_encoding.Base32.DecodingException("Remaining buffer: " + remainingBuffer);
                    }

                    if (next !== outLength || bitsLeft >= uuid_encoding.Base32.SHIFT) {
                        throw new uuid_encoding.Base32.DecodingException("Bits left: " + bitsLeft);
                    }

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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICJ1dWlkLWVuY29kaW5nLkFNRC5qcyIsCiAgInNvdXJjZVJvb3QiOiAiIiwKICAic291cmNlcyI6IFsiLi4vdXVpZC1lbmNvZGluZy5qcy9CYXNlMzJHdWlkLmNzIiwiLi4vdXVpZC1lbmNvZGluZy9CYXNlMzIuY3MiXSwKICAibmFtZXMiOiBbIiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7OztvQkFRUUEsT0FBT0EsNEJBQWNBOztrQ0FHR0E7b0JBRXhCQSxXQUFXQSxJQUFJQSxtQkFBS0EsNEJBQWNBO29CQUNsQ0EsT0FBT0E7Ozs7Ozs7Ozs7Ozs7Ozs7O29DQ2dCeUNBLEtBQUlBOzs7OztvQkFJaERBLDhCQUFTQTtvQkFDVEEsNEJBQU9BO29CQUNQQSw2QkFBUUEsMkNBQXNCQTtvQkFDOUJBLEtBQUtBLFdBQVdBLElBQUlBLG9DQUFlQTt3QkFBS0Esa0NBQVNBLCtDQUFPQSxHQUFQQSwrQkFBYUE7Ozs7O2lEQUd6QkE7O29CQUVyQ0E7b0JBQ0FBLElBQUlBO3dCQUFRQTs7b0JBQ1pBO29CQUNBQSxJQUFJQTtvQkFBU0EsSUFBSUE7d0JBQVVBLElBQUlBO3dCQUFRQSxJQUFJQTs7b0JBQzNDQSxJQUFJQTtvQkFBUUEsSUFBSUE7d0JBQVVBLElBQUlBO3dCQUFPQSxJQUFJQTs7b0JBQ3pDQSxJQUFJQTtvQkFBUUEsSUFBSUE7d0JBQVVBLElBQUlBO3dCQUFPQSxJQUFJQTs7b0JBQ3pDQSxJQUFJQTtvQkFBUUEsSUFBSUE7d0JBQVVBLElBQUlBO3dCQUFPQSxJQUFJQTs7b0JBQ3pDQSxPQUFPQSxNQUFJQSxFQUFLQSxDQUFDQSxFQUFNQSxDQUFDQTs7a0NBR0FBOzs7b0JBRXhCQSxVQUFVQSx5Q0FBdUJBOzs7OztvQkFLakNBLFVBQVVBLDZDQUFjQTs7O29CQUd4QkEsVUFBVUE7b0JBQ1ZBLElBQUlBO3dCQUNBQSxPQUFPQTs7b0JBRVhBLG9CQUFvQkE7b0JBQ3BCQSxnQkFBZ0JBLDhDQUFnQkE7b0JBQ2hDQSxhQUFnQkEsa0JBQVNBO29CQUN6QkE7b0JBQ0FBO29CQUNBQTtvQkFDQUEsMEJBQW1CQTs7Ozs0QkFDZkEsSUFBSUEsQ0FBQ0EsMENBQXFCQTtnQ0FDdEJBLE1BQU1BLElBQUlBLHVDQUFrQkEsNENBQXdCQTs7NEJBRXhEQSxtQkFBV0E7NEJBQ1hBLGtCQUFVQSxtQ0FBU0EsS0FBS0E7NEJBQ3hCQSx1QkFBWUE7NEJBQ1pBLElBQUlBO2dDQUNBQSwwQ0FBT0EsZ0NBQVBBLFdBQWlCQSxDQUFNQSxBQUFDQSxVQUFVQSxDQUFDQTtnQ0FDbkNBOzs7Ozs7OztvQkFJUkEsc0JBQXNCQSxTQUFTQSxDQUFDQSxHQUFDQSxLQUFLQTs7OztvQkFJdENBLElBQUlBO3dCQUVEQSxNQUFNQSxJQUFJQSx1Q0FBa0JBLHVCQUF1QkE7OztvQkFHdERBLElBQUlBLFNBQVFBLGFBQWFBLFlBQVlBO3dCQUVsQ0EsTUFBTUEsSUFBSUEsdUNBQWtCQSxnQkFBZ0JBOzs7b0JBRy9DQSxPQUFPQTs7a0NBSWlCQSxNQUFhQTs7b0JBQ3JDQSxJQUFJQTt3QkFDQUE7Ozs7O29CQUtKQSxJQUFJQSxlQUFlQSxDQUFDQTs7d0JBRWhCQSxNQUFNQSxJQUFJQTs7O29CQUdkQSxtQkFBbUJBLGlCQUFDQSxxQ0FBa0JBLDZDQUFhQTtvQkFDbkRBLGFBQXVCQSxrQ0FBa0JBOztvQkFFekNBLGFBQWFBO29CQUNiQTtvQkFDQUE7b0JBQ0FBLE9BQU9BLGdCQUFnQkEsT0FBT0E7d0JBQzFCQSxJQUFJQSxXQUFXQTs0QkFDWEEsSUFBSUEsT0FBT0E7Z0NBQ1BBO2dDQUNBQSxrQkFBVUEsQ0FBQ0Esd0NBQUtBLGdDQUFMQTtnQ0FDWEE7O2dDQUVBQSxVQUFVQSw4QkFBUUE7Z0NBQ2xCQSxtQkFBV0E7Z0NBQ1hBLHVCQUFZQTs7O3dCQUdwQkEsWUFBWUEsNEJBQU9BLENBQUNBLFVBQVVBLENBQUNBLGFBQVdBO3dCQUMxQ0EsdUJBQVlBO3dCQUNaQSxrQ0FBY0EsK0NBQU9BLE9BQVBBOztvQkFFbEJBLElBQUlBO3dCQUNBQSxjQUFjQSxLQUFJQSxDQUFDQTt3QkFDbkJBLElBQUlBOzRCQUFhQSxjQUFjQSxnQ0FBZ0JBLG9CQUFtQkE7OztvQkFFdEVBLE9BQU9BOzs7Ozs7Ozs7NEJBSWtCQTs7aURBQXVCQSIsCiAgInNvdXJjZXNDb250ZW50IjogWyJ1c2luZyBTeXN0ZW07XG51c2luZyBCcmlkZ2U7XG51c2luZyB1dWlkX2VuY29kaW5nO1xuXG5wdWJsaWMgY2xhc3MgQmFzZTMyR3VpZFxue1xuICAgIHB1YmxpYyBzdGF0aWMgc3RyaW5nIENyZWF0ZSgpXG4gICAge1xuICAgICAgICByZXR1cm4gQmFzZTMyLkVuY29kZShHdWlkLk5ld0d1aWQoKS5Ub0J5dGVBcnJheSgpKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIHN0cmluZyBEZWNvZGUoc3RyaW5nIGJhc2UzMkd1aWQpXG4gICAge1xuICAgICAgICB2YXIgZ3VpZCA9IG5ldyBHdWlkKEJhc2UzMi5EZWNvZGUoYmFzZTMyR3VpZCkpO1xuICAgICAgICByZXR1cm4gZ3VpZC5Ub1N0cmluZygpO1xuICAgIH1cbn0iLCIvKlxuICogRGVyaXZlZCBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9nb29nbGUvZ29vZ2xlLWF1dGhlbnRpY2F0b3ItYW5kcm9pZC9ibG9iL21hc3Rlci9BdXRoZW50aWNhdG9yQXBwL3NyYy9tYWluL2phdmEvY29tL2dvb2dsZS9hbmRyb2lkL2FwcHMvYXV0aGVudGljYXRvci9CYXNlMzJTdHJpbmcuamF2YVxuICogXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYgQnJhdm9UYW5nbzg2XG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG51c2luZyBTeXN0ZW07XG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcbnVzaW5nIFN5c3RlbS5UZXh0O1xudXNpbmcgU3lzdGVtLlRleHQuUmVndWxhckV4cHJlc3Npb25zO1xubmFtZXNwYWNlIHV1aWRfZW5jb2RpbmdcbntcblxuICAgIHB1YmxpYyBzdGF0aWMgY2xhc3MgQmFzZTMyIHtcblxuICAgICAgICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBjaGFyW10gRElHSVRTO1xuICAgICAgICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBpbnQgTUFTSztcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgaW50IFNISUZUO1xuICAgICAgICBwcml2YXRlIHN0YXRpYyBEaWN0aW9uYXJ5PGNoYXIsIGludD4gQ0hBUl9NQVAgPSBuZXcgRGljdGlvbmFyeTxjaGFyLCBpbnQ+KCk7XG4gICAgICAgIHByaXZhdGUgY29uc3Qgc3RyaW5nIFNFUEFSQVRPUiA9IFwiLVwiO1xuXG4gICAgICAgIHN0YXRpYyBCYXNlMzIoKSB7XG4gICAgICAgICAgICBESUdJVFMgPSBcIkFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaMjM0NTY3XCIuVG9Mb3dlcigpLlRvQ2hhckFycmF5KCk7XG4gICAgICAgICAgICBNQVNLID0gRElHSVRTLkxlbmd0aCAtIDE7XG4gICAgICAgICAgICBTSElGVCA9IG51bWJlck9mVHJhaWxpbmdaZXJvcyhESUdJVFMuTGVuZ3RoKTtcbiAgICAgICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgRElHSVRTLkxlbmd0aDsgaSsrKSBDSEFSX01BUFtESUdJVFNbaV1dID0gaTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgc3RhdGljIGludCBudW1iZXJPZlRyYWlsaW5nWmVyb3MoaW50IGkpIHtcbiAgICAgICAgICAgIC8vIEhELCBGaWd1cmUgNS0xNFxuICAgICAgICAgICAgaW50IHk7XG4gICAgICAgICAgICBpZiAoaSA9PSAwKSByZXR1cm4gMzI7XG4gICAgICAgICAgICBpbnQgbiA9IDMxO1xuICAgICAgICAgICAgeSA9IGkgPDwgMTY7IGlmICh5ICE9IDApIHsgbiA9IG4gLSAxNjsgaSA9IHk7IH1cbiAgICAgICAgICAgIHkgPSBpIDw8IDg7IGlmICh5ICE9IDApIHsgbiA9IG4gLSA4OyBpID0geTsgfVxuICAgICAgICAgICAgeSA9IGkgPDwgNDsgaWYgKHkgIT0gMCkgeyBuID0gbiAtIDQ7IGkgPSB5OyB9XG4gICAgICAgICAgICB5ID0gaSA8PCAyOyBpZiAoeSAhPSAwKSB7IG4gPSBuIC0gMjsgaSA9IHk7IH1cbiAgICAgICAgICAgIHJldHVybiBuIC0gKGludCkoKHVpbnQpKGkgPDwgMSkgPj4gMzEpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHVibGljIHN0YXRpYyBieXRlW10gRGVjb2RlKHN0cmluZyBlbmNvZGVkKSB7XG4gICAgICAgICAgICAvLyBSZW1vdmUgd2hpdGVzcGFjZSBhbmQgc2VwYXJhdG9yc1xuICAgICAgICAgICAgZW5jb2RlZCA9IGVuY29kZWQuVHJpbSgpLlJlcGxhY2UoU0VQQVJBVE9SLCBcIlwiKTtcblxuICAgICAgICAgICAgLy8gUmVtb3ZlIHBhZGRpbmcuIE5vdGU6IHRoZSBwYWRkaW5nIGlzIHVzZWQgYXMgaGludCB0byBkZXRlcm1pbmUgaG93IG1hbnlcbiAgICAgICAgICAgIC8vIGJpdHMgdG8gZGVjb2RlIGZyb20gdGhlIGxhc3QgaW5jb21wbGV0ZSBjaHVuayAod2hpY2ggaXMgY29tbWVudGVkIG91dFxuICAgICAgICAgICAgLy8gYmVsb3csIHNvIHRoaXMgbWF5IGhhdmUgYmVlbiB3cm9uZyB0byBzdGFydCB3aXRoKS5cbiAgICAgICAgICAgIGVuY29kZWQgPSBSZWdleC5SZXBsYWNlKGVuY29kZWQsIFwiWz1dKiRcIiwgXCJcIik7XG5cbiAgICAgICAgICAgIC8vIENhbm9uaWNhbGl6ZSB0byBhbGwgdXBwZXIgY2FzZVxuICAgICAgICAgICAgZW5jb2RlZCA9IGVuY29kZWQuVG9Mb3dlcigpO1xuICAgICAgICAgICAgaWYgKGVuY29kZWQuTGVuZ3RoID09IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IGJ5dGVbMF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpbnQgZW5jb2RlZExlbmd0aCA9IGVuY29kZWQuTGVuZ3RoO1xuICAgICAgICAgICAgaW50IG91dExlbmd0aCA9IGVuY29kZWRMZW5ndGggKiBTSElGVCAvIDg7XG4gICAgICAgICAgICBieXRlW10gcmVzdWx0ID0gbmV3IGJ5dGVbb3V0TGVuZ3RoXTtcbiAgICAgICAgICAgIGludCBidWZmZXIgPSAwO1xuICAgICAgICAgICAgaW50IG5leHQgPSAwO1xuICAgICAgICAgICAgaW50IGJpdHNMZWZ0ID0gMDtcbiAgICAgICAgICAgIGZvcmVhY2ggKGNoYXIgYyBpbiBlbmNvZGVkLlRvQ2hhckFycmF5KCkpIHtcbiAgICAgICAgICAgICAgICBpZiAoIUNIQVJfTUFQLkNvbnRhaW5zS2V5KGMpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBEZWNvZGluZ0V4Y2VwdGlvbihcIklsbGVnYWwgY2hhcmFjdGVyOiBcIiArIGMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBidWZmZXIgPDw9IFNISUZUO1xuICAgICAgICAgICAgICAgIGJ1ZmZlciB8PSBDSEFSX01BUFtjXSAmIE1BU0s7XG4gICAgICAgICAgICAgICAgYml0c0xlZnQgKz0gU0hJRlQ7XG4gICAgICAgICAgICAgICAgaWYgKGJpdHNMZWZ0ID49IDgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0W25leHQrK10gPSAoYnl0ZSkoYnVmZmVyID4+IChiaXRzTGVmdCAtIDgpKTtcbiAgICAgICAgICAgICAgICAgICAgYml0c0xlZnQgLT0gODtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGludCByZW1haW5pbmdCdWZmZXIgPSBidWZmZXIgJiAoKDEgPDwgYml0c0xlZnQpIC0gMSk7XG5cbiAgICAgICAgICAgIC8vIFJlbWFpbmluZyBub24temVybyBidWZmZXIgYXMgd2VsbCBhcyBsZWZ0IGJpdHMgYW1vdW50IGJlaW5nIGF0IGxlYXN0IHRoZSBzaGlmdCBzaXplIGxlYWQgdG8gXG4gICAgICAgICAgICAvLyBhbWJpZ3VpdHksIHNpbmNlIGRpZmZlcmVudCBpbnB1dCBzdHJpbmdzIGxlYWQgdG8gdGhlIHNhbWUgcmVzdWx0IHdoZW4gc2ltcGx5IGlnbm9yaW5nIHRob3NlLlxuICAgICAgICAgICAgaWYgKHJlbWFpbmluZ0J1ZmZlciAhPSAwKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgdGhyb3cgbmV3IERlY29kaW5nRXhjZXB0aW9uKFwiUmVtYWluaW5nIGJ1ZmZlcjogXCIgKyByZW1haW5pbmdCdWZmZXIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobmV4dCAhPSBvdXRMZW5ndGggfHwgYml0c0xlZnQgPj0gU0hJRlQpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICB0aHJvdyBuZXcgRGVjb2RpbmdFeGNlcHRpb24oXCJCaXRzIGxlZnQ6IFwiICsgYml0c0xlZnQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG5cblxuICAgICAgICBwdWJsaWMgc3RhdGljIHN0cmluZyBFbmNvZGUoYnl0ZVtdIGRhdGEsIGJvb2wgcGFkT3V0cHV0ID0gZmFsc2UpIHtcbiAgICAgICAgICAgIGlmIChkYXRhLkxlbmd0aCA9PSAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFNISUZUIGlzIHRoZSBudW1iZXIgb2YgYml0cyBwZXIgb3V0cHV0IGNoYXJhY3Rlciwgc28gdGhlIGxlbmd0aCBvZiB0aGVcbiAgICAgICAgICAgIC8vIG91dHB1dCBpcyB0aGUgbGVuZ3RoIG9mIHRoZSBpbnB1dCBtdWx0aXBsaWVkIGJ5IDgvU0hJRlQsIHJvdW5kZWQgdXAuXG4gICAgICAgICAgICBpZiAoZGF0YS5MZW5ndGggPj0gKDEgPDwgMjgpKSB7XG4gICAgICAgICAgICAgICAgLy8gVGhlIGNvbXB1dGF0aW9uIGJlbG93IHdpbGwgZmFpbCwgc28gZG9uJ3QgZG8gaXQuXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEFyZ3VtZW50T3V0T2ZSYW5nZUV4Y2VwdGlvbihcImRhdGFcIik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGludCBvdXRwdXRMZW5ndGggPSAoZGF0YS5MZW5ndGggKiA4ICsgU0hJRlQgLSAxKSAvIFNISUZUO1xuICAgICAgICAgICAgU3RyaW5nQnVpbGRlciByZXN1bHQgPSBuZXcgU3RyaW5nQnVpbGRlcihvdXRwdXRMZW5ndGgpO1xuXG4gICAgICAgICAgICBpbnQgYnVmZmVyID0gZGF0YVswXTtcbiAgICAgICAgICAgIGludCBuZXh0ID0gMTtcbiAgICAgICAgICAgIGludCBiaXRzTGVmdCA9IDg7XG4gICAgICAgICAgICB3aGlsZSAoYml0c0xlZnQgPiAwIHx8IG5leHQgPCBkYXRhLkxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGlmIChiaXRzTGVmdCA8IFNISUZUKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXh0IDwgZGF0YS5MZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZmZlciA8PD0gODtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZmZlciB8PSAoZGF0YVtuZXh0KytdICYgMHhmZik7XG4gICAgICAgICAgICAgICAgICAgICAgICBiaXRzTGVmdCArPSA4O1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW50IHBhZCA9IFNISUZUIC0gYml0c0xlZnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBidWZmZXIgPDw9IHBhZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJpdHNMZWZ0ICs9IHBhZDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpbnQgaW5kZXggPSBNQVNLICYgKGJ1ZmZlciA+PiAoYml0c0xlZnQgLSBTSElGVCkpO1xuICAgICAgICAgICAgICAgIGJpdHNMZWZ0IC09IFNISUZUO1xuICAgICAgICAgICAgICAgIHJlc3VsdC5BcHBlbmQoRElHSVRTW2luZGV4XSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocGFkT3V0cHV0KSB7XG4gICAgICAgICAgICAgICAgaW50IHBhZGRpbmcgPSA4IC0gKHJlc3VsdC5MZW5ndGggJSA4KTtcbiAgICAgICAgICAgICAgICBpZiAocGFkZGluZyA+IDApIHJlc3VsdC5BcHBlbmQobmV3IHN0cmluZygnPScsIHBhZGRpbmcgPT0gOCA/IDAgOiBwYWRkaW5nKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0LlRvU3RyaW5nKCk7XG4gICAgICAgIH1cblxuICAgICAgICBwdWJsaWMgY2xhc3MgRGVjb2RpbmdFeGNlcHRpb24gOiBFeGNlcHRpb24ge1xuICAgICAgICAgICAgcHVibGljIERlY29kaW5nRXhjZXB0aW9uKHN0cmluZyBtZXNzYWdlKSA6IGJhc2UobWVzc2FnZSkge1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufSJdCn0K
