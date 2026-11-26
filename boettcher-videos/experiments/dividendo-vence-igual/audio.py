"""Generate the original ten-second review soundtrack without outside assets."""

import math
import struct
import sys
import wave

RATE = 48_000
SECONDS = 10

# Start in seconds, frequency, amplitude and decay constant.
TONES = (
    (0.08, 392.00, 0.075, 3.5),
    (0.08, 523.25, 0.037, 4.5),
    (0.17, 659.25, 0.024, 4.5),
    (1.30, 311.13, 0.082, 6.5),
    (1.30, 155.56, 0.048, 5.0),
    (1.38, 233.08, 0.042, 5.5),
    (2.70, 440.00, 0.075, 4.0),
    (2.70, 220.00, 0.045, 4.5),
    (2.81, 554.37, 0.038, 4.5),
    (3.65, 329.63, 0.031, 5.0),
    (4.71, 293.66, 0.065, 3.7),
    (4.71, 146.83, 0.035, 5.0),
    (4.85, 440.00, 0.045, 3.2),
    (6.10, 293.66, 0.029, 4.5),
    (7.20, 392.00, 0.053, 2.8),
    (7.32, 523.25, 0.032, 2.8),
    (7.44, 587.33, 0.025, 2.8),
)


def write_soundtrack(path: str) -> None:
    samples = [0.0] * (SECONDS * RATE)
    for start, frequency, level, decay in TONES:
        first = round(start * RATE)
        last = min(len(samples), first + 2 * RATE)
        for index in range(first, last):
            elapsed = (index - first) / RATE
            attack = min(1.0, elapsed * 70)
            release = min(1.0, (last - index) / (RATE * 0.25))
            envelope = attack * release * math.exp(-decay * elapsed) * level
            phase = math.tau * frequency * elapsed
            samples[index] += envelope * (math.sin(phase) + 0.17 * math.sin(2 * phase))

    with wave.open(path, "wb") as output:
        output.setnchannels(1)
        output.setsampwidth(2)
        output.setframerate(RATE)
        output.writeframes(struct.pack(f"<{len(samples)}h", *(round(s * 32767) for s in samples)))


if __name__ == "__main__":
    write_soundtrack(sys.argv[1])
