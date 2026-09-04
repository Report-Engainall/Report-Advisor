import sys
from decimal import Decimal
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.numeric_normalization import normalize_numeric_text


def test_arabic_and_western_numeric_forms_are_deterministic() -> None:
    cases = {
        "١٢٣٤٥٦": "123456",
        "١٢٣٫٤٥": "123.45",
        "١٢٣٬٤٥٦": "123456",
        "١٢٣٬٤٥٦٫٧٨": "123456.78",
        "123٬456٫78": "123456.78",
        "١٢٣,٤٥٦.٧٨": "123456.78",
        "1,234.56": "1234.56",
        "١٢٣٫٤٥": "123.45",
        "-١٢٣٫٤٥": "-123.45",
        "١٢٣\u00a0٬\u00a045٦": "123456",
        "١٢٣\u202f٫٤٥": "123.45",
    }
    for raw, expected in cases.items():
        assert normalize_numeric_text(raw) == Decimal(expected), raw


def test_empty_malformed_and_ambiguous_values_fail_closed() -> None:
    for raw in (None, "", "   ", "not-a-number", "١٢٣٤x", "NaN", "Infinity", "1,23,456", "1..2", "1,234,56"):
        assert normalize_numeric_text(raw) is None, raw


def test_zero_negative_and_very_large_finite_values_are_preserved() -> None:
    assert normalize_numeric_text("0") == Decimal("0")
    assert normalize_numeric_text("-0") == Decimal("0")
    assert normalize_numeric_text("-١٢٣") == Decimal("-123")
    assert normalize_numeric_text("999999999999999999999999.99") == Decimal("999999999999999999999999.99")
    assert normalize_numeric_text("9" * 400) == Decimal("9" * 400)
