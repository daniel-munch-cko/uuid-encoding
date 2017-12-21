
/*
 * Derived from https://raw.githubusercontent.com/google/google-authenticator-android/master/AuthenticatorApp/src/androidTest/java/com/google/android/apps/authenticator/Base32StringTest.java
 *
 * Copyright 2011 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

using NUnit.Framework;

namespace uuid_encoding.Tests
{
    public class Base32Tests
    {
        // regression input and output values taken from RFC 4648
        // but stripped of the "=" padding from encoded output as required by the
        // implemented encoding in Base32String.java
        private static byte[] INPUT1 = string2Bytes("foo");
        private static byte[] INPUT2 = string2Bytes("foob");
        private static byte[] INPUT3 = string2Bytes("fooba");
        private static byte[] INPUT4 = string2Bytes("foobar");

        // RFC 4648 expected encodings for above inputs are:
        // "MZXW6===", "MZXW6YQ=", "MZXW6YTB", MZXW6YTBOI======".
        // Base32String encoding, however, drops the "=" padding.
        private static string OUTPUT1 = "mzxw6";
        private static string OUTPUT2 = "mzxw6yq";
        private static string OUTPUT3 = "mzxw6ytb";
        private static string OUTPUT4 = "mzxw6ytboi";


        private static byte[] string2Bytes(string s) =>
            System.Text.Encoding.UTF8.GetBytes(s);
        
        [Test]
        public void TestRegressionValuesFromRfc4648() 
        {
            // check encoding
            Assert.That(OUTPUT1, Is.EqualTo(Base32.Encode(INPUT1)));
            Assert.That(OUTPUT2, Is.EqualTo(Base32.Encode(INPUT2)));
            Assert.That(OUTPUT3, Is.EqualTo(Base32.Encode(INPUT3)));
            Assert.That(OUTPUT4, Is.EqualTo(Base32.Encode(INPUT4)));

            // check decoding
            Assert.That(INPUT1, Is.EqualTo(Base32.Decode(OUTPUT1)));
            Assert.That(INPUT2, Is.EqualTo(Base32.Decode(OUTPUT2)));
            Assert.That(INPUT3, Is.EqualTo(Base32.Decode(OUTPUT3)));
            Assert.That(INPUT4, Is.EqualTo(Base32.Decode(OUTPUT4)));
        }

        /**
        * Base32String implementation is not the same as that of RFC 4648, it drops
        * the last incomplete chunk and thus accepts encoded strings that should have
        * been rejected; also this results in multiple encoded strings being decoded
        * to the same byte array.
        * This test will catch any changes made regarding this behavior.
        */
        [Test]
        public void TestAmbiguousDecoding() 
        {
            byte[] b16 = Base32.Decode("7777777777777777"); // 16 7s.
            byte[] b17 = Base32.Decode("77777777777777777"); // 17 7s.
            Assert.That(b16, Is.EqualTo(b17));
        }

        [Test]
        public void TestSmallDecodingsAndFailures() 
        {
            // decoded, but not enough to return any bytes.
            Assert.That(0, Is.EqualTo(Base32.Decode("A").Length));
            Assert.That(0, Is.EqualTo(Base32.Decode("").Length));
            Assert.That(0, Is.EqualTo(Base32.Decode(" ").Length));

            // decoded successfully and returned 1 byte.
            Assert.That(1, Is.EqualTo(Base32.Decode("AA").Length));
            Assert.That(1, Is.EqualTo(Base32.Decode("AAA").Length));

            // decoded successfully and returned 2 bytes.
            Assert.That(2, Is.EqualTo(Base32.Decode("AAAA").Length));

            // acceptable separators " " and "-" which should be ignored
            Assert.That(2, Is.EqualTo(Base32.Decode("AA-AA").Length));
            Assert.That(2, Is.EqualTo(Base32.Decode("AA-AA").Length));
            //Assert.That(Base32.Decode("AA-AA"), Is.EqualTo(Base32.Decode("AA AA")));
            //Assert.That(Base32.Decode("AAAA"), Is.EqualTo(Base32.Decode("AA AA")));

            // 1, 8, 9, 0 are not a valid character, decoding should fail
            Assert.Throws<Base32.DecodingException>(() => Base32.Decode("11"));
            Assert.Throws<Base32.DecodingException>(() => Base32.Decode("A1"));
            Assert.Throws<Base32.DecodingException>(() => Base32.Decode("AAA8"));
            Assert.Throws<Base32.DecodingException>(() => Base32.Decode("AAA9"));
            Assert.Throws<Base32.DecodingException>(() => Base32.Decode("AAA0"));

            // non-alphanumerics (except =) are not valid characters and decoding should fail
            Assert.Throws<Base32.DecodingException>(() => Base32.Decode("AAA,"));
            Assert.Throws<Base32.DecodingException>(() => Base32.Decode("AAA;"));
            Assert.Throws<Base32.DecodingException>(() => Base32.Decode("AAA."));
            Assert.Throws<Base32.DecodingException>(() => Base32.Decode("AAA!"));

            // this just documents that a null string causes a nullpointerexception.
            Assert.Throws<System.NullReferenceException>(() => Base32.Decode(null));
        }
    }
}