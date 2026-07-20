import { Metadata } from 'next';
import VdrClient from './VdrClient';

export const metadata: Metadata = {
  title: 'Secure Document Viewer - Virtual Data Room',
  description: 'Confidential document viewer with DLP protections.',
  robots: 'noindex, nofollow',
};

export default function VdrPage({ params }: { params: { token: string } }) {
  return <VdrClient token={params.token} />;
}
