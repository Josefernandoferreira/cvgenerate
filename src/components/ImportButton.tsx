import { useRef, useState, type DragEvent } from 'react'

type Props = {
  onFile: (file: File) => void
  busy?: boolean
  label?: string
  hint?: boolean
}

export function ImportButton({
  onFile,
  busy,
  label = 'Importar novo',
  hint = false,
}: Props) {
  const ref = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)

  function take(files: FileList | null) {
    const file = files?.[0]
    if (file) onFile(file)
  }

  function onDrag(e: DragEvent, active: boolean) {
    e.preventDefault()
    setOver(active)
  }

  return (
    <div className={`import-box ${over ? 'is-over' : ''} ${busy ? 'is-busy' : ''}`}>
      <input
        ref={ref}
        type="file"
        accept=".pdf,.zip,.json,application/pdf,application/zip,application/json"
        hidden
        onChange={(e) => {
          take(e.target.files)
          e.target.value = ''
        }}
      />
      <button
        type="button"
        className="btn solid"
        disabled={busy}
        onClick={() => ref.current?.click()}
      >
        {busy ? 'Lendo arquivo…' : label}
      </button>
      {hint && (
        <button
          type="button"
          className={`import-drop ${over ? 'is-over' : ''}`}
          onClick={() => ref.current?.click()}
          onDragOver={(e) => onDrag(e, true)}
          onDragLeave={(e) => onDrag(e, false)}
          onDrop={(e) => {
            onDrag(e, false)
            take(e.dataTransfer.files)
          }}
        >
          {busy ? 'Importando…' : 'Ou solte o PDF / ZIP aqui'}
        </button>
      )}
    </div>
  )
}
