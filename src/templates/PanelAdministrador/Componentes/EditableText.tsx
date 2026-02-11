
export default ({ text, lostFocusCallback }: {
    text: string,
    lostFocusCallback: (e: React.FocusEvent<HTMLSpanElement, Element>) => void
}) => {
    return <span suppressContentEditableWarning contentEditable={true} className="focus:outline-none" onBlur={lostFocusCallback}>
        {text}
    </span>
}