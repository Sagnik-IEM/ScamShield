"""
Verification script for config.py in isolation.
Tests:
1. Verdict boundaries:
   - Safe (< 40)
   - Suspicious (40 - 74)
   - Dangerous (>= 75)
2. Weighted calculation:
   - Text score = 86, URL score = 94
   - Weights = 0.55 / 0.45
   - Weighted score = 0.55 * 86 + 0.45 * 94 = 47.3 + 42.3 = 89.6
   - Verify verdict is 'Dangerous' under the corrected thresholds.
"""

import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.config import (
    SAFE_THRESHOLD,
    DANGEROUS_THRESHOLD,
    TEXT_WEIGHT,
    URL_WEIGHT,
    get_verdict,
)

def run_verification():
    print("=== ScamShield Config Verification ===")
    print(f"Safe Threshold: score < {SAFE_THRESHOLD} -> Safe")
    print(f"Suspicious Threshold: {SAFE_THRESHOLD} <= score < {DANGEROUS_THRESHOLD} -> Suspicious")
    print(f"Dangerous Threshold: score >= {DANGEROUS_THRESHOLD} -> Dangerous")
    print("-" * 50)

    # Boundary tests
    test_cases = [
        (0, "Safe"),
        (39, "Safe"),
        (39.9, "Safe"),
        (40, "Suspicious"),
        (55, "Suspicious"),
        (74, "Suspicious"),
        (74.9, "Suspicious"),
        (75, "Dangerous"),
        (85, "Dangerous"),
        (100, "Dangerous"),
    ]

    for score, expected in test_cases:
        verdict = get_verdict(score)
        assert verdict == expected, f"Expected {expected} for score {score}, got {verdict}"
        print(f"Score {score:5.1f} -> Verdict: {verdict:10s} [PASS]")

    print("-" * 50)
    # Target weighted calculation test:
    text_score = 86
    url_score = 94
    weighted_score = (TEXT_WEIGHT * text_score) + (URL_WEIGHT * url_score)
    verdict = get_verdict(weighted_score)

    print(f"Text Score: {text_score} (weight: {TEXT_WEIGHT})")
    print(f"URL Score:  {url_score} (weight: {URL_WEIGHT})")
    print(f"Weighted:   {TEXT_WEIGHT} * {text_score} + {URL_WEIGHT} * {url_score} = {weighted_score:.1f}")
    print(f"Verdict:    {verdict}")

    assert abs(weighted_score - 89.6) < 1e-5, f"Expected 89.6, got {weighted_score}"
    assert verdict == "Dangerous", f"Expected Dangerous, got {verdict}"
    print(f"[PASS] 86/94 -> weighted {weighted_score:.1f} correctly maps to '{verdict}'!")
    print("=======================================")

if __name__ == "__main__":
    run_verification()
