import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with client-side components
const App = dynamic(() => import('../../App'), { ssr: false });

export default function TerminalPage() {
  return <App />;
}
