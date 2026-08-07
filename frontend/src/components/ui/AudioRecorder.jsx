import { useEffect, useRef, useState } from "react";
import {
  Mic,
  Pause,
  Play,
  Square,
  RotateCcw,
  Loader2,
  Send,
} from "lucide-react";
import Button from "./Button";

/**
 * Reusable voice recorder: record -> pause/resume -> stop -> review
 * (playback + re-record) -> submit.
 *
 * onSubmit(blob) is called only when learner confirms.
 */
export default function AudioRecorder({
  onSubmit,
  submitting,
  submitLabel = "Submit Recording",
}) {
  const [state, setState] = useState("idle");
  const [blob, setBlob] = useState(null);
  const [url, setUrl] = useState(null);
  const [error, setError] = useState(null);
  const [elapsed, setElapsed] = useState(0);

  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);

      if (url) URL.revokeObjectURL(url);

      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [url]);

  const start = async () => {
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      streamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const recordedBlob = new Blob(chunksRef.current, {
          type: "audio/webm",
        });

        setBlob(recordedBlob);
        setUrl(URL.createObjectURL(recordedBlob));
        setState("review");

        streamRef.current?.getTracks().forEach((t) => t.stop());
      };

      recorderRef.current = recorder;

      recorder.start();

      setElapsed(0);

      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);

      setState("recording");
    } catch {
      setError(
        "Microphone access was denied or is unavailable in this browser.",
      );
    }
  };

  const pause = () => {
    recorderRef.current?.pause();
    clearInterval(timerRef.current);
    setState("paused");
  };

  const resume = () => {
    recorderRef.current?.resume();

    timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);

    setState("recording");
  };

  const stop = () => {
    clearInterval(timerRef.current);
    recorderRef.current?.stop();
  };

  const reRecord = () => {
    if (url) URL.revokeObjectURL(url);

    setBlob(null);
    setUrl(null);
    setState("idle");
    setElapsed(0);
  };

  const submit = () => {
    if (blob) onSubmit(blob, elapsed);
  };

  const fmt = (s) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div
      className="
        rounded-2xl
        border
        border-brand-500/20

        bg-white/80
        p-4

        shadow-glass
        backdrop-blur-xl

        dark:border-white/10
        dark:bg-ink-900/70
      "
    >
      {error && (
        <div
          className="
            mb-3
            rounded-xl
            border
            border-alert-500/20

            bg-alert-500/10

            px-3
            py-2

            text-sm
            font-medium
            text-alert-600

            dark:text-alert-300
          "
        >
          {error}
        </div>
      )}

      {state === "idle" && (
        <Button
          type="button"
          onClick={start}
          variant="secondary"
          size="sm"
          className="
            border-brand-500/30
            bg-gradient-to-r
            from-brand-500/10
            to-accent-500/10

            hover:shadow-glass
          "
        >
          <Mic size={15} />
          Start Recording
        </Button>
      )}

      {(state === "recording" || state === "paused") && (
        <div
          className="
            flex
            flex-wrap
            items-center
            gap-3
          "
        >
          <span
            className={`
              h-3 w-3
              rounded-full

              ${
                state === "recording"
                  ? "animate-pulse bg-gradient-to-r from-blue-500 to-purple-500"
                  : "bg-ink-900/30 dark:bg-white/30"
              }
            `}
          />

          <span
            className="
              rounded-lg
              bg-brand-500/10
              px-3
              py-1

              font-data
              text-sm
              font-semibold

              text-brand-700

              dark:text-brand-300
            "
          >
            {fmt(elapsed)}
          </span>

          {state === "recording" ? (
            <Button type="button" size="sm" variant="secondary" onClick={pause}>
              <Pause size={13} />
              Pause
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={resume}
            >
              <Play size={13} />
              Resume
            </Button>
          )}

          <Button
            type="button"
            size="sm"
            onClick={stop}
            className="
              bg-gradient-to-r
              from-blue-600
              to-purple-600
              text-white
            "
          >
            <Square size={13} />
            Stop
          </Button>
        </div>
      )}

      {state === "review" && (
        <div
          className="
            flex
            flex-col
            gap-4
          "
        >
          <div
            className="
              rounded-xl
              border
              border-brand-500/20

              bg-gradient-to-r
              from-brand-500/5
              to-accent-500/5

              p-3
            "
          >
            <audio controls src={url} className="w-full" />
          </div>

          <div
            className="
              flex
              flex-wrap
              items-center
              gap-2
            "
          >
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={reRecord}
              disabled={submitting}
            >
              <RotateCcw size={13} />
              Re-record
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={submit}
              disabled={submitting}
              className="
                ml-auto

                bg-gradient-to-r
                from-blue-600
                via-purple-600
                to-violet-600

                text-white

                shadow-lg
                shadow-purple-500/20
              "
            >
              {submitting ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Send size={13} />
              )}

              {submitLabel}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
