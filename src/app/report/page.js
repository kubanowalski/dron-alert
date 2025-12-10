import IncidentForm from "@/components/IncidentForm";

/**
 * Strona Zgłaszania Incydentu
 * Wyświetla formularz, w którym użytkownik może opisać, co się stało.
 */
export default function ReportPage() {
    return (
        <div>
            <h1 className="mb-xl">Nowe zgłoszenie</h1>
            <IncidentForm />
        </div>
    );
}
