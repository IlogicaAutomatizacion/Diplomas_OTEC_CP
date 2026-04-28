import { useEffect, useState } from "react"

export default function EditableText({
    text,
    onChange,
    className = ""
}: {
    text: string | number,
    onChange: (value: string) => void,
    className?: string
}) {
    const [draft, setDraft] = useState(String(text ?? ''))

    useEffect(() => {
        setDraft(String(text ?? ''))
    }, [text])

    const isLongText =
        draft.includes('\n') ||
        String(text ?? '').includes('\n') ||
        draft.length > 80

    const baseClass = `
        mt-1
        block
        w-full
        rounded
        border
        border-slate-600
        bg-slate-900/60
        px-2
        py-1
        text-left
        outline-none
        ${className}
    `

    if (isLongText) {
        return (
            <textarea
                value={draft}
                dir="ltr"
                rows={3}
                className={`${baseClass} align-top resize-y`}
                onChange={(e) => {
                    const value = e.target.value
                    setDraft(value)
                    onChange(value)
                }}
            />
        )
    }

    return (
        <input
            type="text"
            value={draft}
            dir="ltr"
            className={`${baseClass} inline-block min-w-[12rem] max-w-full`}
            onChange={(e) => {
                const value = e.target.value
                setDraft(value)
                onChange(value)
            }}
        />
    )
}