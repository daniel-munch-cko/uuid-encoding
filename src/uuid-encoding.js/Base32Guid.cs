using System;

namespace uuid_encoding
{
    public class Base32Guid
    {
        public static string Create()
        {
            return Base32.Encode(Guid.NewGuid().ToByteArray());
        }
    }
}