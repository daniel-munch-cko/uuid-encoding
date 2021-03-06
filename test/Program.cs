﻿using System;

namespace uuid_encoding
{
    class Program
    {
        static void Main1(string[] args)
        {
            var uid = Guid.NewGuid();
            var uidBytes = uid.ToByteArray();
            
            var base32 = Base32.Encode(uidBytes);
            var base64 = Convert.ToBase64String(uidBytes);

            Console.WriteLine($"base16 : {uid:n}");
            Console.WriteLine($"base32 : {base32}");
            Console.WriteLine($"base64 : {base64}");

            
            var fromBase32 = new Guid(Base32.Decode(base32));
            var fromBase64 = new Guid(Convert.FromBase64String(base64));

            Console.WriteLine();
            Console.WriteLine($"====== And back ======");
            Console.WriteLine();

            Console.WriteLine($"original     : {uid:n}");
            Console.WriteLine($"from base32  : {fromBase32:n}");
            Console.WriteLine($"from base64  : {fromBase64:n}");

            Console.WriteLine();
            Console.WriteLine($"====== With checksum digit ======");
            Console.WriteLine();

            Console.WriteLine(AddChecksum("pay" + base32));
            Console.WriteLine(AddChecksum("evt" + base32));
            Console.WriteLine(AddChecksum("wbh" + base32));
        }

        /// <summary>
        /// Proof of concept implementation of the checksum algorithm as proposed in 
        /// Crockford's base32.Note there's certainly more efficient ways of doing this ...
        /// </summary>
        /// <param name="base32"></param>
        /// <returns></returns>
        static string AddChecksum(string base32)
        {
            var payBytes = Base32.Decode(base32);

            var bigInt = new System.Numerics.BigInteger(payBytes);
            var remainder = bigInt % 37;
            
            if(remainder.Sign < 0)
            {
                remainder += 37;
            }
            
            var checksumDigits = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567*~$9".ToLower().ToCharArray();
            var checksumDigit = checksumDigits[(byte)remainder];

            return base32 + checksumDigit;
        }
    }
}
