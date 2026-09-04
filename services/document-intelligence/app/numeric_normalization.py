from __future__ import annotations

import re
from decimal import Decimal, InvalidOperation

_ARABIC_DIGITS = str.maketrans("٠١٢٣٤٥٦٧٨٩", "0123456789")
_SEPARATORS = str.maketrans({"٫": ".", "٬": ",", "،": ",", "﹐": ",", "﹒": ".", "．": "."})
_SPACE_RE = re.compile(r"[\s\u00a0\u202f\u2009]+")
_ALLOWED_RE = re.compile(r"^[+-]?[0-9.,]+$")


def normalize_numeric_text(value: object) -> Decimal | None:
    """Normalize Arabic/Western numeric text without coercing empty/malformed input to zero.

    A single Western comma is treated as a decimal separator for 1-2 fractional digits,
    and as a thousands separator for exactly 3 digits. When both comma and dot occur,
    the right-most separator is decimal and the other separator is thousands.
    Arabic decimal/thousands separators are explicit and are never guessed.
    """
    if value is None:
        return None
    if isinstance(value, bool):
        return None
    if isinstance(value, (int, float, Decimal)):
        try:
            number = Decimal(str(value))
        except (InvalidOperation, ValueError):
            return None
        return number if number.is_finite() else None
    if not isinstance(value, str):
        return None

    text = _SPACE_RE.sub("", value.translate(_ARABIC_DIGITS).translate(_SEPARATORS))
    if not text or not _ALLOWED_RE.fullmatch(text):
        return None
    if text.count("+") + text.count("-") > 1 or ("+" in text[1:] or "-" in text[1:]):
        return None

    sign = ""
    if text[:1] in {"+", "-"}:
        sign, text = text[0], text[1:]
    if not text or not text.replace(",", "").replace(".", "").isdigit():
        return None

    commas, dots = text.count(","), text.count(".")
    if commas and dots:
        decimal_sep = "," if text.rfind(",") > text.rfind(".") else "."
        thousands_sep = "." if decimal_sep == "," else ","
        integer, fraction = text.rsplit(decimal_sep, 1)
        if not fraction.isdigit() or not integer.replace(thousands_sep, "").isdigit():
            return None
        groups = integer.split(thousands_sep)
        if len(groups) > 1 and (len(groups[0]) not in range(1, 4) or any(len(g) != 3 for g in groups[1:])):
            return None
        normalized = "".join(groups) + "." + fraction
    elif commas:
        groups = text.split(",")
        if len(groups) == 2 and len(groups[1]) in (1, 2):
            normalized = groups[0] + "." + groups[1]
        elif len(groups) >= 2 and all(len(g) == 3 for g in groups[1:]) and len(groups[0]) in range(1, 4):
            normalized = "".join(groups)
        else:
            return None
    elif dots:
        groups = text.split(".")
        if len(groups) == 2 and len(groups[1]) <= 2:
            normalized = groups[0] + "." + groups[1]
        elif len(groups) >= 2 and all(len(g) == 3 for g in groups[1:]) and len(groups[0]) in range(1, 4):
            normalized = "".join(groups)
        else:
            return None
    else:
        normalized = text

    try:
        number = Decimal(f"{sign}{normalized}")
    except InvalidOperation:
        return None
    return number if number.is_finite() else None
