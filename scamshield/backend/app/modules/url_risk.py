"""
ScamShield URL Risk Scoring Module
Evaluates link and domain safety using lookalike brand detection (Levenshtein distance),
TLD risk assessment, IP-in-URL detection, homoglyphs, and URI path heuristics.

ZERO CROSS-IMPORTS:
Does not import text_risk, transaction_risk, or fusion.
Thresholds, rules, points, and brand lists are imported from app.config.
"""

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional
from urllib.parse import urlparse
import ipaddress
import re

from app.config import (
    SAFE_THRESHOLD,
    DANGEROUS_THRESHOLD,
    HIGH_RISK_TLDS,
    TARGET_BRANDS,
    SUSPICIOUS_PATH_KEYWORDS,
    URL_POINTS_IP_HOST,
    URL_POINTS_HIGH_RISK_TLD,
    URL_POINTS_BRAND_IMPERSONATION,
    URL_POINTS_TYPOSQUATTING,
    URL_POINTS_AT_SYMBOL,
    URL_POINTS_EXCESSIVE_SUBDOMAINS,
    URL_POINTS_SUSPICIOUS_PATH,
    get_verdict,
)


def levenshtein_distance(s1: str, s2: str) -> int:
    """Compute standard Levenshtein edit distance between two strings."""
    if len(s1) < len(s2):
        return levenshtein_distance(s2, s1)
    if len(s2) == 0:
        return len(s1)

    previous_row = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row

    return previous_row[-1]


@dataclass
class DomainAnalysis:
    url: str
    domain: str
    is_lookalike: bool = False
    target_brand: Optional[str] = None
    levenshtein_distance: Optional[int] = None
    high_risk_tld: bool = False
    has_ip_host: bool = False
    suspicious_path_detected: bool = False
    score: int = 0
    reasons: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "url": self.url,
            "domain": self.domain,
            "is_lookalike": self.is_lookalike,
            "target_brand": self.target_brand,
            "levenshtein_distance": self.levenshtein_distance,
            "high_risk_tld": self.high_risk_tld,
            "has_ip_host": self.has_ip_host,
            "suspicious_path_detected": self.suspicious_path_detected,
            "score": self.score,
            "reasons": self.reasons,
        }


@dataclass
class UrlRiskResult:
    score: int  # 0 to 100
    label: str  # Safe, Suspicious, Dangerous
    reasons: List[str] = field(default_factory=list)
    extracted_urls: List[str] = field(default_factory=list)
    domain_details: List[DomainAnalysis] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "score": self.score,
            "label": self.label,
            "reasons": self.reasons,
            "extracted_urls": self.extracted_urls,
            "domain_details": [d.to_dict() for d in self.domain_details],
        }


class UrlRiskScorer:
    """Independent URL heuristic and lookalike risk analyzer."""

    URL_REGEX = re.compile(
        r"(?:https?://|www\.)[^\s/$.?#].[^\s]*|"
        r"\b(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:/[^\s]*)?\b",
        re.IGNORECASE
    )

    def extract_urls(self, text: str) -> List[str]:
        """Extract all valid URL candidates from raw text."""
        if not text:
            return []
        matches = self.URL_REGEX.findall(text)
        cleaned: List[str] = []
        for m in matches:
            url = m.strip(".,;:()[]{}<>\"'")
            if "." in url and not url.endswith("."):
                cleaned.append(url)
        return list(dict.fromkeys(cleaned))

    def _analyze_single_url(self, raw_url: str) -> DomainAnalysis:
        url_to_parse = raw_url
        if not url_to_parse.startswith(("http://", "https://")):
            url_to_parse = "https://" + url_to_parse

        try:
            parsed = urlparse(url_to_parse)
            hostname = (parsed.hostname or "").lower()
            path = (parsed.path or "").lower()
        except Exception:
            hostname = raw_url.lower()
            path = ""

        analysis = DomainAnalysis(url=raw_url, domain=hostname)
        score = 0
        reasons: List[str] = []

        # 1. IP Address Host Check
        is_ip = False
        try:
            ipaddress.ip_address(hostname)
            is_ip = True
            analysis.has_ip_host = True
            score += URL_POINTS_IP_HOST
            reasons.append("Host is a direct raw IP address instead of a recognized domain")
        except ValueError:
            pass

        # 2. Extract domain core and TLD
        host_parts = hostname.split(".")
        tld = host_parts[-1] if len(host_parts) > 1 else ""
        domain_core = host_parts[-2] if len(host_parts) > 1 else host_parts[0]

        # 3. High Risk TLD Check
        if tld in HIGH_RISK_TLDS:
            analysis.high_risk_tld = True
            score += URL_POINTS_HIGH_RISK_TLD
            reasons.append(f"High-risk, abuse-prone top-level domain detected (.{tld})")

        # 4. Brand Lookalike / Typosquatting / Homoglyph Detection
        if not is_ip and domain_core:
            for brand in TARGET_BRANDS:
                if brand in domain_core and domain_core != brand:
                    analysis.is_lookalike = True
                    analysis.target_brand = brand
                    score += URL_POINTS_BRAND_IMPERSONATION
                    reasons.append(f"Domain impersonates legitimate brand '{brand}' ({domain_core})")
                    break
                elif domain_core != brand:
                    dist = levenshtein_distance(domain_core, brand)
                    if (dist == 1 and len(brand) >= 4) or (dist == 2 and len(brand) >= 7):
                        analysis.is_lookalike = True
                        analysis.target_brand = brand
                        analysis.levenshtein_distance = dist
                        score += URL_POINTS_TYPOSQUATTING
                        reasons.append(f"Typosquatted lookalike domain for '{brand}' (edit distance: {dist})")
                        break

        # 5. @ Symbol in URL (credential/userinfo redirect trick)
        if "@" in raw_url:
            score += URL_POINTS_AT_SYMBOL
            reasons.append("URL contains '@' symbol (user-info obfuscation technique)")

        # 6. Excessive subdomains
        if len(host_parts) > 3 and not is_ip:
            score += URL_POINTS_EXCESSIVE_SUBDOMAINS
            reasons.append(f"Excessive subdomains detected ({len(host_parts)} levels)")

        # 7. Suspicious Path Keywords
        matched_paths = [kw for kw in SUSPICIOUS_PATH_KEYWORDS if kw in path]
        if matched_paths:
            analysis.suspicious_path_detected = True
            score += URL_POINTS_SUSPICIOUS_PATH
            reasons.append(f"Sensitive credential/banking path keyword detected: {', '.join(matched_paths[:3])}")

        # Clamp single URL score to 100
        analysis.score = min(100, score)
        analysis.reasons = reasons
        return analysis

    def analyze(self, text_or_urls: str | List[str]) -> UrlRiskResult:
        """
        Extract and score all URLs from text or evaluate provided URL list.
        Returns aggregate UrlRiskResult with 0-100 integer score.
        """
        urls: List[str] = []
        if isinstance(text_or_urls, list):
            urls = text_or_urls
        elif isinstance(text_or_urls, str):
            urls = self.extract_urls(text_or_urls)

        if not urls:
            return UrlRiskResult(
                score=0,
                label=get_verdict(0),
                reasons=["Low detected risk: No URLs or external links found in message content"],
                extracted_urls=[],
                domain_details=[]
            )

        details: List[DomainAnalysis] = []
        for u in urls:
            details.append(self._analyze_single_url(u))

        # Highest risk domain dictates the overall URL score
        max_score = max((d.score for d in details), default=0)
        all_reasons: List[str] = []
        for d in details:
            all_reasons.extend(d.reasons)

        if not all_reasons and max_score < SAFE_THRESHOLD:
            all_reasons.append("Low detected risk: Evaluated URLs do not exhibit known lookalike or suspicious TLD patterns")

        label = get_verdict(max_score)

        return UrlRiskResult(
            score=max_score,
            label=label,
            reasons=list(dict.fromkeys(all_reasons)),
            extracted_urls=urls,
            domain_details=details,
        )


# Global singleton instance
default_url_scorer = UrlRiskScorer()

def score_url_risk(text_or_urls: str | List[str]) -> UrlRiskResult:
    """Convenience function to score URL risk using default scorer."""
    return default_url_scorer.analyze(text_or_urls)
