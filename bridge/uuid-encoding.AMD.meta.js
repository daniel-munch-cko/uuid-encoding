Bridge.assembly("uuid-encoding.AMD", function ($asm, globals) {
    "use strict";


    var $m = Bridge.setMetadata,
        $n = [System,System.Collections.Generic,uuid_encoding];
    $m("Base32Guid", function () { return {"att":1048577,"a":2,"m":[{"a":2,"isSynthetic":true,"n":".ctor","t":1,"sn":"ctor"},{"a":2,"n":"Create","is":true,"t":8,"sn":"Create","rt":$n[0].String},{"a":2,"n":"Decode","is":true,"t":8,"pi":[{"n":"base32Guid","pt":$n[0].String,"ps":0}],"sn":"Decode","rt":$n[0].String,"p":[$n[0].String]}]}; });
    $m("uuid_encoding.Base32", function () { return {"att":385,"a":2,"s":true,"m":[{"n":".cctor","t":1,"sn":"ctor","sm":true},{"a":2,"n":"Decode","is":true,"t":8,"pi":[{"n":"encoded","pt":$n[0].String,"ps":0}],"sn":"Decode","rt":$n[0].Array.type(System.Byte),"p":[$n[0].String]},{"a":2,"n":"Encode","is":true,"t":8,"pi":[{"n":"data","pt":$n[0].Array.type(System.Byte),"ps":0},{"n":"padOutput","dv":false,"o":true,"pt":$n[0].Boolean,"ps":1}],"sn":"Encode","rt":$n[0].String,"p":[$n[0].Array.type(System.Byte),$n[0].Boolean]},{"a":1,"n":"numberOfTrailingZeros","is":true,"t":8,"pi":[{"n":"i","pt":$n[0].Int32,"ps":0}],"sn":"numberOfTrailingZeros","rt":$n[0].Int32,"p":[$n[0].Int32],"box":function ($v) { return Bridge.box($v, System.Int32);}},{"a":1,"n":"CHAR_MAP","is":true,"t":4,"rt":$n[1].Dictionary$2(System.Char,System.Int32),"sn":"CHAR_MAP"},{"a":1,"n":"DIGITS","is":true,"t":4,"rt":$n[0].Array.type(System.Char),"sn":"DIGITS","ro":true},{"a":1,"n":"MASK","is":true,"t":4,"rt":$n[0].Int32,"sn":"MASK","ro":true,"box":function ($v) { return Bridge.box($v, System.Int32);}},{"a":1,"n":"SEPARATOR","is":true,"t":4,"rt":$n[0].String,"sn":"SEPARATOR"},{"a":1,"n":"SHIFT","is":true,"t":4,"rt":$n[0].Int32,"sn":"SHIFT","ro":true,"box":function ($v) { return Bridge.box($v, System.Int32);}}]}; });
    $m("uuid_encoding.Base32.DecodingException", function () { return {"td":$n[2].Base32,"att":1048578,"a":2,"m":[{"a":2,"n":".ctor","t":1,"p":[$n[0].String],"pi":[{"n":"message","pt":$n[0].String,"ps":0}],"sn":"ctor"}]}; });
});