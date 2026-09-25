"""
Unit tests for url_risk.py module
Verifies lookalike domain detection, brand typosquatting, TLD heuristics, and zero cross-imports.
"""

import ast
from app.modules.url_risk import UrlRiskScorer, score_url_risk, levenshtein_distance, UrlRiskResult


def test_zero_cross_imports():
    """Verify via AST that url_risk.py does NOT import text_risk, transaction_risk, or fusion."""
    import app.modules.url_risk as ur_module
    with open(ur_module.__file__, "r", encoding="utf-8") as f:
        tree = ast.parse(f.read())
    
    forbidden = ["text_risk", "transaction_risk", "fusion"]
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                for fb in forbidden:
                    assert fb not in alias.name, f"Forbidden import: {alias.name}"
        elif isinstance(node, ast.ImportFrom):
            mod = node.module or ""
            for fb in forbidden:
                assert fb not in mod, f"Forbidden import from: {mod}"


def test_levenshtein_distance():
    assert levenshtein_distance("paypal", "paypal") == 0
    assert levenshtein_distance("paypa1", "paypal") == 1
    assert levenshtein_distance("chase", "chsse") == 1
    assert levenshtein_distance("amazon", "amzon") == 1


def test_safe_urls():
    scorer = UrlRiskScorer()
    res = scorer.analyze("https://www.google.com/search?q=weather")
    assert res.score < 40
    assert res.label == "Safe"

    res_empty = scorer.analyze("Hello there is no link in this message")
    assert res_empty.score == 0
    assert res_empty.label == "Safe"


def test_typosquatting_and_lookalike_detection():
    scorer = UrlRiskScorer()
    # Typosquatted domain with high-risk TLD
    res = scorer.analyze("http://paypal-security-center.xyz/login")
    assert res.score >= 75
    assert res.label == "Dangerous"
    assert len(res.domain_details) == 1
    domain_info = res.domain_details[0]
    assert domain_info.high_risk_tld is True
    assert domain_info.is_lookalike is True
    assert domain_info.target_brand == "paypal"


def test_ip_address_host_detection():
    scorer = UrlRiskScorer()
    res = scorer.analyze("http://192.168.1.100/secure/login.php")
    assert res.score >= 50
    assert any("raw ip" in r.lower() for r in res.reasons)
