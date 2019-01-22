# uuid encoding

Shows 3 differents ways of encoding a .NET `Guid`.

```console
base16 : 9703ddc67e9e4b33a4226e8c8041a1e7
base32 : y3oqhf46pyzuxjbcn2giaqnb44
zbase32: a5qo8fh6xa3wzjbnp4geyopbhh
base64 : xt0Dl55+M0ukIm6MgEGh5w==

====== And back ======

original     : 9703ddc67e9e4b33a4226e8c8041a1e7
from base32  : 9703ddc67e9e4b33a4226e8c8041a1e7
from zbase32 : 9703ddc67e9e4b33a4226e8c8041a1e7
from base64  : 9703ddc67e9e4b33a4226e8c8041a1e7
```

## Length considerations

The following table gives the amount of digits we need in the different bases to represent an integer of 128 bits.

| Base   | Formule                               | Digits |
| ------ |:-------------------------------------:| ------:|
| base16 | `128 / (ln(32)/ln(2)) = 32`           | 32     |
| base32 | `128 / (ln(32)/ln(2)) = 25,6`         | 26     |
| base36 | `128 / (ln(36)/ln(2)) = 24,758579663` | 25     |
| base64 | `128 / (ln(64)/ln(2)) = 21,333333333` | 22     |


## Alphabet

| Base   | Formule                               | Notes     |
| ------ |:-------------------------------------:|-----------|
| base16 | `0123456789ABCDEF`                    |           |
| base32 | `ABCDEFGHIJKLMNOPQRSTUVWXYZ234567`    | [RFC4648](https://tools.ietf.org/html/rfc4648) |
| base36 | `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ`||
| base64 | `A–Z, a–z, 0–9`                       |[RFC4648](https://tools.ietf.org/html/rfc4648) |

While base32 and base36 are pretty close in number of digits  their major difference lies in the choice of the alphabet. For base36 the whole latin alphbet and decimal digits from 0 to 9 are used, whereas in base32 one has the choice of ommitting 4 digits from the base36 alphabet. 

The different flavors of base32 alphabets come from different criteria for omitting base36 digits.

- [z-base-32](https://en.wikipedia.org/wiki/Base32#z-base-32)
- [Crockford's base32](https://www.crockford.com/wrmg/base32.html) with additional, optional checksum digit
- [RFC4648](https://tools.ietf.org/html/rfc4648)

## Checksum

From [Crockford's base32](https://www.crockford.com/wrmg/base32.html) 

> An application may append a check symbol to a symbol string. This check symbol can be used to detect wrong-symbol and transposed-symbol errors. This allows for detecting transmission and entry errors early and inexpensively.

> The check symbol encodes the number modulo 37, 37 being the least prime number greater than 32. We introduce 5 additional symbols that are used only for encoding or decoding the check symbol.

>The additional symbols were selected to not be confused with punctuation or with URL formatting.

```console
====== With checksum digit ======

paywfhpnykj77weppsb22upiuddqac
evtwfhpnykj77weppsb22upiuddqaq
wbhwfhpnykj77weppsb22upiuddqaf
```

## Conclusion and recommondation

As a compromise between length, readability and case-insensitivity (base64 isn't) I'd go for base32 with the standard RFC4648 alphabet.

## Base32 - Properties of Decode and Encode Functions

The method `Encode` is an injective function, that is each byte array results in a unique encoded string. However, it is not a surjective function. In other words, not every string (in the defined alphabet) has a corresponding byte array whose encoding would result this string.
On the other hand, in the initial implementation, the function `Decode` is defined for any string in the defined alphabet. 
In the case of the above mentioned strings, this was made possible by ignoring bits that would remain after the decoding and returning basically a byte array that would result a completely different string at encoding (rows 1-5): 

### Example:

|   | Input string                  | Guid resulting from the Encoding       | Remaining Bits (amount) | Remaining Buffer (binary) | 
|:-:|:-----------------------------:|:--------------------------------------:|:-----------------------:|:-------------------------:|
| 1 | `aaaaaaaaaaaaaaaaaaaaaaaaaa`  | `00000000-0000-0000-0000-000000000000` | 0                       | 0                         |
| 2 | `aaaaaaaaaaaaaaaaaaaaaaaaab`  | `00000000-0000-0000-0000-000000000000` | 1                       | 1                         |
| 3 | `aaaaaaaaaaaaaaaaaaaaaaaaac`  | `00000000-0000-0000-0000-000000000000` | 2                       | 10                        |
| 4 | `aaaaaaaaaaaaaaaaaaaaaaaaad`  | `00000000-0000-0000-0000-000000000000` | 3                       | 11                        |
| 5 | `aaaaaaaaaaaaaaaaaaaaaaaaaaa` | `00000000-0000-0000-0000-000000000000` | 7                       | 0                         |
| 6 | `aaaaaaaaaaaaaaaaaaaaaaaaae`  | `00000000-0000-0000-0000-000000000001` | 0                       | 0                         | 

Since we wish the functions `Encoode` and `Decode` to be the exact inverse functions of each other, we shall limit the domain of the `Decode` method - by ruling out such string as invalid input (rows 2-5).