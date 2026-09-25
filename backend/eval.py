"""
ScamShield Evaluation Engine
Calculates Precision, Recall, F1-score, Confusion Matrix, and Granular Performance
across Text Risk, URL Risk, and Multi-modal Fused Verdicts on the benchmark dataset.
"""

import json
from pathlib import Path
import sys

# Ensure backend root is on sys.path
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

from app.modules.text_risk import TextRiskScorer
from app.modules.url_risk import UrlRiskScorer
from app.modules.fusion import FusionEngine


def evaluate():
    eval_path = backend_dir / "data" / "eval_dataset.json"
    if not eval_path.exists():
        print(f"Error: Evaluation file not found at {eval_path}")
        return

    with open(eval_path, "r", encoding="utf-8") as f:
        dataset = json.load(f)

    text_scorer = TextRiskScorer()
    url_scorer = UrlRiskScorer()
    fusion_engine = FusionEngine()

    print(f"\n=======================================================================")
    print(f"               SCAMSHIELD BENCHMARK EVALUATION REPORT                 ")
    print(f"=======================================================================\n")
    print(f"Total benchmark samples: {len(dataset)}")
    print(f"{'ID':<3} | {'Category':<22} | {'Text Sc':<7} | {'URL Sc':<7} | {'Fused Sc':<8} | {'Verdict':<10} | {'Expected':<10} | {'Status'}")
    print("-" * 92)

    y_true = []
    y_pred_binary = []  # 1 for Suspicious or Dangerous, 0 for Safe

    tp = fp = tn = fn = 0
    correct_verdicts = 0

    for item in dataset:
        text = item["text"]
        gt = item["ground_truth"]  # 1 or 0
        expected_verdict = item["expected_verdict"]

        # Run independent scorers
        t_res = text_scorer.analyze(text)
        u_res = url_scorer.analyze(text)

        has_urls = len(u_res.extracted_urls) > 0

        # Run fusion
        f_res = fusion_engine.fuse(
            text_score=t_res.score,
            url_score=u_res.score,
            has_urls=has_urls,
            text_reasons=t_res.reasons,
            url_reasons=u_res.reasons
        )

        verdict = f_res.verdict
        pred_binary = 0 if verdict == "Safe" else 1

        y_true.append(gt)
        y_pred_binary.append(pred_binary)

        if gt == 1 and pred_binary == 1:
            tp += 1
        elif gt == 0 and pred_binary == 1:
            fp += 1
        elif gt == 0 and pred_binary == 0:
            tn += 1
        elif gt == 1 and pred_binary == 0:
            fn += 1

        is_correct_verdict = (verdict == expected_verdict)
        if is_correct_verdict:
            correct_verdicts += 1

        status_str = "[MATCH]" if is_correct_verdict else "[DIFF]"
        print(f"{item['id']:<3} | {item['category']:<22} | {t_res.score:<7} | {u_res.score:<7} | {f_res.overall_score:<8.1f} | {verdict:<10} | {expected_verdict:<10} | {status_str}")

    # Metrics
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0
    accuracy = (tp + tn) / len(dataset) if dataset else 0.0
    verdict_accuracy = correct_verdicts / len(dataset) if dataset else 0.0

    print("\n" + "=" * 50)
    print("                METRICS SUMMARY                 ")
    print("=" * 50)
    print(f"Accuracy (Binary Scam vs Safe) : {accuracy * 100:.2f}%")
    print(f"Verdict Exact Match Accuracy   : {verdict_accuracy * 100:.2f}%")
    print(f"Precision                      : {precision * 100:.2f}%")
    print(f"Recall                         : {recall * 100:.2f}%")
    print(f"F1-Score                       : {f1 * 100:.2f}%")
    print("-" * 50)
    print("Confusion Matrix:")
    print(f"  True Positives  (TP): {tp:<4} | False Positives (FP): {fp:<4}")
    print(f"  False Negatives (FN): {fn:<4} | True Negatives  (TN): {tn:<4}")
    print("=" * 50 + "\n")

    report_data = {
        "samples_count": len(dataset),
        "accuracy": round(accuracy, 4),
        "verdict_accuracy": round(verdict_accuracy, 4),
        "precision": round(precision, 4),
        "recall": round(recall, 4),
        "f1_score": round(f1, 4),
        "confusion_matrix": {"tp": tp, "fp": fp, "tn": tn, "fn": fn}
    }
    return report_data


if __name__ == "__main__":
    evaluate()
