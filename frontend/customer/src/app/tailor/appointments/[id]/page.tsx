import AppointmentDetailClient from './AppointmentDetailClient';

// Generate empty params for static export
export function generateStaticParams() {
    return [];
}

export default function AppointmentDetail({ params }: { params: { id: string } }) {
    return <AppointmentDetailClient id={params.id} />;
}
