from pathlib import Path
import unittest


ROUTER_TEXT = Path("api/v1/router.py").read_text(encoding="utf-8")


def test_portfolio_routes_are_not_registered_in_trimmed_api_surface():
    assert "portfolio" not in ROUTER_TEXT


def test_backtest_routes_are_not_registered_in_trimmed_api_surface():
    assert "backtest" not in ROUTER_TEXT


def test_agent_tool_registry_excludes_backtest_tools():
    factory_text = Path("src/agent/factory.py").read_text(encoding="utf-8")

    assert "backtest_tools" not in factory_text
    assert "ALL_BACKTEST_TOOLS" not in factory_text


def test_portfolio_agent_is_removed_from_trimmed_agent_set():
    agents_init = Path("src/agent/agents/__init__.py").read_text(encoding="utf-8")

    assert not Path("src/agent/agents/portfolio_agent.py").exists()
    assert "PortfolioAgent" not in agents_init


class TestTrimmedNotificationSurface(unittest.TestCase):
    def test_analysis_runtime_no_longer_exposes_push_toggles(self):
        forbidden_by_path = {
            "main.py": [
                "--no-notify",
                "--single-notify",
                "no_notify",
                "single_notify",
                "merge_notification",
            ],
            "src/core/pipeline.py": [
                "send_notification",
                "single_stock_notify",
                "merge_notification",
                "_send_notifications",
                "_send_single_stock_notification",
                "NotificationChannel",
            ],
            "src/core/market_review.py": [
                "send_notification",
                "merge_notification",
                "notifier.send",
            ],
        }
        for path, forbidden in forbidden_by_path.items():
            text = Path(path).read_text(encoding="utf-8")
            for token in forbidden:
                self.assertNotIn(token, text, f"{token} still found in {path}")

    def test_bot_notification_channels_are_removed_from_runtime_surface(self):
        forbidden = [
            "TELEGRAM_BOT_TOKEN",
            "TELEGRAM_CHAT_ID",
            "DISCORD_BOT_TOKEN",
            "DISCORD_MAIN_CHANNEL_ID",
            "DISCORD_WEBHOOK_URL",
            "SLACK_BOT_TOKEN",
            "SLACK_CHANNEL_ID",
            "SLACK_WEBHOOK_URL",
            "TelegramSender",
            "DiscordSender",
            "SlackSender",
            "send_to_telegram",
            "send_to_discord",
            "send_to_slack",
        ]
        paths = [
            "src/config.py",
            "src/core/config_registry.py",
            "src/report_service.py",
            "src/core/pipeline.py",
        ]
        self.assertFalse(Path("src/notification_sender").exists())
        for path in paths:
            text = Path(path).read_text(encoding="utf-8")
            for token in forbidden:
                self.assertNotIn(token, text, f"{token} still found in {path}")

    def test_bot_notification_channels_are_removed_from_user_docs(self):
        forbidden = [
            "WECHAT_WEBHOOK_URL",
            "FEISHU_WEBHOOK_URL",
            "FEISHU_WEBHOOK_SECRET",
            "FEISHU_WEBHOOK_KEYWORD",
            "EMAIL_SENDER",
            "EMAIL_PASSWORD",
            "PUSHPLUS_TOKEN",
            "SERVERCHAN3_SENDKEY",
            "CUSTOM_WEBHOOK_URLS",
            "SINGLE_STOCK_NOTIFY",
            "REPORT_SUMMARY_ONLY",
            "MERGE_EMAIL_NOTIFICATION",
            "MARKDOWN_TO_IMAGE_CHANNELS",
            "--no-notify",
            "通知渠道",
            "推送相关",
            "机器人推送",
            "Notification Channel",
            "notification channels",
            "TELEGRAM_BOT_TOKEN",
            "TELEGRAM_CHAT_ID",
            "TELEGRAM_MESSAGE_THREAD_ID",
            "DISCORD_WEBHOOK_URL",
            "DISCORD_BOT_TOKEN",
            "DISCORD_MAIN_CHANNEL_ID",
            "SLACK_BOT_TOKEN",
            "SLACK_CHANNEL_ID",
            "SLACK_WEBHOOK_URL",
            "Telegram",
            "Discord",
            "Slack",
        ]
        paths = [
            ".env.example",
            "README.md",
            "docs/README_EN.md",
            "docs/README_CHT.md",
            "docs/full-guide.md",
            "docs/full-guide_EN.md",
            "docs/FAQ.md",
            "docs/FAQ_EN.md",
            "docs/DEPLOY.md",
            "docs/DEPLOY_EN.md",
        ]
        for path in paths:
            text = Path(path).read_text(encoding="utf-8")
            for token in forbidden:
                self.assertNotIn(token, text, f"{token} still found in {path}")
