# -*- coding: utf-8 -*-
"""
===================================
Bot 消息模型兼容层
===================================

精简版保留 BotMessage/BotResponse 类型，供核心分析和通知上下文复用。
平台 Webhook、命令分发和 Stream 客户端已从主线裁剪。
"""

from bot.models import BotMessage, BotResponse, ChatType, WebhookResponse

__all__ = [
    'BotMessage',
    'BotResponse',
    'ChatType',
    'WebhookResponse',
]
