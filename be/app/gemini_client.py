from __future__ import annotations

import os
from typing import List, Optional

from dotenv import load_dotenv

try:
    import google.generativeai as genai
except Exception:  # pragma: no cover
    genai = None  # type: ignore

from .schemas import Message, Thread


load_dotenv()  # load .env if present


def _get_api_key() -> Optional[str]:
    return os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")


def is_configured() -> bool:
    return _get_api_key() is not None and genai is not None


def _ensure_configured() -> bool:
    key = _get_api_key()
    if not key or genai is None:
        return False
    genai.configure(api_key=key)
    return True


def generate_reply(thread: Thread, history: List[Message], user_text: str, *, model_name: str = "gemini-1.5-flash") -> Optional[str]:
    """
    Create a short, helpful reply for the student's issue, considering the school's routing process.
    Returns None if Gemini is not configured or call fails.
    """
    if not _ensure_configured():
        return None

    system_preamble = (
        "Bạn là trợ lý hỗ trợ sinh viên của Phòng Quản lý Sinh viên. "
        "Hãy tiếp nhận ý kiến, tóm tắt ngắn gọn vấn đề, hướng dẫn các bước cần làm, "
        "và cho biết sẽ chuyển vấn đề đến phòng/khoa/trung tâm phù hợp nếu cần. "
        "Giữ câu trả lời ngắn gọn, rõ ràng, dùng tiếng Việt thân thiện và lịch sự."
    )

    meta = []
    if thread.student_name:
        meta.append(f"Sinh viên: {thread.student_name}")
    if thread.department:
        meta.append(f"Khoa/Phòng: {thread.department}")
    if thread.topic:
        meta.append(f"Chủ đề: {thread.topic}")
    meta_text = "\n".join(meta)

    # Prepare history in simple format
    turns = []
    for m in history[-10:]:
        role = "user" if m.sender == "student" else "model"
        turns.append({"role": role, "parts": [m.text]})

    prompt = f"""{system_preamble}
---
Thông tin cuộc trò chuyện:
{meta_text}
---
Tin nhắn mới từ sinh viên:
{user_text}
"""

    try:
        model = genai.GenerativeModel(model_name)
        resp = model.generate_content([
            {"role": "user", "parts": [prompt]},
            *turns,
        ])
        text = getattr(resp, "text", None)
        if not text and hasattr(resp, "candidates") and resp.candidates:
            # Fallback if text property not present
            parts = getattr(resp.candidates[0].content, "parts", [])
            text = "".join(getattr(p, "text", "") for p in parts)
        return (text or None)
    except Exception:
        return None
