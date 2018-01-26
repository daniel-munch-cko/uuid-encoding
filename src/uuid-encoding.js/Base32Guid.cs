using System;
using Bridge;
using uuid_encoding;

public class Base32Guid
{
    public static string Create()
    {
        return Base32.Encode(Guid.NewGuid().ToByteArray());
    }

    public static string Decode(string base32Guid)
    {
        var guid = new Guid(Base32.Decode(base32Guid));
        return guid.ToString();
    }
}