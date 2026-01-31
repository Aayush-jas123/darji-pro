// This page is intentionally simple for static export compatibility
// Dynamic appointment viewing will be handled client-side in the main tailor dashboard

export async function generateStaticParams() {
    return [];
}

export default function AppointmentDetailsPlaceholder() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Appointment Details</h1>
                <p className="text-gray-600 mb-4">Please access appointment details from the Tailor Dashboard</p>
                <a href="/tailor" className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 inline-block">
                    Go to Dashboard
                </a>
            </div>
        </div>
    );
}
