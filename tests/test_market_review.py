# -*- coding: utf-8 -*-
"""Tests for localized market review wrappers."""

import importlib
import sys
import unittest
from types import ModuleType, SimpleNamespace
from unittest.mock import MagicMock, patch

from tests.litellm_stub import ensure_litellm_stub

ensure_litellm_stub()

def _build_optional_module_stubs() -> dict[str, ModuleType]:
    stubs: dict[str, ModuleType] = {}
    google_module: ModuleType | None = None

    for module_name in ("google.generativeai", "google.genai", "anthropic"):
        try:
            importlib.import_module(module_name)
            continue
        except ImportError:
            stub = ModuleType(module_name)
            stubs[module_name] = stub
            if not module_name.startswith("google."):
                continue
            if google_module is None:
                try:
                    google_module = importlib.import_module("google")
                except ImportError:
                    google_module = ModuleType("google")
                    stubs["google"] = google_module
            setattr(google_module, module_name.split(".", 1)[1], stub)

    return stubs


with patch.dict(sys.modules, _build_optional_module_stubs()):
    import src.core.market_review as market_review_module

run_market_review = market_review_module.run_market_review


class MarketReviewLocalizationTestCase(unittest.TestCase):
    def _make_report_service(self) -> MagicMock:
        report_service = MagicMock()
        report_service.save_report_to_file.return_value = "/tmp/market_review.md"
        return report_service

    def test_run_market_review_uses_english_report_title(self) -> None:
        report_service = self._make_report_service()
        market_analyzer = MagicMock()
        market_analyzer.run_daily_review.return_value = "## 2026-04-10 A-share Market Recap\n\nBody"

        with patch.object(
            market_review_module,
            "get_config",
            return_value=SimpleNamespace(report_language="en", market_review_region="cn"),
        ), patch.object(market_review_module, "MarketAnalyzer", return_value=market_analyzer):
            result = run_market_review(report_service)

        self.assertEqual(result, "## 2026-04-10 A-share Market Recap\n\nBody")
        saved_content = report_service.save_report_to_file.call_args.args[0]
        self.assertTrue(saved_content.startswith("# 🎯 Market Review\n\n"))

    def test_run_market_review_merges_both_regions_with_english_wrappers(self) -> None:
        report_service = self._make_report_service()
        cn_analyzer = MagicMock()
        cn_analyzer.run_daily_review.return_value = "CN body"
        us_analyzer = MagicMock()
        us_analyzer.run_daily_review.return_value = "US body"

        with patch.object(
            market_review_module,
            "get_config",
            return_value=SimpleNamespace(report_language="en", market_review_region="both"),
        ), patch.object(
            market_review_module,
            "MarketAnalyzer",
            side_effect=[cn_analyzer, us_analyzer],
        ):
            result = run_market_review(report_service)

        self.assertIn("# A-share Market Recap\n\nCN body", result)
        self.assertIn("> US market recap follows", result)
        self.assertIn("# US Market Recap\n\nUS body", result)
        saved_content = report_service.save_report_to_file.call_args.args[0]
        self.assertTrue(saved_content.startswith("# 🎯 Market Review\n\n"))


if __name__ == "__main__":
    unittest.main()
