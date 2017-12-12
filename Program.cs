using System;

namespace uuid_encoding
{
    class Program
    {
        static void Main(string[] args)
        {
            var uid = Guid.NewGuid();
            var uidBytes = uid.ToByteArray();
            
            Console.WriteLine($"base16: {uid:n}");
            Console.WriteLine($"base32: {Base32.Encode(uidBytes).ToLowerInvariant()}");
            Console.WriteLine($"base64: {Convert.ToBase64String(uidBytes)}");
        }
    }
}
