"""Original short UI tones. No third-party samples."""

from __future__ import annotations

import math
import struct
import wave
from pathlib import Path

SR = 22050
OUT = Path(__file__).resolve().parents[1] / "public" / "sfx"


def tone(freq: float, t: float, decay: float = 8.0) -> float:
    return math.sin(2 * math.pi * freq * t) * math.exp(-decay * t)


def write(name: str, samples: list[float], peak: float = 0.8) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    loudest = max(abs(sample) for sample in samples) or 1
    path = OUT / name
    with wave.open(str(path), "w") as handle:
        handle.setnchannels(1)
        handle.setsampwidth(2)
        handle.setframerate(SR)
        frames = bytearray()
        for sample in samples:
            value = max(-1.0, min(1.0, sample / loudest * peak))
            frames += struct.pack("<h", int(value * 32767))
        handle.writeframes(frames)
    print(name, len(samples), path.stat().st_size)


def render(duration: float) -> list[float]:
    return [0.0] * int(SR * duration)


def add_note(samples: list[float], start: float, freq: float, length: float, decay: float, gain: float) -> None:
    begin = int(start * SR)
    count = int(length * SR)
    for i in range(count):
        index = begin + i
        if index >= len(samples):
            break
        t = i / SR
        attack = min(1.0, t / 0.008)
        samples[index] += gain * attack * tone(freq, t, decay)


def tap() -> list[float]:
    samples = render(0.055)
    for i in range(len(samples)):
        t = i / SR
        noise = ((i * 17) % 100) / 100 - 0.5
        samples[i] = (0.35 * noise + tone(2100, t, 55) * 0.7) * math.exp(-70 * t)
    return samples


def correct() -> list[float]:
    samples = render(0.48)
    for start, freq in ((0.0, 659.25), (0.09, 783.99), (0.18, 1046.5)):
        add_note(samples, start, freq, 0.3, 7.5, 0.55)
        add_note(samples, start, freq * 2.01, 0.22, 10, 0.12)
    return samples


def wrong() -> list[float]:
    samples = render(0.26)
    for i in range(len(samples)):
        t = i / SR
        freq = 210 - 80 * (t / 0.26)
        samples[i] = math.sin(2 * math.pi * freq * t) * math.exp(-9 * t) * 0.7
    return samples


def lesson() -> list[float]:
    samples = render(1.05)
    for start, freq in ((0.0, 523.25), (0.16, 659.25), (0.32, 783.99), (0.48, 1046.5)):
        add_note(samples, start, freq, 0.5, 4.5, 0.5)
        add_note(samples, start, freq * 2, 0.28, 7, 0.08)
    return samples


def streak() -> list[float]:
    samples = lesson()
    extra = render(1.35)
    extra[: len(samples)] = samples
    for start, freq in ((0.62, 1174.7), (0.74, 1318.5), (0.86, 1568.0)):
        add_note(extra, start, freq, 0.4, 6, 0.28)
    return extra


def milestone() -> list[float]:
    samples = streak()
    # Pad to hold a soft final chord.
    target = int(SR * 1.6)
    if len(samples) < target:
        samples = samples + [0.0] * (target - len(samples))
    for freq, gain in ((523.25, 0.28), (659.25, 0.22), (783.99, 0.22), (1046.5, 0.16)):
        add_note(samples, 1.05, freq, 0.5, 3.2, gain)
    return samples


def main() -> None:
    write("tap.wav", tap(), 0.55)
    write("correct.wav", correct(), 0.72)
    write("wrong.wav", wrong(), 0.5)
    write("lesson.wav", lesson(), 0.75)
    write("streak.wav", streak(), 0.75)
    write("milestone.wav", milestone(), 0.78)


if __name__ == "__main__":
    main()
