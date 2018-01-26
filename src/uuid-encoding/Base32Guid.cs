using System;

namespace uuid_encoding
{
    public static class Base32Guid 
    {
        public static Guid FromBase32(string base32)
            => new Guid(Base32.Decode(base32));

        public static string ToBase32(Guid guid)
            => Base32.Encode(guid.ToByteArray());
    }
}