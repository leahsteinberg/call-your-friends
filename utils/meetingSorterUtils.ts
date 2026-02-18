export function sameDay(a: Date, b: Date): boolean {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

export function getDayLabel(date: Date): string {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (sameDay(date, today)) return "Today";
    if (sameDay(date, tomorrow)) return "Tomorrow";
    if (sameDay(date, yesterday)) return "Yesterday";

    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    });
}

export function getDateKey(dateString: string): string {
    const d = new Date(dateString);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}
