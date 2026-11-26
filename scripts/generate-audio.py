"""Generate Korean pronunciation mp3s for every lesson letter, syllable, and word.

Uses Microsoft neural TTS (ko-KR-SunHiNeural) via edge-tts. Letters are spoken
as their sound: vowels as the ㅇ syllable (ㅏ → 아), consonants with ㅡ (ㄱ → 그),
and ㅇ as 응. Words and syllables are spoken as written.
"""

from __future__ import annotations

import asyncio
import json
import re
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parents[1]
JAMO_TS = ROOT / "src/data/jamo.ts"
LESSONS_TS = ROOT / "src/data/lessons.ts"
AUDIO_DIR = ROOT / "public/audio"
MANIFEST_JSON = AUDIO_DIR / "manifest.json"
MANIFEST_TS = ROOT / "src/data/audio-manifest.ts"
VOICE = "ko-KR-SunHiNeural"
RATE = "-10%"

INITIALS = list("ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ")
MEDIALS = list("ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ")
FINALS = ["", *"ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ"]


def compose(initial: str, medial: str, final: str = "") -> str:
    i = INITIALS.index(initial)
    m = MEDIALS.index(medial)
    f = FINALS.index(final)
    return chr(0xAC00 + (i * 21 + m) * 28 + f)


def file_id(text: str) -> str:
    return "-".join(f"{ord(ch):x}" for ch in text) + ".mp3"


def load_jamo() -> list[tuple[str, str]]:
    text = JAMO_TS.read_text()
    return re.findall(
        r'char: "([^"]+)",\s*romanization: "[^"]*",\s*kind: "(vowel|consonant)"',
        text,
    )


def load_hangul() -> list[str]:
    text = LESSONS_TS.read_text()
    return re.findall(r'hangul: "([^"]+)"', text)


def syllables_of(word: str) -> list[str]:
    return [ch for ch in word if 0xAC00 <= ord(ch) <= 0xD7A3]


def spoken_for_jamo(char: str, kind: str) -> str:
    if kind == "vowel":
        return compose("ㅇ", char)
    if char == "ㅇ":
        return "응"
    return compose(char, "ㅡ")


def collect() -> dict[str, str]:
    """Map a UI string (what the button plays) to the Korean text to synthesize."""
    clips: dict[str, str] = {}
    consonants: list[str] = []
    vowels: list[str] = []
    for char, kind in load_jamo():
        clips[char] = spoken_for_jamo(char, kind)
        (vowels if kind == "vowel" else consonants).append(char)

    for initial in consonants:
        for medial in vowels:
            syllable = compose(initial, medial)
            clips.setdefault(syllable, syllable)

    for hangul in load_hangul():
        clips.setdefault(hangul, hangul)
        for syllable in syllables_of(hangul):
            clips.setdefault(syllable, syllable)
    return clips


async def synthesize(text: str, path: Path) -> None:
    communicate = edge_tts.Communicate(text, VOICE, rate=RATE)
    await communicate.save(str(path))


async def main() -> None:
    clips = collect()
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    spoken_to_file: dict[str, str] = {}
    jobs: list[tuple[str, Path]] = []
    for spoken in sorted(set(clips.values())):
        name = file_id(spoken)
        spoken_to_file[spoken] = name
        path = AUDIO_DIR / name
        if path.exists() and path.stat().st_size > 800:
            continue
        jobs.append((spoken, path))

    print(f"{len(clips)} clips, {len(spoken_to_file)} unique sounds, {len(jobs)} to generate")
    semaphore = asyncio.Semaphore(6)

    async def one(text: str, path: Path) -> None:
        async with semaphore:
            for attempt in range(3):
                try:
                    await synthesize(text, path)
                    if path.stat().st_size < 800:
                        raise RuntimeError(f"tiny file for {text}")
                    return
                except Exception as error:
                    print(f"retry {attempt + 1} {text}: {error}")
                    await asyncio.sleep(1 + attempt)
            raise RuntimeError(f"failed to synthesize {text}")

    await asyncio.gather(*(one(text, path) for text, path in jobs))

    manifest = {
        key: {"file": spoken_to_file[spoken], "speak": spoken}
        for key, spoken in sorted(clips.items())
    }
    MANIFEST_JSON.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
    lines = ["export const audioClips: Record<string, { file: string; speak: string }> = {"]
    for key, value in manifest.items():
        lines.append(
            f"  {json.dumps(key, ensure_ascii=False)}: "
            f"{{ file: {json.dumps(value['file'])}, speak: {json.dumps(value['speak'], ensure_ascii=False)} }},"
        )
    lines.append("}")
    lines.append("")
    MANIFEST_TS.write_text("\n".join(lines))
    print(f"wrote {MANIFEST_JSON} and {MANIFEST_TS}")


if __name__ == "__main__":
    asyncio.run(main())
