# -*- coding: utf-8 -*-
"""Tests for config_registry field definitions and schema building."""
import unittest

from src.core.config_registry import (
    build_schema_response,
    get_field_definition,
)


class TestRemovedBotNotificationFields(unittest.TestCase):
    """Removed Bot notification keys must not be explicitly registered."""

    _REMOVED_KEYS = (
        "TELEGRAM_BOT_TOKEN",
        "TELEGRAM_CHAT_ID",
        "TELEGRAM_MESSAGE_THREAD_ID",
        "DISCORD_WEBHOOK_URL",
        "DISCORD_BOT_TOKEN",
        "DISCORD_MAIN_CHANNEL_ID",
        "SLACK_BOT_TOKEN",
        "SLACK_CHANNEL_ID",
        "SLACK_WEBHOOK_URL",
    )

    def test_removed_fields_are_not_in_schema_response(self):
        schema = build_schema_response()
        field_keys = {
            field["key"]
            for category in schema["categories"]
            for field in category["fields"]
        }
        for key in self._REMOVED_KEYS:
            self.assertNotIn(key, field_keys)

    def test_removed_fields_fall_back_to_uncategorized_inference(self):
        for key in self._REMOVED_KEYS:
            field = get_field_definition(key)
            self.assertEqual(field["category"], "uncategorized")
            self.assertEqual(field["display_order"], 9000)


class TestRemovedLegacyAiFields(unittest.TestCase):
    """Legacy provider-specific AI keys must not be first-class settings fields."""

    _REMOVED_KEYS = (
        "AIHUBMIX_KEY",
        "DEEPSEEK_API_KEY",
        "DEEPSEEK_API_KEYS",
        "GEMINI_API_KEY",
        "GEMINI_API_KEYS",
        "GEMINI_MODEL",
        "GEMINI_MODEL_FALLBACK",
        "GEMINI_TEMPERATURE",
        "ANTHROPIC_API_KEY",
        "ANTHROPIC_API_KEYS",
        "ANTHROPIC_MODEL",
        "ANTHROPIC_TEMPERATURE",
        "ANTHROPIC_MAX_TOKENS",
        "OPENAI_API_KEY",
        "OPENAI_API_KEYS",
        "OPENAI_BASE_URL",
        "OPENAI_MODEL",
        "OPENAI_VISION_MODEL",
        "OPENAI_TEMPERATURE",
        "VISION_MODEL",
        "LITELLM_CONFIG",
    )

    def test_removed_ai_fields_are_not_in_schema_response(self):
        schema = build_schema_response()
        field_keys = {
            field["key"]
            for category in schema["categories"]
            for field in category["fields"]
        }
        for key in self._REMOVED_KEYS:
            self.assertNotIn(key, field_keys)

    def test_removed_ai_fields_fall_back_to_uncategorized_inference(self):
        for key in self._REMOVED_KEYS:
            field = get_field_definition(key)
            self.assertEqual(field["category"], "uncategorized")
            self.assertEqual(field["display_order"], 9000)

    def test_channel_backed_ai_fields_remain_registered(self):
        schema = build_schema_response()
        ai_model_cat = next(c for c in schema["categories"] if c["category"] == "ai_model")
        field_keys = {field["key"] for field in ai_model_cat["fields"]}
        self.assertIn("LLM_CHANNELS", field_keys)
        self.assertIn("LLM_TEMPERATURE", field_keys)


class TestRemovedNotificationSettingsFields(unittest.TestCase):
    """Push notification settings must not be exposed in the Web settings schema."""

    _REMOVED_KEYS = (
        "WECHAT_WEBHOOK_URL",
        "FEISHU_WEBHOOK_URL",
        "FEISHU_WEBHOOK_SECRET",
        "FEISHU_WEBHOOK_KEYWORD",
        "FEISHU_APP_ID",
        "FEISHU_APP_SECRET",
        "EMAIL_SENDER",
        "EMAIL_PASSWORD",
        "EMAIL_RECEIVERS",
        "PUSHPLUS_TOKEN",
        "CUSTOM_WEBHOOK_URLS",
        "SINGLE_STOCK_NOTIFY",
        "MERGE_EMAIL_NOTIFICATION",
    )

    def test_removed_notification_fields_are_not_in_schema_response(self):
        schema = build_schema_response()
        categories = {category["category"] for category in schema["categories"]}
        field_keys = {
            field["key"]
            for category in schema["categories"]
            for field in category["fields"]
        }

        self.assertNotIn("notification", categories)
        for key in self._REMOVED_KEYS:
            self.assertNotIn(key, field_keys)

    def test_removed_notification_fields_fall_back_to_uncategorized_inference(self):
        for key in self._REMOVED_KEYS:
            field = get_field_definition(key)
            self.assertEqual(field["category"], "uncategorized")
            self.assertEqual(field["display_order"], 9000)


class TestAnalysisReportFields(unittest.TestCase):
    """Report settings remain exposed under the analysis category."""

    def test_report_fields_are_grouped_under_analysis(self):
        schema = build_schema_response()
        analysis_cat = next(c for c in schema["categories"] if c["category"] == "analysis")
        field_keys = {field["key"] for field in analysis_cat["fields"]}

        self.assertIn("REPORT_TYPE", field_keys)
        self.assertIn("REPORT_LANGUAGE", field_keys)
        self.assertIn("REPORT_INTEGRITY_ENABLED", field_keys)


class TestSensitiveFieldsUsePasswordControl(unittest.TestCase):
    """Every is_sensitive field must use ui_control='password' to avoid
    leaking secrets in the Web settings page."""

    def test_all_sensitive_fields_use_password(self):
        schema = build_schema_response()
        violations = []
        for cat in schema["categories"]:
            for field in cat["fields"]:
                if field.get("is_sensitive") and field.get("ui_control") != "password":
                    violations.append(field["key"])
        self.assertEqual(violations, [],
                         f"Sensitive fields with non-password ui_control: {violations}")


if __name__ == "__main__":
    unittest.main()
