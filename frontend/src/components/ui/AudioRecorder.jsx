import { useEffect, useRef, useState } from 'react'
import { Mic, Pause, Play, Square, RotateCcw, Loader2, Send } from 'lucide-react'
import Button from './Button'

/**
 * Reusable voice recorder: record -> pause/resume -> stop -> review
 * (playback + re-record) -> submit. Used by the Debate Session page so a
 * learner can hear their own recording and re-record before it's ever sent
 * for transcription/analysis, per the platform's voice-recording spec.
 *
 * onSubmit(blob) is called only when the learner explicitly confirms —
 * nothing is uploaded automatically the moment recording stops.
 */
export default function AudioRecorder({ onSubmit, submitting, submitLabel = 'Submit Recording' }) {
  const [state, setState] = useState('idle') // idle | recording | paused | review
  const [blob, setBlob] = useState(null)
  const [url, setUrl] = useState(null)
  const [error, setError] = useState(null)
  const [elapsed, setElapsed] = useState(0)

  const recorderRef = useRef(null)
  const chunksRef = useRef([])
  const streamRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current)
      if (url) URL.revokeObjectURL(url)
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const start = async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      chunksRef.current = []
      const recorder = new MediaRecorder(stream)
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      recorder.onstop = () => {
        const recordedBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setBlob(recordedBlob)
        setUrl(URL.createObjectURL(recordedBlob))
        setState('review')
        streamRef.current?.getTracks().forEach((t) => t.stop())
      }
      recorderRef.current = recorder
      recorder.start()
      setElapsed(0)
      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000)
      setState('recording')
    } catch {
      setError('Microphone access was denied or is unavailable in this browser.')
    }
  }

  const pause = () => {
    recorderRef.current?.pause()
    clearInterval(timerRef.current)
    setState('paused')
  }
  const resume = () => {
    recorderRef.current?.resume()
    timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000)
    setState('recording')
  }
  const stop = () => {
    clearInterval(timerRef.current)
    recorderRef.current?.stop()
  }
  const reRecord = () => {
    if (url) URL.revokeObjectURL(url)
    setBlob(null)
    setUrl(null)
    setState('idle')
    setElapsed(0)
  }
  const submit = () => {
    if (blob) onSubmit(blob, elapsed)
  }

  const fmt = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-black/10 p-4 dark:border-white/15">
      {error && <p className="text-xs font-medium text-alert-500">{error}</p>}

      {state === 'idle' && (
        <Button type="button" onClick={start} variant="secondary" size="sm">
          <Mic size={15} /> Start Recording
        </Button>
      )}

      {(state === 'recording' || state === 'paused') && (
        <div className="flex items-center gap-3">
          <span className={`h-2.5 w-2.5 rounded-full ${state === 'recording' ? 'animate-pulse bg-alert-500' : 'bg-ink-900/30 dark:bg-white/30'}`} />
          <span className="font-data text-sm text-ink-900 dark:text-white">{fmt(elapsed)}</span>
          {state === 'recording' ? (
            <Button type="button" size="sm" variant="secondary" onClick={pause}><Pause size={13} /> Pause</Button>
          ) : (
            <Button type="button" size="sm" variant="secondary" onClick={resume}><Play size={13} /> Resume</Button>
          )}
          <Button type="button" size="sm" onClick={stop}><Square size={13} /> Stop</Button>
        </div>
      )}

      {state === 'review' && (
        <div className="flex flex-col gap-3">
          <audio controls src={url} className="w-full" />
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={reRecord} disabled={submitting}>
              <RotateCcw size={13} /> Re-record
            </Button>
            <Button type="button" size="sm" onClick={submit} disabled={submitting} className="ml-auto">
              {submitting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />} {submitLabel}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
