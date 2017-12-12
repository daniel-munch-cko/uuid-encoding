using System;

namespace uuid_encoding
{
    class Program
    {
        static void Main(string[] args)
        {
            var uid = Guid.NewGuid();
            var uidBytes = uid.ToByteArray();
            
            var base32 = Base32.Encode(uidBytes).ToLowerInvariant();
            var base64 = Convert.ToBase64String(uidBytes);

            Console.WriteLine($"base16: {uid:n}");
            Console.WriteLine($"base32: {Base32.Encode(uidBytes).ToLowerInvariant()}");
            Console.WriteLine($"base64: {Convert.ToBase64String(uidBytes)}");

            
            var fromBase32 = new Guid(Base32.Decode(base32));
            var fromBase64 = new Guid(Convert.FromBase64String(base64));

            Console.WriteLine();
            Console.WriteLine($"====== And back ======");
            Console.WriteLine();
            
            Console.WriteLine($"original    : {uid:n}");
            Console.WriteLine($"from base32 : {fromBase32:n}");
            Console.WriteLine($"from base64 : {fromBase64:n}");
        }
    }
}
